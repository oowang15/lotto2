import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { KOREAN_REGIONS, CURRENT_ROUND, RegionData } from '../constants';
import { cn } from '../lib/utils';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface KoreaMapProps {
  onRegionSelect: (regionId: string | null, subRegionId?: string | null) => void;
  selectedRegionId: string | null;
  selectedSubRegionId: string | null;
  stats?: Record<string, any>;
  currentRound?: number;
  winningStores?: any[];
  onStoreSelect?: (store: any) => void;
}

export const KoreaMap: React.FC<KoreaMapProps> = ({ 
  onRegionSelect, 
  selectedRegionId,
  selectedSubRegionId,
  stats = {},
  currentRound = 1165,
  winningStores = [],
  onStoreSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [nationalData, setNationalData] = useState<any>(null);
  const [municipalData, setMunicipalData] = useState<any>(null);
  const [subMunicipalData, setSubMunicipalData] = useState<any>(null);
  const [viewLevel, setViewLevel] = useState<'national' | 'province' | 'municipality'>('national');
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [activeMunicipality, setActiveMunicipality] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    
    console.log('Attaching ResizeObserver to container');
    
    const measure = () => {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    measure();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(target);
    return () => resizeObserver.disconnect();
  }, []);

  const provinceIdMap: Record<string, string> = {
    '서울특별시': 'seoul', '부산광역시': 'busan', '대구광역시': 'daegu', '인천광역시': 'incheon',
    '광주광역시': 'gwangju', '대전광역시': 'daejeon', '울산광역시': 'ulsan', '세종특별자치시': 'sejong',
    '경기도': 'gyeonggi', '강원도': 'gangwon', '충청북도': 'chungbuk', '충청남도': 'chungnam',
    '전라북도': 'jeonbuk', '전라남도': 'jeonnam', '경상북도': 'gyeongbuk', '경상남도': 'gyeongnam', '제주특별자치도': 'jeju',
    '서울': 'seoul', '경기': 'gyeonggi', '강원': 'gangwon', '충북': 'chungbuk', '충남': 'chungnam',
    '전북': 'jeonbuk', '전남': 'jeonnam', '경북': 'gyeongbuk', '경남': 'gyeongnam', '제주': 'jeju'
  };

  useEffect(() => {
    if (selectedRegionId) {
      const provinceEntry = Object.entries(provinceIdMap).find(([name, id]) => id === selectedRegionId);
      if (provinceEntry) {
        setActiveProvince(provinceEntry[0]);
        if (selectedSubRegionId) {
          const parts = selectedSubRegionId.split(' ');
          setActiveMunicipality(parts[0]);
          setViewLevel('municipality');
        } else {
          setActiveMunicipality(null);
          setViewLevel('province');
        }
      }
    } else {
      setViewLevel('national');
      setActiveProvince(null);
      setActiveMunicipality(null);
    }
  }, [selectedRegionId, selectedSubRegionId]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    
    // Using a more reliable CDN fallback or checking multiple sources if needed
    const fetchMapData = async () => {
      console.log('Starting map data fetch...');
      const urls = [
        'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_topo.json',
        'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_topo.json',
        'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_submunicipalities_topo.json'
      ];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const fetchData = async (url: string, isOptional = false) => {
          try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            return await res.json();
          } catch (err) {
            console.warn(`Failed to fetch ${url}:`, err);
            if (isOptional) return null;
            throw err;
          }
        };

        const [nat, mun, sub] = await Promise.all([
          fetchData('https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_topo.json'),
          fetchData('https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_topo.json'),
          fetchData('https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_submunicipalities_topo.json', true)
        ]);

        clearTimeout(timeoutId);
        console.log('Map data fetch successful', { hasNat: !!nat, hasMun: !!mun, hasSub: !!sub });

        if (isMounted) {
          if (!nat || !mun) throw new Error('Essential map data is missing');
          setNationalData(nat);
          setMunicipalData(mun);
          setSubMunicipalData(sub);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Map loading error:', err);
        if (isMounted) {
          setError(`지도 데이터를 불러오지 못했습니다: ${err instanceof Error ? err.message : '네트워크 오류'}`);
          setIsLoading(false);
        }
      }
    };

    fetchMapData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    console.log('Render useEffect triggered', {
      hasNationalData: !!nationalData,
      hasSvgRef: !!svgRef.current,
      width: dimensions.width,
      height: dimensions.height,
      viewLevel,
      isLoading
    });

    if (!nationalData || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    try {
      const svg = d3.select(svgRef.current);
      const { width, height } = dimensions;

      svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      svg.selectAll('*').remove();

      const projection = d3.geoMercator()
        .center([127.5, 36])
        .scale(Math.min(width, height) * 10)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);
      const colorScale = d3.scaleLinear<string>()
        .domain([0, 1, 2, 3, 4])
        .range([
          '#1e293b', // slate-800 (base dark)
          '#334155', // slate-700
          '#475569', // slate-600
          '#6366f1', // indigo-500 (active/high probability)
          '#4f46e5'  // indigo-600 (very high)
        ])
        .clamp(true);
      
      // Add patterns for accessibility
      const defs = svg.append('defs');
      
      defs.append('pattern')
        .attr('id', 'pattern-dots')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('circle')
        .attr('cx', 1)
        .attr('cy', 1)
        .attr('r', 1)
        .attr('fill', 'rgba(0,0,0,0.1)');

      const g = svg.append('g');

      if (viewLevel === 'national') {
        const objKey = Object.keys(nationalData.objects)[0];
        const provinces = topojson.feature(nationalData, nationalData.objects[objKey]) as any;
        
        projection.fitSize([width, height], provinces);
        
        g.selectAll('path')
          .data(provinces.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'cursor-pointer transition-all duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500')
          .attr('tabindex', '0')
          .attr('role', 'button')
          .attr('aria-label', (d: any) => {
            const name = d.properties.name;
            const regionId = provinceIdMap[name] || provinceIdMap[name.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === regionId);
            const s = stats[regionId] || {};
            const lastWinRound = s.lastWinRound || region?.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return `${name}, 예측 확률 ${prob.toFixed(1)}`;
          })
          .attr('fill', (d: any) => {
            const name = d.properties.name;
            const regionId = provinceIdMap[name] || provinceIdMap[name.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === regionId);
            if (!region) return '#eee';
            const s = stats[regionId] || {};
            const lastWinRound = s.lastWinRound || region.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return colorScale(prob);
          })
          .attr('stroke', '#334155')
          .attr('stroke-width', 1)
          .on('click', (event, d: any) => {
            const name = d.properties.name;
            const regionId = provinceIdMap[name] || provinceIdMap[name.substring(0, 2)];
            if (regionId) {
              onRegionSelect(regionId);
            }
          })
          .on('keydown', (event, d: any) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const name = d.properties.name;
              const regionId = provinceIdMap[name] || provinceIdMap[name.substring(0, 2)];
              if (regionId) onRegionSelect(regionId);
            }
          });

        g.selectAll('text')
          .data(provinces.features)
          .enter()
          .append('text')
          .attr('x', (d: any) => {
            const centroid = path.centroid(d);
            const name = d.properties.name;
            // Adjust Seoul/Incheon to prevent overlap
            if (name === '서울특별시') return centroid[0] + 10;
            if (name === '인천광역시') return centroid[0] - 15;
            return centroid[0];
          })
          .attr('y', (d: any) => {
            const centroid = path.centroid(d);
            const name = d.properties.name;
            if (name === '서울특별시') return centroid[1] - 8;
            if (name === '인천광역시') return centroid[1] + 15;
            return centroid[1];
          })
          .attr('text-anchor', 'middle')
          .attr('font-size', (d: any) => {
            const name = d.properties.name;
            if (name === '서울특별시' || name === '인천광역시' || name === '세종특별자치시') return '7px';
            return '11px';
          })
          .attr('font-weight', 'bold')
          .attr('fill', '#94a3b8')
          .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
          .attr('pointer-events', 'none')
          .text((d: any) => d.properties.name.substring(0, 2));

      } else if (viewLevel === 'province' && municipalData && activeProvince) {
        const munKey = Object.keys(municipalData.objects)[0];
        const allMunicipalities = topojson.feature(municipalData, municipalData.objects[munKey]) as any;
        
        const natKey = Object.keys(nationalData.objects)[0];
        const provinceFeature = (topojson.feature(nationalData, nationalData.objects[natKey]) as any)
          .features.find((f: any) => f.properties.name === activeProvince || f.properties.name.startsWith(activeProvince.substring(0, 2)));
        
        if (!provinceFeature) return;
        
        const provinceCode = provinceFeature.properties.code;
        const filteredFeatures = allMunicipalities.features.filter((f: any) => f.properties.code.startsWith(provinceCode.substring(0, 2)));

        projection.fitSize([width, height], { type: 'FeatureCollection', features: filteredFeatures } as any);

        g.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500')
          .attr('tabindex', '0')
          .attr('role', 'button')
          .attr('aria-label', (d: any) => {
            const provinceId = provinceIdMap[activeProvince] || provinceIdMap[activeProvince.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === provinceId);
            const subRegion = region?.subRegions?.find(sr => sr.nameKr === d.properties.name || d.properties.name.includes(sr.nameKr));
            const s = subRegion ? (stats[subRegion.id] || {}) : {};
            const lastWinRound = s.lastWinRound || subRegion?.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return `${d.properties.name}, 예측 확률 ${prob.toFixed(1)}`;
          })
          .attr('fill', (d: any) => {
            const provinceId = provinceIdMap[activeProvince] || provinceIdMap[activeProvince.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === provinceId);
            const subRegion = region?.subRegions?.find(sr => sr.nameKr === d.properties.name || d.properties.name.includes(sr.nameKr));
            const s = subRegion ? (stats[subRegion.id] || {}) : {};
            const lastWinRound = s.lastWinRound || subRegion?.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return colorScale(prob);
          })
          .attr('stroke', '#334155')
          .attr('stroke-width', 0.5)
          .on('click', (event, d: any) => {
            const provinceId = provinceIdMap[activeProvince] || provinceIdMap[activeProvince.substring(0, 2)];
            onRegionSelect(provinceId, d.properties.name);
          })
          .on('keydown', (event, d: any) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const provinceId = provinceIdMap[activeProvince] || provinceIdMap[activeProvince.substring(0, 2)];
              onRegionSelect(provinceId, d.properties.name);
            }
          });

        g.selectAll('text')
          .data(filteredFeatures)
          .enter()
          .append('text')
          .attr('x', (d: any) => path.centroid(d)[0])
          .attr('y', (d: any) => path.centroid(d)[1])
          .attr('text-anchor', 'middle')
          .attr('font-size', (d: any) => {
            const b = path.bounds(d);
            const w = b[1][0] - b[0][0];
            const h = b[1][1] - b[0][1];
            // Improved scaling with min/max limits
            let size = Math.min(w / d.properties.name.length, h) * 0.7;
            size = Math.min(Math.max(2, size), 14); // Max 14px, Min 2px
            return `${size}px`;
          })
          .attr('font-weight', 'bold')
          .attr('fill', '#fff')
          .style('text-shadow', '0.5px 0.5px 1px rgba(0,0,0,0.8)')
          .attr('pointer-events', 'none')
          .text((d: any) => d.properties.name);

      } else if (viewLevel === 'municipality' && subMunicipalData && activeMunicipality) {
        const subKey = Object.keys(subMunicipalData.objects)[0];
        const allDongs = topojson.feature(subMunicipalData, subMunicipalData.objects[subKey]) as any;
        
        const munKey = Object.keys(municipalData.objects)[0];
        const municipalityFeature = (topojson.feature(municipalData, municipalData.objects[munKey]) as any)
          .features.find((f: any) => f.properties.name === activeMunicipality || activeMunicipality.includes(f.properties.name));
        
        if (!municipalityFeature) return;
        
        const municipalityCode = municipalityFeature.properties.code;
        const filteredFeatures = allDongs.features.filter((f: any) => f.properties.code.startsWith(municipalityCode));

        if (filteredFeatures.length === 0) {
          setViewLevel('province');
          return;
        }

        projection.fitSize([width, height], { type: 'FeatureCollection', features: filteredFeatures } as any);

        g.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500')
          .attr('tabindex', '0')
          .attr('role', 'button')
          .attr('aria-label', (d: any) => {
            const provinceId = provinceIdMap[activeProvince!] || provinceIdMap[activeProvince!.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === provinceId);
            const subRegion = region?.subRegions?.find(sr => sr.nameKr === activeMunicipality || activeMunicipality.includes(sr.nameKr));
            const dong = subRegion?.dongs?.find(dong => dong.nameKr === d.properties.name);
            const s = dong ? (stats[dong.id] || {}) : {};
            const lastWinRound = s.lastWinRound || dong?.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return `${d.properties.name}, 예측 확률 ${prob.toFixed(1)}`;
          })
          .attr('fill', (d: any) => {
            const provinceId = provinceIdMap[activeProvince!] || provinceIdMap[activeProvince!.substring(0, 2)];
            const region = KOREAN_REGIONS.find(r => r.id === provinceId);
            const subRegion = region?.subRegions?.find(sr => sr.nameKr === activeMunicipality || activeMunicipality.includes(sr.nameKr));
            const dong = subRegion?.dongs?.find(dong => dong.nameKr === d.properties.name);
            const s = dong ? (stats[dong.id] || {}) : {};
            const lastWinRound = s.lastWinRound || dong?.lastWinRound || currentRound;
            const prob = Math.max(0, (currentRound - lastWinRound) * 0.1);
            return colorScale(prob);
          })
          .attr('stroke', '#334155')
          .attr('stroke-width', 0.2)
          .on('click', (event, d: any) => {
            const provinceId = provinceIdMap[activeProvince!] || provinceIdMap[activeProvince!.substring(0, 2)];
            onRegionSelect(provinceId, `${activeMunicipality} ${d.properties.name}`);
          })
          .on('keydown', (event, d: any) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const provinceId = provinceIdMap[activeProvince!] || provinceIdMap[activeProvince!.substring(0, 2)];
              onRegionSelect(provinceId, `${activeMunicipality} ${d.properties.name}`);
            }
          });

        g.selectAll('text')
          .data(filteredFeatures)
          .enter()
          .append('text')
          .attr('x', (d: any) => path.centroid(d)[0])
          .attr('y', (d: any) => path.centroid(d)[1])
          .attr('text-anchor', 'middle')
          .attr('font-size', (d: any) => {
            const b = path.bounds(d);
            const w = b[1][0] - b[0][0];
            const h = b[1][1] - b[0][1];
            // Dong level text should be smaller and more constrained
            let size = Math.min(w / d.properties.name.length, h) * 0.6;
            size = Math.min(Math.max(1.5, size), 8); // Max 8px for dongs
            return `${size}px`;
          })
          .attr('fill', '#fff')
          .style('text-shadow', '0.3px 0.3px 0.5px rgba(0,0,0,0.8)')
          .attr('pointer-events', 'none')
          .text((d: any) => d.properties.name);
      }

      // Add winning store markers
      if (winningStores && winningStores.length > 0) {
        const storeGroup = g.append('g').attr('class', 'store-markers');
        
        const markers = storeGroup.selectAll('.store-marker')
          .data(winningStores)
          .enter()
          .append('g')
          .attr('class', 'store-marker cursor-pointer')
          .attr('transform', (d: any) => {
            const lat = d.latitude || d.lat;
            const lng = d.longitude || d.lng;
            const coords = projection([lng, lat]);
            return coords ? `translate(${coords[0]}, ${coords[1]})` : null;
          })
          .on('click', (event: any, d: any) => {
            event.stopPropagation();
            if (onStoreSelect) onStoreSelect(d);
          });

        markers.append('circle')
          .attr('r', 5)
          .attr('fill', '#f59e0b') // amber-500
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .attr('class', 'animate-pulse shadow-lg');

        markers.append('circle')
          .attr('r', 12)
          .attr('fill', 'rgba(245, 158, 11, 0.2)')
          .attr('class', 'hover-ring opacity-0 transition-opacity')
          .on('mouseover', function() { d3.select(this).classed('opacity-100', true); })
          .on('mouseout', function() { d3.select(this).classed('opacity-100', false); });

        markers.append('title')
          .text((d: any) => `${d.name}\n${d.winRound || d.round}회 당첨`);
      }
    } catch (err) {
      console.error('D3 rendering error:', err);
      setError(`지도 렌더링 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }

  }, [nationalData, municipalData, subMunicipalData, viewLevel, activeProvince, activeMunicipality, selectedRegionId, selectedSubRegionId, isLoading]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-orange-500" size={32} />
          <p className="text-sm text-slate-500 font-medium">지도 데이터를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="text-center p-6">
          <p className="text-red-500 font-bold mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs bg-slate-200 px-3 py-1 rounded-full hover:bg-slate-300 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          role="img" 
          aria-label={`대한민국 로또 당첨 예측 지도 - 현재 ${viewLevel === 'national' ? '전국' : viewLevel === 'province' ? activeProvince : activeMunicipality} 보기`}
        />
      )}
      
      {!isLoading && !error && viewLevel !== 'national' && (
        <button 
          onClick={() => {
            if (viewLevel === 'municipality') onRegionSelect(selectedRegionId, null);
            else onRegionSelect(null, null);
          }}
          className="absolute top-4 left-4 bg-white shadow-lg border border-slate-300 p-2 rounded-full hover:bg-slate-50 transition-colors flex items-center gap-2 pr-4 text-sm font-bold text-slate-900"
          aria-label={viewLevel === 'municipality' ? '시/군/구 지도로 돌아가기' : '전국 지도로 돌아가기'}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {viewLevel === 'municipality' ? '시/군/구 지도로 돌아가기' : '전국 지도로 돌아가기'}
        </button>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-300 text-xs shadow-sm" role="complementary" aria-label="지도 범례">
        <div className="font-bold mb-2 text-slate-800">당첨 확률 (Probability)</div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 bg-gradient-to-r from-[#e0eef5] via-[#81c3e4] to-[#0f66bd] rounded-full border border-slate-300" aria-hidden="true" />
          <span className="text-slate-700 font-bold">0.0 → 1.5+</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-600 font-medium">
          * 색상이 짙을수록 미당첨 기간이 길어 당첨 확률이 높음
        </div>
      </div>
      
      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md border border-primary/20" role="status">
        {viewLevel === 'national' ? 'National View' : `Province: ${activeProvince}`}
      </div>
    </div>
  );
};

