// Korean Travel Spots Geo Utility
// Multi-stage high-accuracy geocoding:
// 1. In-memory cache
// 2. Comprehensive Korean landmark dictionary (0ms)
// 3. Photon POI Geocoder (handles cafes, restaurants, bakeries, tourist spots)
// 4. OpenStreetMap Nominatim Geocoder (handles road addresses, administrative areas)
// 5. Context-aware regional & neighboring spots fallback (NEVER jumps to Seoul if trip is in Jeju/Busan/etc.)

const geoCache = new Map();

// Built-in pinpoint coordinates for Korean travel landmarks, tourist attractions, cafes, beaches, mountains & cities
export const KNOWN_LOCATIONS = {
  // ==================== 제주도 (Jeju) ====================
  '제주': { lat: 33.4996, lng: 126.5312 },
  '제주도': { lat: 33.4996, lng: 126.5312 },
  '제주시': { lat: 33.4996, lng: 126.5312 },
  '서귀포': { lat: 33.2541, lng: 126.5601 },
  '서귀포시': { lat: 33.2541, lng: 126.5601 },
  '협재': { lat: 33.3940, lng: 126.2397 },
  '협재해수욕장': { lat: 33.3940, lng: 126.2397 },
  '협재해변': { lat: 33.3940, lng: 126.2397 },
  '금능': { lat: 33.3905, lng: 126.2347 },
  '금능해수욕장': { lat: 33.3905, lng: 126.2347 },
  '금능해변': { lat: 33.3905, lng: 126.2347 },
  '함덕': { lat: 33.5434, lng: 126.6692 },
  '함덕해수욕장': { lat: 33.5434, lng: 126.6692 },
  '함덕해변': { lat: 33.5434, lng: 126.6692 },
  '월정리': { lat: 33.5564, lng: 126.7958 },
  '월정리해변': { lat: 33.5564, lng: 126.7958 },
  '월정리해수욕장': { lat: 33.5564, lng: 126.7958 },
  '김녕': { lat: 33.5576, lng: 126.7594 },
  '김녕해수욕장': { lat: 33.5576, lng: 126.7594 },
  '김녕해변': { lat: 33.5576, lng: 126.7594 },
  '세화': { lat: 33.5255, lng: 126.8524 },
  '세화해변': { lat: 33.5255, lng: 126.8524 },
  '세화해수욕장': { lat: 33.5255, lng: 126.8524 },
  '곽지': { lat: 33.4508, lng: 126.3056 },
  '곽지해수욕장': { lat: 33.4508, lng: 126.3056 },
  '곽지과물해변': { lat: 33.4508, lng: 126.3056 },
  '이호테우': { lat: 33.4984, lng: 126.4533 },
  '이호테우해수욕장': { lat: 33.4984, lng: 126.4533 },
  '이호테우해변': { lat: 33.4984, lng: 126.4533 },
  '표선': { lat: 33.3248, lng: 126.8373 },
  '표선해수욕장': { lat: 33.3248, lng: 126.8373 },
  '표선해비치해변': { lat: 33.3248, lng: 126.8373 },
  '성산일출봉': { lat: 33.4586, lng: 126.9427 },
  '우도': { lat: 33.5043, lng: 126.9542 },
  '우도봉': { lat: 33.4947, lng: 126.9602 },
  '검멀레해변': { lat: 33.4975, lng: 126.9632 },
  '서빈백사': { lat: 33.5057, lng: 126.9443 },
  '산호해수욕장': { lat: 33.5057, lng: 126.9443 },
  '섭지코지': { lat: 33.4243, lng: 126.9311 },
  '중문': { lat: 33.2483, lng: 126.4124 },
  '중문관광단지': { lat: 33.2483, lng: 126.4124 },
  '중문색달해변': { lat: 33.2450, lng: 126.4120 },
  '중문색달해수욕장': { lat: 33.2450, lng: 126.4120 },
  '오설록': { lat: 33.3059, lng: 126.2895 },
  '오설록티뮤지엄': { lat: 33.3059, lng: 126.2895 },
  '오설록 티뮤지엄': { lat: 33.3059, lng: 126.2895 },
  '이니스프리 제주하우스': { lat: 33.3068, lng: 126.2891 },
  '런던베이글뮤지엄': { lat: 33.5558, lng: 126.7118 },
  '런던베이글뮤지엄 제주': { lat: 33.5558, lng: 126.7118 },
  '런던베이글뮤지엄 제주점': { lat: 33.5558, lng: 126.7118 },
  '카멜리아힐': { lat: 33.2902, lng: 126.3697 },
  '천지연폭포': { lat: 33.2447, lng: 126.5595 },
  '천제연폭포': { lat: 33.2526, lng: 126.4184 },
  '정방폭포': { lat: 33.2449, lng: 126.5717 },
  '산방산': { lat: 33.2415, lng: 126.3135 },
  '용머리해안': { lat: 33.2323, lng: 126.3146 },
  '애월': { lat: 33.4654, lng: 126.3204 },
  '애월한담해변': { lat: 33.4619, lng: 126.3106 },
  '한담해변': { lat: 33.4619, lng: 126.3106 },
  '한담해안산책로': { lat: 33.4619, lng: 126.3106 },
  '새별오름': { lat: 33.3663, lng: 126.3578 },
  '용눈이오름': { lat: 33.4606, lng: 126.8329 },
  '백약이오름': { lat: 33.4357, lng: 126.8049 },
  '비자림': { lat: 33.4912, lng: 126.8114 },
  '사려니숲길': { lat: 33.4077, lng: 126.6433 },
  '아르떼뮤지엄': { lat: 33.3965, lng: 126.3478 },
  '아르떼뮤지엄 제주': { lat: 33.3965, lng: 126.3478 },
  '노티드 제주': { lat: 33.4632, lng: 126.3098 },
  '랜디스도넛 제주': { lat: 33.4639, lng: 126.3090 },
  '동문시장': { lat: 33.5126, lng: 126.5282 },
  '제주 동문시장': { lat: 33.5126, lng: 126.5282 },
  '올레시장': { lat: 33.2501, lng: 126.5638 },
  '서귀포 매일올레시장': { lat: 33.2501, lng: 126.5638 },
  '한라산': { lat: 33.3617, lng: 126.5292 },
  '백록담': { lat: 33.3617, lng: 126.5292 },
  '쇠소깍': { lat: 33.2527, lng: 126.6231 },
  '외돌개': { lat: 33.2405, lng: 126.5458 },
  '주상절리': { lat: 33.2376, lng: 126.4251 },
  '대포주상절리': { lat: 33.2376, lng: 126.4251 },
  '휴애리': { lat: 33.3087, lng: 126.6341 },
  '스누피가든': { lat: 33.4449, lng: 126.7788 },
  '신화월드': { lat: 33.3072, lng: 126.3178 },
  '제주신화월드': { lat: 33.3072, lng: 126.3178 },

  // ==================== 서울 / 수도권 (Seoul & Gyeonggi & Incheon) ====================
  '서울': { lat: 37.5665, lng: 126.9780 },
  '남산타워': { lat: 37.5512, lng: 126.9882 },
  'N서울타워': { lat: 37.5512, lng: 126.9882 },
  '경복궁': { lat: 37.5796, lng: 126.9770 },
  '창덕궁': { lat: 37.5794, lng: 126.9910 },
  '덕수궁': { lat: 37.5658, lng: 126.9751 },
  '북촌한옥마을': { lat: 37.5826, lng: 126.9850 },
  '익선동': { lat: 37.5744, lng: 126.9897 },
  '성수동': { lat: 37.5446, lng: 127.0560 },
  '서울숲': { lat: 37.5444, lng: 127.0374 },
  '롯데월드': { lat: 37.5111, lng: 127.0982 },
  '잠실 롯데월드': { lat: 37.5111, lng: 127.0982 },
  '롯데월드타워': { lat: 37.5126, lng: 127.1025 },
  '석촌호수': { lat: 37.5090, lng: 127.1020 },
  '올림픽공원': { lat: 37.5208, lng: 127.1215 },
  '여의도 한강공원': { lat: 37.5284, lng: 126.9341 },
  '더현대 서울': { lat: 37.5259, lng: 126.9284 },
  '반포 한강공원': { lat: 37.5098, lng: 126.9954 },
  '세빛섬': { lat: 37.5114, lng: 126.9947 },
  '홍대': { lat: 37.5563, lng: 126.9236 },
  '연남동': { lat: 37.5621, lng: 126.9248 },
  '강남역': { lat: 37.4979, lng: 127.0276 },
  '코엑스': { lat: 37.5118, lng: 127.0592 },
  '별마당도서관': { lat: 37.5101, lng: 127.0598 },
  '광화문': { lat: 37.5760, lng: 126.9769 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '송도 센트럴파크': { lat: 37.3925, lng: 126.6393 },
  '월미도': { lat: 37.4746, lng: 126.5985 },
  '차이나타운': { lat: 37.4756, lng: 126.6180 },
  '을왕리해수욕장': { lat: 37.4475, lng: 126.3725 },
  '강화도': { lat: 37.7466, lng: 126.4880 },
  '동막해변': { lat: 37.5969, lng: 126.4526 },
  '동막해수욕장': { lat: 37.5969, lng: 126.4526 },
  '강화도 동막해변': { lat: 37.5969, lng: 126.4526 },
  '조양방직': { lat: 37.7472, lng: 126.4952 },
  '에버랜드': { lat: 37.2933, lng: 127.2026 },
  '수원화성': { lat: 37.2872, lng: 127.0118 },
  '가평': { lat: 37.8315, lng: 127.5097 },
  '남이섬': { lat: 37.7913, lng: 127.5255 },
  '아침고요수목원': { lat: 37.7437, lng: 127.3524 },
  '양평 두물머리': { lat: 37.5323, lng: 127.3178 },
  '파주 헤이리마을': { lat: 37.7885, lng: 126.6997 },

  // ==================== 부산 (Busan) ====================
  '부산': { lat: 35.1796, lng: 129.0756 },
  '해운대': { lat: 35.1587, lng: 129.1604 },
  '해운대해수욕장': { lat: 35.1587, lng: 129.1604 },
  '더베이101': { lat: 35.1565, lng: 129.1523 },
  '광안리': { lat: 35.1532, lng: 129.1186 },
  '광안리해수욕장': { lat: 35.1532, lng: 129.1186 },
  '광안대교': { lat: 35.1479, lng: 129.1300 },
  '감천문화마을': { lat: 35.0975, lng: 129.0106 },
  '태종대': { lat: 35.0531, lng: 129.0827 },
  '흰여울문화마을': { lat: 35.0786, lng: 129.0450 },
  '청사포': { lat: 35.1610, lng: 129.1925 },
  '해운대 블루라인파크': { lat: 35.1627, lng: 129.1764 },
  '해동용궁사': { lat: 35.1884, lng: 129.2234 },
  '송도해상케이블카': { lat: 35.0760, lng: 129.0175 },
  '자갈치시장': { lat: 35.0968, lng: 129.0306 },

  // ==================== 강원도 (Gangwon) ====================
  '강원도': { lat: 37.8228, lng: 128.1555 },
  '강릉': { lat: 37.7519, lng: 128.8761 },
  '안목해변': { lat: 37.7718, lng: 128.9478 },
  '강릉 커피거리': { lat: 37.7718, lng: 128.9478 },
  '경포대': { lat: 37.7951, lng: 128.8967 },
  '경포해변': { lat: 37.8055, lng: 128.9079 },
  '강문해변': { lat: 37.7954, lng: 128.9184 },
  '정동진': { lat: 37.6913, lng: 129.0326 },
  '주문진': { lat: 37.8890, lng: 128.8285 },
  '도깨비 촬영지': { lat: 37.8732, lng: 128.8478 },
  '속초': { lat: 38.2070, lng: 128.5918 },
  '속초해수욕장': { lat: 38.1906, lng: 128.6033 },
  '속초아이': { lat: 38.1906, lng: 128.6033 },
  '속초아이 대관람차': { lat: 38.1906, lng: 128.6033 },
  '속초 중앙시장': { lat: 38.2045, lng: 128.5901 },
  '설악산': { lat: 38.1195, lng: 128.4656 },
  '양양': { lat: 38.0754, lng: 128.6189 },
  '서피비치': { lat: 38.0278, lng: 128.7175 },
  '낙산사': { lat: 38.1251, lng: 128.6277 },
  '춘천': { lat: 37.8813, lng: 127.7298 },
  '소양강스카이워크': { lat: 37.8938, lng: 127.7226 },
  '대관령 양떼목장': { lat: 37.6888, lng: 128.7525 },
  '뮤지엄 산': { lat: 37.4042, lng: 127.8725 },

  // ==================== 경상 / 전라 / 충청 ====================
  '경주': { lat: 35.8562, lng: 129.2247 },
  '첨성대': { lat: 35.8347, lng: 129.2190 },
  '동궁과 월지': { lat: 35.8341, lng: 129.2266 },
  '황리단길': { lat: 35.8375, lng: 129.2096 },
  '불국사': { lat: 35.7901, lng: 129.3321 },
  '포항': { lat: 36.0190, lng: 129.3435 },
  '호미곶': { lat: 36.0772, lng: 129.5694 },
  '스페이스워크': { lat: 36.0664, lng: 129.3807 },
  '전주': { lat: 35.8242, lng: 127.1480 },
  '전주 한옥마을': { lat: 35.8149, lng: 127.1526 },
  '여수': { lat: 34.7604, lng: 127.6622 },
  '오동도': { lat: 34.7454, lng: 127.7667 },
  '여수 밤바다': { lat: 34.7408, lng: 127.7410 },
  '향일암': { lat: 34.5917, lng: 127.8109 },
  '순천만습지': { lat: 34.8864, lng: 127.5097 },
  '단양 도담삼봉': { lat: 36.9934, lng: 128.3734 },
  '태안': { lat: 36.7457, lng: 126.2979 },
  '꽃지해수욕장': { lat: 36.5028, lng: 126.3353 },
  '통영 동피랑': { lat: 34.8461, lng: 128.4286 },
  '남해 독일마을': { lat: 34.8011, lng: 128.0467 }
};

// Normalize place string for key matching
function cleanPlaceName(name) {
  if (!name) return '';
  return name.replace(/[#@,!?()]/g, '').trim();
}

/**
 * Extract region coordinates from region hint string (e.g. "제주도 서귀포", "강릉", "부산")
 */
export function getRegionCenter(regionHint) {
  if (!regionHint) return null;
  const clean = cleanPlaceName(regionHint);
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return null;
}

/**
 * Geocode single place name
 */
export async function geocodePlace(placeName, regionHint = '', neighboringCoords = null) {
  const cleanName = cleanPlaceName(placeName);
  if (!cleanName) return null;

  const cacheKey = `${cleanName}__${regionHint}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  // 1. Direct match in dictionary (0ms instant lookup)
  if (KNOWN_LOCATIONS[cleanName]) {
    const res = { ...KNOWN_LOCATIONS[cleanName], name: cleanName, source: 'dictionary' };
    geoCache.set(cacheKey, res);
    return res;
  }

  // 2. Normalized / partial match in dictionary
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (cleanName.replace(/\s+/g, '') === key.replace(/\s+/g, '')) {
      const res = { ...coords, name: cleanName, source: 'dictionary-exact' };
      geoCache.set(cacheKey, res);
      return res;
    }
    if (cleanName.includes(key) || key.includes(cleanName)) {
      const res = { ...coords, name: cleanName, source: 'dictionary-partial' };
      geoCache.set(cacheKey, res);
      return res;
    }
  }

  // 3. Photon POI Geocoder (supports Korean cafes, restaurants, spots with fuzzy search)
  const photonQueries = [
    regionHint ? `${cleanName} ${regionHint}` : null,
    cleanName
  ].filter(Boolean);

  for (const query of photonQueries) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
      const response = await fetch(photonUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          const feat = data.features[0];
          const coords = feat.geometry?.coordinates; // [lng, lat]
          if (coords && coords.length >= 2) {
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              // Ensure coordinates are within Korea bounding box
              if (lat >= 33.0 && lat <= 38.8 && lng >= 124.5 && lng <= 132.0) {
                const res = { lat, lng, name: cleanName, displayName: feat.properties?.name, source: 'photon' };
                geoCache.set(cacheKey, res);
                return res;
              }
            }
          }
        }
      }
    } catch {
      // Continue to next geocoder
    }
  }

  // 4. OpenStreetMap Nominatim Geocoder (for road addresses & places)
  const nominatimQueries = [
    regionHint ? `${cleanName} ${regionHint}` : null,
    cleanName,
    regionHint ? `${cleanName.split(' ')[0]} ${regionHint}` : null
  ].filter(Boolean);

  for (const query of nominatimQueries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kr&limit=1`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            const res = { lat, lng, name: cleanName, displayName: data[0].display_name, source: 'nominatim' };
            geoCache.set(cacheKey, res);
            return res;
          }
        }
      }
    } catch {
      // Continue
    }
  }

  // 5. Smart Region Context Fallback (NEVER jump to Seoul if trip is in Jeju or Busan)
  const regionCenter = getRegionCenter(regionHint);
  if (regionCenter) {
    const randomOffset = (Math.random() - 0.5) * 0.012;
    const res = {
      lat: regionCenter.lat + randomOffset,
      lng: regionCenter.lng + randomOffset,
      name: cleanName,
      source: 'region-context-fallback'
    };
    geoCache.set(cacheKey, res);
    return res;
  }

  // 6. Neighboring spots in the same post fallback
  if (neighboringCoords && neighboringCoords.lat && neighboringCoords.lng) {
    const randomOffset = (Math.random() - 0.5) * 0.015;
    const res = {
      lat: neighboringCoords.lat + randomOffset,
      lng: neighboringCoords.lng + randomOffset,
      name: cleanName,
      source: 'neighbor-fallback'
    };
    geoCache.set(cacheKey, res);
    return res;
  }

  // 7. Last resort default (Seoul)
  const defaultFallback = { lat: 37.5665, lng: 126.9780, name: cleanName, source: 'default' };
  geoCache.set(cacheKey, defaultFallback);
  return defaultFallback;
}

/**
 * Geocode list of places with sequential awareness
 */
export async function geocodePlaceList(places, regionHint = '') {
  if (!places || !Array.isArray(places) || places.length === 0) return [];

  let lastKnownCoords = getRegionCenter(regionHint);

  const results = [];
  for (let index = 0; index < places.length; index++) {
    const block = places[index];
    const placeName = block.placeName || block.content || '';
    if (!placeName.trim()) continue;

    if (block.lat && block.lng) {
      lastKnownCoords = { lat: block.lat, lng: block.lng };
      results.push({
        id: block.id || `spot-${index}`,
        index: index + 1,
        name: placeName.trim(),
        lat: block.lat,
        lng: block.lng,
        source: 'saved'
      });
      continue;
    }

    const coords = await geocodePlace(placeName.trim(), regionHint, lastKnownCoords);
    if (coords && coords.lat && coords.lng) {
      lastKnownCoords = { lat: coords.lat, lng: coords.lng };
      results.push({
        id: block.id || `spot-${index}`,
        index: index + 1,
        name: placeName.trim(),
        lat: coords.lat,
        lng: coords.lng,
        source: coords.source
      });
    }
  }

  return results;
}
