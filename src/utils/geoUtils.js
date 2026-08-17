// Korean Travel Spots & Address Geo Utility
// Multi-stage high-accuracy geocoding & address parser

const geoCache = new Map();

// Built-in pinpoint coordinates for EXACT Landmark Matches ONLY (Never used for broad partial address matching)
export const KNOWN_LOCATIONS = {
  // ==================== 제주도 (Jeju) ====================
  '협재해수욕장': { lat: 33.3940, lng: 126.2397 },
  '협재해변': { lat: 33.3940, lng: 126.2397 },
  '금능해수욕장': { lat: 33.3905, lng: 126.2347 },
  '금능해변': { lat: 33.3905, lng: 126.2347 },
  '함덕해수욕장': { lat: 33.5434, lng: 126.6692 },
  '함덕해변': { lat: 33.5434, lng: 126.6692 },
  '월정리해변': { lat: 33.5564, lng: 126.7958 },
  '월정리해수욕장': { lat: 33.5564, lng: 126.7958 },
  '김녕해수욕장': { lat: 33.5576, lng: 126.7594 },
  '김녕해변': { lat: 33.5576, lng: 126.7594 },
  '세화해변': { lat: 33.5255, lng: 126.8524 },
  '세화해수욕장': { lat: 33.5255, lng: 126.8524 },
  '곽지해수욕장': { lat: 33.4508, lng: 126.3056 },
  '이호테우해수욕장': { lat: 33.4984, lng: 126.4533 },
  '이호테우해변': { lat: 33.4984, lng: 126.4533 },
  '표선해수욕장': { lat: 33.3248, lng: 126.8373 },
  '성산일출봉': { lat: 33.4586, lng: 126.9427 },
  '우도': { lat: 33.5043, lng: 126.9542 },
  '섭지코지': { lat: 33.4243, lng: 126.9311 },
  '중문관광단지': { lat: 33.2483, lng: 126.4124 },
  '중문색달해변': { lat: 33.2450, lng: 126.4120 },
  '중문색달해수욕장': { lat: 33.2450, lng: 126.4120 },
  '오설록 티뮤지엄': { lat: 33.3059, lng: 126.2895 },
  '오설록티뮤지엄': { lat: 33.3059, lng: 126.2895 },
  '런던베이글뮤지엄 제주': { lat: 33.5558, lng: 126.7118 },
  '런던베이글뮤지엄 제주점': { lat: 33.5558, lng: 126.7118 },
  '카멜리아힐': { lat: 33.2902, lng: 126.3697 },
  '천지연폭포': { lat: 33.2447, lng: 126.5595 },
  '천제연폭포': { lat: 33.2526, lng: 126.4184 },
  '정방폭포': { lat: 33.2449, lng: 126.5717 },
  '산방산': { lat: 33.2415, lng: 126.3135 },
  '용머리해안': { lat: 33.2323, lng: 126.3146 },
  '한담해변': { lat: 33.4619, lng: 126.3106 },
  '한담해안산책로': { lat: 33.4619, lng: 126.3106 },
  '새별오름': { lat: 33.3663, lng: 126.3578 },
  '비자림': { lat: 33.4912, lng: 126.8114 },
  '사려니숲길': { lat: 33.4077, lng: 126.6433 },
  '아르떼뮤지엄 제주': { lat: 33.3965, lng: 126.3478 },
  '동문시장': { lat: 33.5126, lng: 126.5282 },
  '올레시장': { lat: 33.2501, lng: 126.5638 },
  '한라산': { lat: 33.3617, lng: 126.5292 },
  '쇠소깍': { lat: 33.2527, lng: 126.6231 },
  '외돌개': { lat: 33.2405, lng: 126.5458 },
  '스누피가든': { lat: 33.4449, lng: 126.7788 },

  // ==================== 서울 / 수도권 ====================
  '남산타워': { lat: 37.5512, lng: 126.9882 },
  'N서울타워': { lat: 37.5512, lng: 126.9882 },
  '경복궁': { lat: 37.5796, lng: 126.9770 },
  '창덕궁': { lat: 37.5794, lng: 126.9910 },
  '덕수궁': { lat: 37.5658, lng: 126.9751 },
  '북촌한옥마을': { lat: 37.5826, lng: 126.9850 },
  '익선동': { lat: 37.5744, lng: 126.9897 },
  '서울숲': { lat: 37.5444, lng: 127.0374 },
  '롯데월드': { lat: 37.5111, lng: 127.0982 },
  '롯데월드타워': { lat: 37.5126, lng: 127.1025 },
  '석촌호수': { lat: 37.5090, lng: 127.1020 },
  '올림픽공원': { lat: 37.5208, lng: 127.1215 },
  '여의도 한강공원': { lat: 37.5284, lng: 126.9341 },
  '더현대 서울': { lat: 37.5259, lng: 126.9284 },
  '반포 한강공원': { lat: 37.5098, lng: 126.9954 },
  '세빛섬': { lat: 37.5114, lng: 126.9947 },
  '코엑스': { lat: 37.5118, lng: 127.0592 },
  '별마당도서관': { lat: 37.5101, lng: 127.0598 },
  '송도 센트럴파크': { lat: 37.3925, lng: 126.6393 },
  '월미도': { lat: 37.4746, lng: 126.5985 },
  '차이나타운': { lat: 37.4756, lng: 126.6180 },
  '을왕리해수욕장': { lat: 37.4475, lng: 126.3725 },
  '동막해변': { lat: 37.5969, lng: 126.4526 },
  '동막해수욕장': { lat: 37.5969, lng: 126.4526 },
  '에버랜드': { lat: 37.2933, lng: 127.2026 },
  '수원화성': { lat: 37.2872, lng: 127.0118 },
  '남이섬': { lat: 37.7913, lng: 127.5255 },
  '아침고요수목원': { lat: 37.7437, lng: 127.3524 },
  '양평 두물머리': { lat: 37.5323, lng: 127.3178 },
  '파주 헤이리마을': { lat: 37.7885, lng: 126.6997 },

  // ==================== 부산 ====================
  '해운대': { lat: 35.1587, lng: 129.1604 },
  '해운대해수욕장': { lat: 35.1587, lng: 129.1604 },
  '더베이101': { lat: 35.1565, lng: 129.1523 },
  '광안리': { lat: 35.1532, lng: 129.1186 },
  '광안리해수욕장': { lat: 35.1532, lng: 129.1186 },
  '광안대교': { lat: 35.1479, lng: 129.1300 },
  '감천문화마을': { lat: 35.0975, lng: 129.0106 },
  '태종대': { lat: 35.0531, lng: 129.0827 },
  '흰여울문화마을': { lat: 35.0786, lng: 129.0450 },
  '해운대 블루라인파크': { lat: 35.1627, lng: 129.1764 },
  '해동용궁사': { lat: 35.1884, lng: 129.2234 },
  '자갈치시장': { lat: 35.0968, lng: 129.0306 },

  // ==================== 강원도 ====================
  '봉포해변': { lat: 38.2548, lng: 128.5658 },
  '봉포해수욕장': { lat: 38.2548, lng: 128.5658 },
  '안목해변': { lat: 37.7718, lng: 128.9478 },
  '강릉 커피거리': { lat: 37.7718, lng: 128.9478 },
  '경포대': { lat: 37.7951, lng: 128.8967 },
  '경포해변': { lat: 37.8055, lng: 128.9079 },
  '경포해수욕장': { lat: 37.8055, lng: 128.9079 },
  '강문해변': { lat: 37.7954, lng: 128.9184 },
  '정동진': { lat: 37.6913, lng: 129.0326 },
  '주문진': { lat: 37.8890, lng: 128.8285 },
  '도깨비 촬영지': { lat: 37.8732, lng: 128.8478 },
  '속초해수욕장': { lat: 38.1906, lng: 128.6033 },
  '속초아이': { lat: 38.1906, lng: 128.6033 },
  '속초아이 대관람차': { lat: 38.1906, lng: 128.6033 },
  '속초 중앙시장': { lat: 38.2045, lng: 128.5901 },
  '설악산': { lat: 38.1195, lng: 128.4656 },
  '서피비치': { lat: 38.0278, lng: 128.7175 },
  '낙산사': { lat: 38.1251, lng: 128.6277 },
  '소양강스카이워크': { lat: 37.8938, lng: 127.7226 },
  '대관령 양떼목장': { lat: 37.6888, lng: 128.7525 },
  '뮤지엄 산': { lat: 37.4042, lng: 127.8725 },

  // ==================== 경상 / 전라 / 충청 ====================
  '첨성대': { lat: 35.8347, lng: 129.2190 },
  '동궁과 월지': { lat: 35.8341, lng: 129.2266 },
  '황리단길': { lat: 35.8375, lng: 129.2096 },
  '불국사': { lat: 35.7901, lng: 129.3321 },
  '호미곶': { lat: 36.0772, lng: 129.5694 },
  '스페이스워크': { lat: 36.0664, lng: 129.3807 },
  '전주 한옥마을': { lat: 35.8149, lng: 127.1526 },
  '오동도': { lat: 34.7454, lng: 127.7667 },
  '여수 밤바다': { lat: 34.7408, lng: 127.7410 },
  '향일암': { lat: 34.5917, lng: 127.8109 },
  '순천만습지': { lat: 34.8864, lng: 127.5097 },
  '단양 도담삼봉': { lat: 36.9934, lng: 128.3734 },
  '꽃지해수욕장': { lat: 36.5028, lng: 126.3353 },
  '통영 동피랑': { lat: 34.8461, lng: 128.4286 },
  '남해 독일마을': { lat: 34.8011, lng: 128.0467 }
};

