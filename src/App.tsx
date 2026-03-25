import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, TrendingUp, History, Info, Trophy, ArrowLeft, Settings, RefreshCw, Database, Calendar, X } from 'lucide-react';
import { KoreaMap } from './components/KoreaMap';
import { KOREAN_REGIONS, CURRENT_ROUND as INITIAL_ROUND, RegionData, LATEST_WINNING_NUMBERS as INITIAL_WINNING_NUMBERS } from './constants';
import { cn } from './lib/utils';
import { db, auth } from './firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentRound, setCurrentRound] = useState(INITIAL_ROUND);
  const [regions, setRegions] = useState<RegionData[]>(KOREAN_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedSubRegionId, setSelectedSubRegionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [winningStores, setWinningStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('ai_access_token'));
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (user.email === "tasaer15@gmail.com") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        // Sync with server
        try {
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoUrl: user.photoURL
            })
          });
          const data = await res.json();
          if (data.accessToken) {
            setAccessToken(data.accessToken);
            localStorage.setItem('ai_access_token', data.accessToken);
          }
          if (data.user) {
            setUserProfile(data.user);
          }
        } catch (err) {
          console.error("Sync failed:", err);
        }
      } else {
        setIsAdmin(false);
        setUserProfile(null);
        setAccessToken(null);
        localStorage.removeItem('ai_access_token');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.currentRound) {
        setCurrentRound(data.currentRound);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.winningStores) {
        setWinningStores(data.winningStores);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Real-time config and stats
  useEffect(() => {
    const path = "config/global";
    const unsubConfig = onSnapshot(doc(db, "config", "global"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCurrentRound(data.currentRound);
      }
    }, (error) => {
      handleFirestoreError(error, "get", path);
    });

    const unsubStats = onSnapshot(collection(db, "regionStats"), (snapshot) => {
      const newStats: Record<string, any> = {};
      snapshot.forEach((doc) => {
        newStats[doc.id] = doc.data();
      });
      setStats(prev => ({ ...prev, ...newStats }));
    }, (error) => {
      handleFirestoreError(error, "list", "regionStats");
    });

    const unsubStores = onSnapshot(collection(db, "winningStores"), (snapshot) => {
      const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWinningStores(stores);
    }, (error) => {
      handleFirestoreError(error, "list", "winningStores");
    });

    setLoading(false);

    return () => {
      unsubConfig();
      unsubStats();
      unsubStores();
    };
  }, []);

  const handleFirestoreError = (error: any, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleAiRequest = async () => {
    if (!accessToken || !user) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          prompt: "오늘의 로또 명당 추천 이유를 3줄로 설명해줘."
        })
      });
      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
        // Refresh profile to update balance
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: user.uid,
            email: user.email
          })
        });
        const syncData = await syncRes.json();
        if (syncData.user) setUserProfile(syncData.user);
      } else if (data.code === "INSUFFICIENT_BALANCE") {
        alert("토큰이 부족합니다. 충전이 필요합니다.");
      }
    } catch (err) {
      console.error("AI request failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/purchase/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          productId,
          purchaseToken: "simulated_token_" + Date.now()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("구매 성공! 토큰이 충전되었습니다.");
        // Refresh profile
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: user.uid,
            email: user.email
          })
        });
        const syncData = await syncRes.json();
        if (syncData.user) setUserProfile(syncData.user);
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const seedData = async () => {
    if (!isAdmin) return;
    const path = "rounds";
    try {
      const historicalData = [
        { round: 1165, numbers: [1, 12, 18, 24, 35, 42], bonus: 10 },
        { round: 1164, numbers: [5, 11, 20, 28, 33, 45], bonus: 3 },
        { round: 1163, numbers: [3, 14, 21, 29, 37, 41], bonus: 15 },
        { round: 1162, numbers: [7, 10, 22, 31, 38, 44], bonus: 2 },
        { round: 1161, numbers: [2, 13, 19, 25, 36, 43], bonus: 8 },
        { round: 1160, numbers: [2, 10, 14, 22, 32, 36], bonus: 41 },
        { round: 1159, numbers: [5, 14, 19, 30, 31, 40], bonus: 11 },
        { round: 1158, numbers: [1, 11, 13, 22, 37, 42], bonus: 3 },
        { round: 1157, numbers: [8, 13, 14, 17, 27, 43], bonus: 11 },
        { round: 1156, numbers: [10, 11, 21, 25, 38, 45], bonus: 7 },
        { round: 1155, numbers: [4, 12, 16, 25, 31, 45], bonus: 13 },
        { round: 1154, numbers: [6, 12, 17, 21, 32, 39], bonus: 30 },
        { round: 1153, numbers: [1, 12, 16, 24, 34, 43], bonus: 10 },
        { round: 1152, numbers: [11, 20, 26, 36, 42, 43], bonus: 7 },
        { round: 1151, numbers: [1, 4, 12, 26, 36, 44], bonus: 38 },
        { round: 1150, numbers: [10, 11, 18, 21, 35, 43], bonus: 14 },
        { round: 1149, numbers: [5, 13, 17, 26, 34, 43], bonus: 2 },
        { round: 1148, numbers: [3, 11, 15, 22, 37, 41], bonus: 9 },
        { round: 1147, numbers: [7, 10, 19, 35, 41, 44], bonus: 1 },
        { round: 1146, numbers: [6, 11, 17, 19, 40, 43], bonus: 28 },
        { round: 1145, numbers: [2, 11, 31, 33, 37, 44], bonus: 32 },
        { round: 1144, numbers: [3, 4, 12, 15, 26, 34], bonus: 6 },
        { round: 1143, numbers: [10, 16, 17, 27, 28, 36], bonus: 6 },
        { round: 1142, numbers: [2, 8, 28, 30, 37, 41], bonus: 22 },
        { round: 1141, numbers: [7, 11, 12, 21, 26, 35], bonus: 20 },
        { round: 1140, numbers: [7, 10, 22, 29, 31, 38], bonus: 15 },
        { round: 1139, numbers: [5, 12, 15, 30, 37, 40], bonus: 14 },
        { round: 1138, numbers: [14, 16, 19, 20, 29, 34], bonus: 35 },
        { round: 1137, numbers: [4, 9, 12, 15, 19, 45], bonus: 28 },
        { round: 1136, numbers: [21, 33, 35, 38, 42, 44], bonus: 1 },
        { round: 1135, numbers: [1, 6, 13, 19, 21, 33], bonus: 4 },
        { round: 1134, numbers: [3, 7, 9, 13, 19, 21], bonus: 35 },
        { round: 1133, numbers: [13, 14, 20, 28, 29, 34], bonus: 23 },
        { round: 1132, numbers: [6, 7, 19, 28, 34, 41], bonus: 5 },
        { round: 1131, numbers: [1, 2, 6, 14, 27, 38], bonus: 33 },
        { round: 1130, numbers: [15, 19, 21, 25, 27, 28], bonus: 40 },
        { round: 1129, numbers: [5, 10, 11, 17, 28, 34], bonus: 22 },
        { round: 1128, numbers: [1, 5, 8, 16, 28, 33], bonus: 45 },
        { round: 1127, numbers: [13, 19, 21, 24, 34, 35], bonus: 18 },
        { round: 1126, numbers: [4, 5, 9, 11, 37, 40], bonus: 43 },
        { round: 1125, numbers: [6, 14, 25, 33, 40, 44], bonus: 30 },
        { round: 1124, numbers: [3, 8, 17, 30, 33, 34], bonus: 28 },
        { round: 1123, numbers: [13, 16, 18, 20, 42, 45], bonus: 41 },
        { round: 1122, numbers: [3, 6, 21, 30, 34, 35], bonus: 22 },
        { round: 1121, numbers: [6, 24, 31, 32, 38, 44], bonus: 8 },
        { round: 1120, numbers: [2, 19, 26, 31, 38, 41], bonus: 11 },
        { round: 1119, numbers: [1, 9, 12, 13, 20, 45], bonus: 3 },
        { round: 1118, numbers: [11, 13, 14, 15, 16, 45], bonus: 3 },
        { round: 1117, numbers: [3, 4, 9, 30, 33, 36], bonus: 7 },
        { round: 1116, numbers: [15, 16, 17, 20, 31, 45], bonus: 41 },
        { round: 1115, numbers: [7, 12, 23, 32, 34, 36], bonus: 22 },
        { round: 1114, numbers: [10, 16, 19, 32, 33, 38], bonus: 22 },
        { round: 1113, numbers: [11, 13, 20, 21, 32, 44], bonus: 8 },
        { round: 1112, numbers: [16, 20, 26, 36, 42, 44], bonus: 24 },
        { round: 1111, numbers: [3, 13, 30, 33, 43, 45], bonus: 4 },
        { round: 1110, numbers: [3, 7, 11, 20, 22, 41], bonus: 24 },
      ];

      for (const r of historicalData) {
        await setDoc(doc(db, path, r.round.toString()), r);
      }
      await setDoc(doc(db, "config", "global"), { currentRound: 1165, lastUpdated: new Date().toISOString() });

      // Sync region stats from constants
      for (const region of regions) {
        await setDoc(doc(db, "regionStats", region.id), {
          regionId: region.id,
          winPoints: region.winPoints,
          lastWinRound: region.lastWinRound
        });
        if (region.subRegions) {
          for (const sr of region.subRegions) {
            await setDoc(doc(db, "regionStats", sr.id), {
              regionId: sr.id,
              winPoints: sr.winPoints,
              lastWinRound: sr.lastWinRound
            });
            if (sr.dongs) {
              for (const d of sr.dongs) {
                await setDoc(doc(db, "regionStats", d.id), {
                  regionId: d.id,
                  winPoints: d.winPoints,
                  lastWinRound: d.lastWinRound
                });
              }
            }
          }
        }
      }

      // Seed some sample winning stores
      const sampleStores = [
        { 
          name: "잠실매점", 
          winRound: 1165, 
          latitude: 37.5133, 
          longitude: 127.1001, 
          address: "서울 송파구 올림픽로 265",
          city: "서울특별시",
          district: "송파구",
          winDate: "2025-03-22",
          storeType: "편의점",
          memo: "1등 당첨 명당",
          updatedAt: new Date().toISOString()
        },
        { 
          name: "강남복권", 
          winRound: 1164, 
          latitude: 37.4979, 
          longitude: 127.0276, 
          address: "서울 강남구 강남대로 396",
          city: "서울특별시",
          district: "강남구",
          winDate: "2025-03-15",
          storeType: "복권방",
          memo: "역세권 대박집",
          updatedAt: new Date().toISOString()
        },
        { 
          name: "부산명당", 
          winRound: 1165, 
          latitude: 35.1796, 
          longitude: 129.0756, 
          address: "부산 연제구 중앙대로 1001",
          city: "부산광역시",
          district: "연제구",
          winDate: "2025-03-22",
          storeType: "가판대",
          memo: "부산 1등 최다 배출",
          updatedAt: new Date().toISOString()
        },
        { 
          name: "수원행운", 
          winRound: 1163, 
          latitude: 37.2636, 
          longitude: 127.0286, 
          address: "경기 수원시 팔달구 효원로 241",
          city: "경기도",
          district: "수원시",
          winDate: "2025-03-08",
          storeType: "편의점",
          memo: "경기 남부 핫플레이스",
          updatedAt: new Date().toISOString()
        },
        { 
          name: "인천대박", 
          winRound: 1162, 
          latitude: 37.4563, 
          longitude: 126.7052, 
          address: "인천 남동구 정각로 29",
          city: "인천광역시",
          district: "남동구",
          winDate: "2025-03-01",
          storeType: "복권방",
          memo: "인천 시청 근처",
          updatedAt: new Date().toISOString()
        }
      ];

      for (const store of sampleStores) {
        const storeId = `store_${store.winRound}_${store.name}`;
        await setDoc(doc(db, "winningStores", storeId), store);
      }

      alert("Data and Stats seeded successfully!");
      fetchStats();
    } catch (error) {
      handleFirestoreError(error, "write", path);
    }
  };

  const handleRegionSelect = (regionId: string | null, subRegionId?: string | null) => {
    setSelectedRegionId(regionId);
    setSelectedSubRegionId(subRegionId || null);
  };

  const selectedRegion = useMemo(() => {
    return regions.find(r => r.id === selectedRegionId);
  }, [regions, selectedRegionId]);

  const selectedSubRegion = useMemo(() => {
    if (!selectedRegion || !selectedSubRegionId) return null;
    const parts = selectedSubRegionId.split(' ');
    const munName = parts[0];
    // Use flexible matching consistent with KoreaMap
    return selectedRegion.subRegions?.find(sr => 
      sr.nameKr === munName || munName.includes(sr.nameKr) || sr.nameKr.includes(munName)
    );
  }, [selectedRegion, selectedSubRegionId]);

  const selectedDong = useMemo(() => {
    if (!selectedSubRegion || !selectedSubRegionId) return null;
    const parts = selectedSubRegionId.split(' ');
    if (parts.length < 2) return null;
    const dongName = parts[1];
    return selectedSubRegion.dongs?.find(d => 
      d.nameKr === dongName || dongName.includes(d.nameKr) || d.nameKr.includes(dongName)
    );
  }, [selectedSubRegion, selectedSubRegionId]);

  const currentDetailStats = useMemo(() => {
    const item = selectedDong || selectedSubRegion || selectedRegion;
    if (!item) return null;
    const s = stats[item.id] || {};
    return {
      lastWinRound: s.lastWinRound || item.lastWinRound,
      winPoints: s.winPoints || item.winPoints || 0,
    };
  }, [selectedDong, selectedSubRegion, selectedRegion, stats]);

  const leaderboardData = useMemo(() => {
    // 1. Dong Level: If a sub-region (municipality) is selected, show its dongs
    if (selectedSubRegionId) {
      if (selectedSubRegion && selectedSubRegion.dongs) {
        return selectedSubRegion.dongs.map(d => {
          const s = stats[d.id] || {};
          return {
            id: d.id,
            nameKr: d.nameKr,
            name: d.nameKr,
            lastWinRound: s.lastWinRound || d.lastWinRound,
            winPoints: s.winPoints || d.winPoints || 0,
            type: 'dong' as const
          };
        });
      }
      return [];
    }

    // 2. Municipality Level: If a region (province) is selected, show its sub-regions
    if (selectedRegionId) {
      if (selectedRegion && selectedRegion.subRegions) {
        return selectedRegion.subRegions.map(sr => {
          const s = stats[sr.id] || {};
          return {
            id: sr.id,
            nameKr: sr.nameKr,
            name: sr.name,
            lastWinRound: s.lastWinRound || sr.lastWinRound,
            winPoints: s.winPoints || sr.winPoints || 0,
            type: 'subRegion' as const
          };
        });
      }
      return [];
    }

    // 3. National Level: Show provinces
    return regions.map(r => {
      const regionStat = stats[r.id] || {};
      return {
        id: r.id,
        nameKr: r.nameKr,
        name: r.name,
        lastWinRound: regionStat.lastWinRound || r.lastWinRound,
        winPoints: regionStat.winPoints || r.winPoints || 0,
        type: 'region' as const
      };
    });
  }, [regions, selectedRegion, selectedSubRegion, selectedRegionId, selectedSubRegionId, stats]);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboardData].sort((a, b) => a.lastWinRound - b.lastWinRound);
  }, [leaderboardData]);

  const goBack = () => {
    if (selectedSubRegionId && selectedSubRegionId.includes(' ')) {
      // From dong to subRegion
      setSelectedSubRegionId(selectedSubRegionId.split(' ')[0]);
    } else if (selectedSubRegionId) {
      // From subRegion to region
      setSelectedSubRegionId(null);
    } else if (selectedRegionId) {
      // From region to national
      setSelectedRegionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-slate-900 focus:p-4 focus:rounded-xl focus:shadow-lg focus:m-4 focus:text-indigo-400 focus:font-bold">
        본문 바로가기 (Skip to Content)
      </a>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">로또맵 Pro</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">AI 당첨 예측 시스템</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-indigo-400">
                    {userProfile.freeTokenBalance + userProfile.paidTokenBalance} Tokens
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{userProfile.planType} Plan</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-white text-slate-950 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* AI Section */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Database className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">AI 분석 리포트</h2>
                  <p className="text-sm text-slate-400">개인화된 당첨 전략 가이드</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePurchase("token_pack_100")}
                  className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-600/30 hover:bg-indigo-600/30 transition-colors"
                >
                  토큰 충전
                </button>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 min-h-[100px] mb-4">
              {isAiLoading ? (
                <div className="flex items-center justify-center h-full py-8">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : aiResponse ? (
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{aiResponse}</p>
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-8">분석 버튼을 눌러 AI 가이드를 받아보세요.</p>
              )}
            </div>

            <button 
              onClick={handleAiRequest}
              disabled={isAiLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              {isAiLoading ? "분석 중..." : "AI 분석 시작 (1 Token)"}
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Visualization */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4" aria-labelledby="map-section-title">
          <div className="bg-card p-4 rounded-3xl border border-border shadow-sm h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 id="map-section-title" className="font-bold flex items-center gap-2 text-foreground">
                <MapPin size={18} className="text-primary" aria-hidden="true" />
                전국 당첨 예상 지역 맵
              </h2>
              <div className="text-xs text-muted-foreground font-medium italic">
                * 색상이 짙을수록 당첨 확률이 높습니다 (명도 대비 및 패턴 적용)
              </div>
            </div>
            <div className="flex-1 relative">
              <KoreaMap 
                onRegionSelect={handleRegionSelect} 
                selectedRegionId={selectedRegionId} 
                selectedSubRegionId={selectedSubRegionId}
                stats={stats}
                currentRound={currentRound}
                winningStores={winningStores}
                onStoreSelect={setSelectedStore}
              />
            </div>
          </div>

          {/* Store Detail Modal */}
          {selectedStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedStore.name}</h3>
                      <p className="text-sm text-slate-400">{selectedStore.storeType}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedStore(null)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm">{selectedStore.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm">{selectedStore.winRound}회 당첨 ({selectedStore.winDate})</span>
                    </div>
                    {selectedStore.memo && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-sm italic text-slate-400">"{selectedStore.memo}"</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedStore(null)}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Right: Region Ranking & Details */}
        <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6" aria-label="지역별 상세 정보 및 순위">
          {/* Selected Region Detail */}
          <AnimatePresence mode="wait">
            {selectedRegion ? (
              <motion.div 
                key={selectedSubRegionId ? `${selectedRegion.id}-${selectedSubRegionId}` : selectedRegion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card p-6 rounded-3xl border-2 border-primary shadow-xl shadow-primary/5"
                role="region"
                aria-labelledby="detail-title"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 id="detail-title" className="text-2xl font-black text-foreground">
                      {selectedDong 
                        ? `${selectedRegion.nameKr} ${selectedSubRegion?.nameKr} ${selectedDong.nameKr}` 
                        : selectedSubRegion 
                          ? `${selectedRegion.nameKr} ${selectedSubRegion.nameKr}` 
                          : selectedRegion.nameKr}
                    </h2>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                      {selectedSubRegion ? `${selectedRegion.name} ${selectedSubRegion.name}` : selectedRegion.name}
                    </p>
                  </div>
                  <div className="bg-primary/10 text-primary p-2 rounded-xl" aria-hidden="true">
                    <Trophy size={24} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground font-bold">현재 예측 확률</span>
                    <span className="text-3xl font-black text-primary" aria-label={`예측 확률 ${currentDetailStats ? ((currentRound - currentDetailStats.lastWinRound) * 0.1).toFixed(1) : '0.0'}`}>
                      {currentDetailStats ? ((currentRound - currentDetailStats.lastWinRound) * 0.1).toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentDetailStats ? Math.min(100, (currentRound - currentDetailStats.lastWinRound) * 10) : 0} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${currentDetailStats ? Math.min(100, (currentRound - currentDetailStats.lastWinRound) * 10) : 0}%` 
                      }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between text-sm">
                    <span className="text-muted-foreground font-bold">마지막 당첨 회차</span>
                    <span className="font-black text-foreground">{currentDetailStats?.lastWinRound}회</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-bold">미당첨 기간</span>
                    <span className="font-black text-foreground">{currentDetailStats ? currentRound - currentDetailStats.lastWinRound : 0}회차 연속</span>
                  </div>
                  {currentDetailStats?.winPoints !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">누적 당첨점</span>
                      <span className="font-black text-primary">{currentDetailStats.winPoints}개소</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-muted/30 p-6 rounded-3xl border border-dashed border-border text-center py-12" role="status">
                <MapPin className="mx-auto text-muted-foreground/50 mb-2" size={32} aria-hidden="true" />
                <p className="text-muted-foreground text-sm font-bold">지도의 지역을 선택하여<br/>상세 정보를 확인하세요</p>
              </div>
            )}
          </AnimatePresence>

          {/* Ranking List */}
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col" aria-labelledby="ranking-title">
            <div className="p-4 border-b border-border bg-muted/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(selectedRegionId || selectedSubRegionId) && (
                    <button 
                      onClick={goBack}
                      className="p-2 hover:bg-muted rounded-xl transition-colors text-foreground border border-border bg-card"
                      aria-label="이전 단계로 돌아가기"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <h3 id="ranking-title" className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    {selectedSubRegion ? `${selectedSubRegion.nameKr} 동별 순위` : 
                     selectedRegion ? `${selectedRegion.nameKr} 구/시별 순위` : 
                     `전국 지역별 순위`}
                  </h3>
                </div>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-foreground font-bold" aria-label={`총 ${sortedLeaderboard.length}개 지역`}>
                  TOP {sortedLeaderboard.length}
                </span>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] flex-1" role="list" aria-label="지역 순위 리스트">
              {sortedLeaderboard.length > 0 ? (
                sortedLeaderboard.map((item, index) => {
                  const prob = (currentRound - item.lastWinRound) * 0.1;
                  const isSelected = 
                    (item.type === 'region' && selectedRegionId === item.id && !selectedSubRegionId) ||
                    (item.type === 'subRegion' && selectedSubRegionId === item.nameKr) ||
                    (item.type === 'dong' && selectedSubRegionId?.endsWith(item.nameKr));

                  return (
                    <div
                      key={`${item.type}-${item.id}-${index}`}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 border-b border-border last:border-0 transition-colors cursor-pointer hover:bg-muted/20",
                        isSelected && "bg-primary/10 ring-2 ring-primary ring-inset"
                      )}
                      onClick={() => {
                        if (item.type === 'region') handleRegionSelect(item.id);
                        else if (item.type === 'subRegion') handleRegionSelect(selectedRegionId, item.nameKr);
                        else if (item.type === 'dong') handleRegionSelect(selectedRegionId, `${selectedSubRegion?.nameKr} ${item.nameKr}`);
                      }}
                      role="listitem"
                      aria-current={isSelected ? 'true' : undefined}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                        index < 3 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                      )} aria-label={`${index + 1}위`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm text-foreground">{item.nameKr}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">{item.name}</div>
                        {item.winPoints > 0 && (
                          <div className="text-[9px] text-primary font-bold">당첨점: {item.winPoints}</div>
                        )}
                      </div>
                      <div className="text-right" aria-label={`예측 확률 ${prob.toFixed(1)}`}>
                        <div className="font-black text-foreground">{prob.toFixed(1)}</div>
                        <div className="text-[10px] text-muted-foreground font-bold">PROB</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center" role="status">
                  <Info className="w-8 h-8 text-muted/50 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground font-bold">해당 지역의 상세 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-8 text-center text-muted-foreground text-xs border-t border-border mt-12" role="contentinfo">
        <p>© 2026 LottoMap Korea. All prediction data is based on statistical patterns and does not guarantee actual winning results.</p>
        <p className="mt-2 font-bold">Designed for Google Play Market - Mobile Responsive Interface (KWCAG 2.1 Compliant)</p>
      </footer>
    </div>
  );
}

