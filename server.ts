import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase on server
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // Initialize Gemini AI
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  app.use(express.json());

  // API: Sync user data from Google Login
  app.post("/api/auth/sync", async (req, res) => {
    const { googleId, email, displayName, photoUrl } = req.body;
    if (!googleId || !email) return res.status(400).json({ error: "Missing user data" });

    try {
      const userRef = doc(db, "users", googleId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user: Grant initial free tokens
        const newUser = {
          id: googleId,
          googleId,
          email,
          displayName,
          photoUrl,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          planType: "free",
          freeTokenBalance: 100, // Initial grant
          paidTokenBalance: 0,
          status: "active"
        };
        await setDoc(userRef, newUser);
        
        // Issue internal access token
        const accessToken = crypto.randomBytes(32).toString("hex");
        await setDoc(doc(db, "accessTokens", accessToken), {
          userId: googleId,
          token: accessToken,
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          revoked: false
        });

        return res.json({ user: newUser, accessToken });
      } else {
        // Existing user: Update last login
        await updateDoc(userRef, { lastLoginAt: new Date().toISOString() });
        
        // Find or issue token
        const tokensRef = collection(db, "accessTokens");
        const q = query(tokensRef, orderBy("issuedAt", "desc"), limit(1));
        const tokenSnap = await getDocs(q);
        let accessToken = tokenSnap.docs[0]?.id;

        if (!accessToken) {
          accessToken = crypto.randomBytes(32).toString("hex");
          await setDoc(doc(db, "accessTokens", accessToken), {
            userId: googleId,
            token: accessToken,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            revoked: false
          });
        }

        res.json({ user: userSnap.data(), accessToken });
      }
    } catch (error) {
      handleFirestoreError(error, "write", "users");
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // API: AI Generation Proxy
  app.post("/api/ai/generate", async (req, res) => {
    const { accessToken, prompt } = req.body;
    if (!accessToken || !prompt) return res.status(400).json({ error: "Missing data" });

    try {
      // 1. Verify Access Token
      const tokenRef = doc(db, "accessTokens", accessToken);
      const tokenSnap = await getDoc(tokenRef);
      if (!tokenSnap.exists() || tokenSnap.data().revoked) {
        return res.status(401).json({ error: "Invalid or revoked token" });
      }
      const userId = tokenSnap.data().userId;

      // 2. Check Balance
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (!userData || (userData.freeTokenBalance + userData.paidTokenBalance) <= 0) {
        return res.status(403).json({ error: "Insufficient tokens", code: "INSUFFICIENT_BALANCE" });
      }

      // 3. Call AI (Gemini)
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const responseText = result.text || "AI analysis failed to generate a response.";

      // 4. Deduct Balance & Log Usage
      const cost = 1; // Simplified cost
      if (userData.freeTokenBalance >= cost) {
        await updateDoc(userRef, { freeTokenBalance: increment(-cost) });
      } else {
        await updateDoc(userRef, { paidTokenBalance: increment(-cost) });
      }

      await setDoc(doc(collection(db, "usageLogs")), {
        userId,
        requestType: "generate",
        tokenCost: cost,
        promptChars: prompt.length,
        responseChars: responseText.length,
        createdAt: new Date().toISOString(),
        status: "success"
      });

      res.json({ text: responseText });
    } catch (error) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // API: Verify Purchase
  app.post("/api/purchase/verify", async (req, res) => {
    const { userId, productId, purchaseToken } = req.body;
    // In real app, call Google Play Developer API to verify
    try {
      // Simulate verification
      const isValid = true; 
      if (isValid) {
        const userRef = doc(db, "users", userId);
        let tokenReward = 0;
        if (productId === "token_pack_100") tokenReward = 100;
        if (productId === "token_pack_500") tokenReward = 500;

        await updateDoc(userRef, { 
          paidTokenBalance: increment(tokenReward),
          planType: productId === "subscription_monthly" ? "premium" : "free"
        });

        await setDoc(doc(collection(db, "purchases")), {
          userId,
          productId,
          platform: "google_play",
          purchaseToken,
          status: "completed",
          purchasedAt: new Date().toISOString(),
          validatedAt: new Date().toISOString()
        });

        res.json({ success: true, newBalance: tokenReward });
      } else {
        res.status(400).json({ error: "Invalid purchase token" });
      }
    } catch (error) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // API: Get region stats and current round
  app.get("/api/stats", async (req, res) => {
    try {
      // Get current round
      const configRef = doc(db, "config", "global");
      const configSnap = await getDoc(configRef);
      const currentRound = configSnap.exists() ? configSnap.data().currentRound : 1160;

      // Get all region stats
      const statsRef = collection(db, "regionStats");
      const statsSnap = await getDocs(statsRef);
      const stats = statsSnap.docs.reduce((acc: any, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      // Get winning stores
      const storesRef = collection(db, "winningStores");
      const storesSnap = await getDocs(storesRef);
      const winningStores = storesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({ currentRound, stats, winningStores });
    } catch (error) {
      handleFirestoreError(error, "get", "stats");
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // API: Get predictions
  app.get("/api/predict", async (req, res) => {
    const path = "rounds";
    try {
      // Fetch historical rounds (last 50)
      const roundsRef = collection(db, path);
      const q = query(roundsRef, orderBy("round", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const rounds = snapshot.docs.map(doc => doc.data());

      if (rounds.length === 0) {
        return res.json({ prediction: [1, 2, 3, 4, 5, 6], bonus: 7, message: "No historical data available." });
      }

      // Simple probability calculation: Frequency analysis
      const frequency: Record<number, number> = {};
      rounds.forEach((r: any) => {
        r.numbers.forEach((n: number) => {
          frequency[n] = (frequency[n] || 0) + 1;
        });
      });

      // Sort by frequency and pick top 6
      const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(e => parseInt(e[0]));

      const prediction = sorted.slice(0, 6).sort((a, b) => a - b);
      const bonus = sorted[6] || 7;

      res.json({ prediction, bonus, lastRound: rounds[0].round });
    } catch (error) {
      handleFirestoreError(error, "get", path);
      res.status(500).json({ error: "Failed to calculate prediction" });
    }
  });

  function handleFirestoreError(error: any, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      serverTime: new Date().toISOString()
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  // API: Sync latest round (Admin only - simplified for now)
  app.post("/api/sync", async (req, res) => {
    // In a real app, we'd verify the admin token here
    const { round, numbers, bonus } = req.body;
    if (!round || !numbers || !bonus) {
      return res.status(400).json({ error: "Missing round data" });
    }

    const path = "rounds";
    try {
      await setDoc(doc(db, path, round.toString()), {
        round,
        numbers,
        bonus,
        timestamp: new Date().toISOString()
      });

      // Update global config
      await setDoc(doc(db, "config", "global"), {
        currentRound: round,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      res.json({ success: true });
    } catch (error) {
      handleFirestoreError(error, "write", path);
      res.status(500).json({ error: "Failed to sync round" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