// Normalize place string for clean matching
function cleanPlaceName(name) {
  if (!name) return '';
  return name.replace(/[#@,!?()]/g, '').trim();
}

/**
 * High-accuracy Korean Address Hierarchical Geocoder
 * Resolves exact street/town/village level coordinates without coarse city jumping
 */
export async function geocodeKoreanAddress(rawAddress, regionHint = '', postalDetails = null) {
  if (!rawAddress || !rawAddress.trim()) return null;

  // Clean address from floor/room/parenthesis details
  const cleanAddr = rawAddress
    .replace(/\s+\d+층.*|\s+\d+호.*|\s+지하.*|\s*\(.*?\)/g, '')
    .trim();

  const cacheKey = `addr__${cleanAddr}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  // 1. Direct landmark dictionary exact match check
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (cleanAddr === key || cleanAddr.endsWith(key)) {
      const res = { lat: coords.lat, lng: coords.lng, address: cleanAddr, source: 'landmark-exact' };
      geoCache.set(cacheKey, res);
      return res;
    }
  }

  // 2. Build precision search queries from postal details or address string
  const queries = [];

  if (postalDetails) {
    const { sido = '', sigungu = '', bname = '', roadname = '', buildingName = '' } = postalDetails;
    if (sigungu && bname && roadname) queries.push(`${sigungu} ${bname} ${roadname}`);
    if (sigungu && roadname) queries.push(`${sigungu} ${roadname}`);
    if (sigungu && bname) queries.push(`${sigungu} ${bname}`);
    if (buildingName) queries.push(`${sigungu} ${buildingName}`);
  }

  // Extract components from string: e.g. "강원특별자치도 고성군 토성면 봉포4길 3"
  const tokens = cleanAddr.split(/\s+/);
  if (tokens.length >= 3) {
    // E.g. "고성군 토성면 봉포4길"
    queries.push(tokens.slice(1).join(' '));
    // E.g. "토성면 봉포4길"
    queries.push(tokens.slice(2).join(' '));
  }
  queries.push(cleanAddr);

  // 3. Query Photon Geocoder with candidates
  for (const q of queries) {
    if (!q || q.length < 2) continue;
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`;
      const response = await fetch(photonUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          const coords = data.features[0].geometry?.coordinates;
          if (coords && coords.length >= 2) {
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);
            if (!isNaN(lat) && !isNaN(lng) && lat >= 33.0 && lat <= 38.8 && lng >= 124.5 && lng <= 132.0) {
              const res = { lat, lng, address: cleanAddr, source: 'photon-precise' };
              geoCache.set(cacheKey, res);
              return res;
            }
          }
        }
      }
    } catch {
      // Continue
    }
  }

  // 4. Query Nominatim as backup
  for (const q of queries) {
    if (!q || q.length < 2) continue;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=kr&limit=1`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng) && lat >= 33.0 && lat <= 38.8 && lng >= 124.5 && lng <= 132.0) {
            const res = { lat, lng, address: cleanAddr, source: 'nominatim-precise' };
            geoCache.set(cacheKey, res);
            return res;
          }
        }
      }
    } catch {
      // Continue
    }
  }

  // 5. Regional fallback if needed
  return { lat: 37.5665, lng: 126.9780, address: cleanAddr, source: 'default' };
}

/**
 * Geocode list of places with strict coordinate preservation
 * CRITICAL RULE: If block already has lat and lng, NEVER re-geocode it!
 */
export async function geocodePlaceList(places, regionHint = '') {
  if (!places || !Array.isArray(places) || places.length === 0) return [];

  const results = [];

  for (let index = 0; index < places.length; index++) {
    const block = places[index];
    const placeName = block.placeName || block.content || '';
    if (!placeName.trim()) continue;

    // 1. Absolute Priority: If saved coordinates exist, USE THEM DIRECTLY!
    if (block.lat && block.lng && !isNaN(Number(block.lat)) && !isNaN(Number(block.lng))) {
      const savedLat = Number(block.lat);
      const savedLng = Number(block.lng);
      results.push({
        id: block.id || `spot-${index}`,
        index: index + 1,
        name: placeName.trim(),
        address: block.address || block.roadAddress || '',
        lat: savedLat,
        lng: savedLng,
        source: 'saved-address-coords'
      });
      continue;
    }

    // 2. If address exists, geocode the address
    const targetQuery = block.address || block.roadAddress || placeName.trim();
    const coords = await geocodeKoreanAddress(targetQuery, regionHint);
    if (coords && coords.lat && coords.lng) {
      results.push({
        id: block.id || `spot-${index}`,
        index: index + 1,
        name: placeName.trim(),
        address: block.address || coords.address || '',
        lat: coords.lat,
        lng: coords.lng,
        source: coords.source
      });
    }
  }

  return results;
}
