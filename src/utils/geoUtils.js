// Korean Travel Spots & Address Geo Utility
// Multi-stage high-accuracy Google Maps geocoder, reverse geocoder & landmark search engine

const geoCache = new Map();

// Built-in pinpoint coordinates for famous Korean Travel Spots & Landmarks
export const KNOWN_LOCATIONS = {
  // ==================== 제주도 (Jeju) ====================
  '협재해수욕장': { lat: 33.3940, lng: 126.2397, address: '제주특별자치도 제주시 한림읍 한림로 329-10', category: '해변', region: '제주' },
  '협재해변': { lat: 33.3940, lng: 126.2397, address: '제주특별자치도 제주시 한림읍 한림로 329-10', category: '해변', region: '제주' },
  '금능해수욕장': { lat: 33.3905, lng: 126.2347, address: '제주특별자치도 제주시 한림읍 금능길 119-10', category: '해변', region: '제주' },
  '금능해변': { lat: 33.3905, lng: 126.2347, address: '제주특별자치도 제주시 한림읍 금능길 119-10', category: '해변', region: '제주' },
  '함덕해수욕장': { lat: 33.5434, lng: 126.6692, address: '제주특별자치도 제주시 조천읍 조함해안로 525', category: '해변', region: '제주' },
  '함덕해변': { lat: 33.5434, lng: 126.6692, address: '제주특별자치도 제주시 조천읍 조함해안로 525', category: '해변', region: '제주' },
  '월정리해변': { lat: 33.5564, lng: 126.7958, address: '제주특별자치도 제주시 구좌읍 월정리 33-3', category: '해변', region: '제주' },
  '월정리해수욕장': { lat: 33.5564, lng: 126.7958, address: '제주특별자치도 제주시 구좌읍 월정리 33-3', category: '해변', region: '제주' },
  '김녕해수욕장': { lat: 33.5576, lng: 126.7594, address: '제주특별자치도 제주시 구좌읍 김녕리 497-4', category: '해변', region: '제주' },
  '김녕해변': { lat: 33.5576, lng: 126.7594, address: '제주특별자치도 제주시 구좌읍 김녕리 497-4', category: '해변', region: '제주' },
  '세화해변': { lat: 33.5255, lng: 126.8524, address: '제주특별자치도 제주시 구좌읍 세화리 1415', category: '해변', region: '제주' },
  '세화해수욕장': { lat: 33.5255, lng: 126.8524, address: '제주특별자치도 제주시 구좌읍 세화리 1415', category: '해변', region: '제주' },
  '곽지해수욕장': { lat: 33.4508, lng: 126.3056, address: '제주특별자치도 제주시 애월읍 곽지리 1565', category: '해변', region: '제주' },
  '곽지과물해변': { lat: 33.4508, lng: 126.3056, address: '제주특별자치도 제주시 애월읍 곽지리 1565', category: '해변', region: '제주' },
  '이호테우해수욕장': { lat: 33.4984, lng: 126.4533, address: '제주특별자치도 제주시 이호일동 1665-13', category: '해변', region: '제주' },
  '이호테우해변': { lat: 33.4984, lng: 126.4533, address: '제주특별자치도 제주시 이호일동 1665-13', category: '해변', region: '제주' },
  '표선해수욕장': { lat: 33.3248, lng: 126.8373, address: '제주특별자치도 서귀포시 표선면 표선리 44-13', category: '해변', region: '제주' },
  '표선해비치해변': { lat: 33.3248, lng: 126.8373, address: '제주특별자치도 서귀포시 표선면 표선리 44-13', category: '해변', region: '제주' },
  '성산일출봉': { lat: 33.4586, lng: 126.9427, address: '제주특별자치도 서귀포시 성산읍 일출로 284-12', category: '관광명소', region: '제주' },
  '우도': { lat: 33.5043, lng: 126.9542, address: '제주특별자치도 제주시 우도면', category: '관광명소', region: '제주' },
  '우도봉': { lat: 33.4947, lng: 126.9602, address: '제주특별자치도 제주시 우도면 연평리', category: '관광명소', region: '제주' },
  '섭지코지': { lat: 33.4243, lng: 126.9311, address: '제주특별자치도 서귀포시 성산읍 고성리 57', category: '관광명소', region: '제주' },
  '중문관광단지': { lat: 33.2483, lng: 126.4124, address: '제주특별자치도 서귀포시 중문관광로 72번길', category: '관광명소', region: '제주' },
  '중문색달해변': { lat: 33.2450, lng: 126.4120, address: '제주특별자치도 서귀포시 색달동 3039', category: '해변', region: '제주' },
  '중문색달해수욕장': { lat: 33.2450, lng: 126.4120, address: '제주특별자치도 서귀포시 색달동 3039', category: '해변', region: '제주' },
  '오설록 티뮤지엄': { lat: 33.3059, lng: 126.2895, address: '제주특별자치도 서귀포시 안덕면 신화역사로 15', category: '카페/명소', region: '제주' },
  '오설록티뮤지엄': { lat: 33.3059, lng: 126.2895, address: '제주특별자치도 서귀포시 안덕면 신화역사로 15', category: '카페/명소', region: '제주' },
  '런던베이글뮤지엄 제주': { lat: 33.5558, lng: 126.7118, address: '제주특별자치도 제주시 구좌읍 동복로 85', category: '카페/베이커리', region: '제주' },
  '런던베이글뮤지엄 제주점': { lat: 33.5558, lng: 126.7118, address: '제주특별자치도 제주시 구좌읍 동복로 85', category: '카페/베이커리', region: '제주' },
  '카페 노티드 제주': { lat: 33.4611, lng: 126.3102, address: '제주특별자치도 제주시 애월읍 애월로1길 24-9', category: '카페/디저트', region: '제주' },
  '노티드 제주애월': { lat: 33.4611, lng: 126.3102, address: '제주특별자치도 제주시 애월읍 애월로1길 24-9', category: '카페/디저트', region: '제주' },
  '카멜리아힐': { lat: 33.2902, lng: 126.3697, address: '제주특별자치도 서귀포시 안덕면 병악로 166', category: '관광명소', region: '제주' },
  '천지연폭포': { lat: 33.2447, lng: 126.5595, address: '제주특별자치도 서귀포시 남성중로 40', category: '자연/관광', region: '제주' },
  '천제연폭포': { lat: 33.2526, lng: 126.4184, address: '제주특별자치도 서귀포시 천제연로 132', category: '자연/관광', region: '제주' },
  '정방폭포': { lat: 33.2449, lng: 126.5717, address: '제주특별자치도 서귀포시 칠십리로214번길 37', category: '자연/관광', region: '제주' },
  '산방산': { lat: 33.2415, lng: 126.3135, address: '제주특별자치도 서귀포시 안덕면 사계리 산16', category: '자연/관광', region: '제주' },
  '용머리해안': { lat: 33.2323, lng: 126.3146, address: '제주특별자치도 서귀포시 안덕면 사계리 112-3', category: '자연/관광', region: '제주' },
  '한담해변': { lat: 33.4619, lng: 126.3106, address: '제주특별자치도 제주시 애월읍 애월리 2461-1', category: '해변', region: '제주' },
  '한담해안산책로': { lat: 33.4619, lng: 126.3106, address: '제주특별자치도 제주시 애월읍 곽지리 1359', category: '산책/풍경', region: '제주' },
  '새별오름': { lat: 33.3663, lng: 126.3578, address: '제주특별자치도 제주시 애월읍 봉성리 산59-8', category: '자연/오름', region: '제주' },
  '비자림': { lat: 33.4912, lng: 126.8114, address: '제주특별자치도 제주시 구좌읍 비자숲길 55', category: '자연/숲길', region: '제주' },
  '사려니숲길': { lat: 33.4077, lng: 126.6433, address: '제주특별자치도 제주시 조천읍 교래리 산137-1', category: '자연/숲길', region: '제주' },
  '아르떼뮤지엄 제주': { lat: 33.3965, lng: 126.3478, address: '제주특별자치도 제주시 애월읍 어림비로 478', category: '전시/명소', region: '제주' },
  '동문시장': { lat: 33.5126, lng: 126.5282, address: '제주특별자치도 제주시 관덕로14길 20', category: '전통시장', region: '제주' },
  '올레시장': { lat: 33.2501, lng: 126.5638, address: '제주특별자치도 서귀포시 중앙로62번길 18', category: '전통시장', region: '제주' },
  '한라산': { lat: 33.3617, lng: 126.5292, address: '제주특별자치도 제주시 한라산국립공원', category: '자연/명산', region: '제주' },
  '백록담': { lat: 33.3617, lng: 126.5292, address: '제주특별자치도 서귀포시 토평동 산15-1', category: '자연/명산', region: '제주' },
  '쇠소깍': { lat: 33.2527, lng: 126.6231, address: '제주특별자치도 서귀포시 쇠소깍로 104', category: '자연/관광', region: '제주' },
  '외돌개': { lat: 33.2405, lng: 126.5458, address: '제주특별자치도 서귀포시 서홍동 791', category: '자연/관광', region: '제주' },
  '스누피가든': { lat: 33.4449, lng: 126.7788, address: '제주특별자치도 제주시 구좌읍 금백조로 930', category: '테마파크', region: '제주' },
  '휴애리 자연생활공원': { lat: 33.3082, lng: 126.6344, address: '제주특별자치도 서귀포시 남원읍 신례동로 256', category: '테마파크', region: '제주' },

  // ==================== 서울 / 수도권 ====================
  '남산타워': { lat: 37.5512, lng: 126.9882, address: '서울특별시 용산구 남산공원길 105', category: '관광명소', region: '서울' },
  'N서울타워': { lat: 37.5512, lng: 126.9882, address: '서울특별시 용산구 남산공원길 105', category: '관광명소', region: '서울' },
  '경복궁': { lat: 37.5796, lng: 126.9770, address: '서울특별시 종로구 사직로 161', category: '문화/궁궐', region: '서울' },
  '창덕궁': { lat: 37.5794, lng: 126.9910, address: '서울특별시 종로구 율곡로 99', category: '문화/궁궐', region: '서울' },
  '덕수궁': { lat: 37.5658, lng: 126.9751, address: '서울특별시 중구 세종대로 99', category: '문화/궁궐', region: '서울' },
  '북촌한옥마을': { lat: 37.5826, lng: 126.9850, address: '서울특별시 종로구 계동길 37', category: '문화/거리', region: '서울' },
  '익선동': { lat: 37.5744, lng: 126.9897, address: '서울특별시 종로구 익선동', category: '핫플레이스', region: '서울' },
  '익선동 한옥마을': { lat: 37.5744, lng: 126.9897, address: '서울특별시 종로구 수표로28길', category: '핫플레이스', region: '서울' },
  '서울숲': { lat: 37.5444, lng: 127.0374, address: '서울특별시 성동구 뚝섬로 273', category: '공원/자연', region: '서울' },
  '성수동': { lat: 37.5445, lng: 127.0560, address: '서울특별시 성동구 성수동2가', category: '핫플레이스', region: '서울' },
  '롯데월드': { lat: 37.5111, lng: 127.0982, address: '서울특별시 송파구 올림픽로 240', category: '테마파크', region: '서울' },
  '롯데월드타워': { lat: 37.5126, lng: 127.1025, address: '서울특별시 송파구 올림픽로 300', category: '랜드마크', region: '서울' },
  '석촌호수': { lat: 37.5090, lng: 127.1020, address: '서울특별시 송파구 잠실동', category: '공원/호수', region: '서울' },
  '올림픽공원': { lat: 37.5208, lng: 127.1215, address: '서울특별시 송파구 올림픽로 424', category: '공원', region: '서울' },
  '여의도 한강공원': { lat: 37.5284, lng: 126.9341, address: '서울특별시 영등포구 여의동로 330', category: '공원/한강', region: '서울' },
  '더현대 서울': { lat: 37.5259, lng: 126.9284, address: '서울특별시 영등포구 여의대로 108', category: '쇼핑/문화', region: '서울' },
  '반포 한강공원': { lat: 37.5098, lng: 126.9954, address: '서울특별시 서초구 신반포로11길 40', category: '공원/한강', region: '서울' },
  '세빛섬': { lat: 37.5114, lng: 126.9947, address: '서울특별시 서초구 올림픽대로 2085-14', category: '관광명소', region: '서울' },
  '코엑스': { lat: 37.5118, lng: 127.0592, address: '서울특별시 강남구 영동대로 513', category: '쇼핑/복합문화', region: '서울' },
  '별마당도서관': { lat: 37.5101, lng: 127.0598, address: '서울특별시 강남구 영동대로 513 스타필드 코엑스몰 B1', category: '문화/명소', region: '서울' },
  '송도 센트럴파크': { lat: 37.3925, lng: 126.6393, address: '인천광역시 연수구 컨벤시아대로 160', category: '공원', region: '인천' },
  '월미도': { lat: 37.4746, lng: 126.5985, address: '인천광역시 중구 월미문화로 36', category: '관광명소', region: '인천' },
  '차이나타운': { lat: 37.4756, lng: 126.6180, address: '인천광역시 중구 차이나타운로59번길 12', category: '문화/거리', region: '인천' },
  '을왕리해수욕장': { lat: 37.4475, lng: 126.3725, address: '인천광역시 중구 을왕동 746-1', category: '해변', region: '인천' },
  '동막해변': { lat: 37.5969, lng: 126.4526, address: '인천광역시 강화군 화도면 해안남로 1481', category: '해변', region: '인천' },
  '동막해수욕장': { lat: 37.5969, lng: 126.4526, address: '인천광역시 강화군 화도면 해안남로 1481', category: '해변', region: '인천' },
  '에버랜드': { lat: 37.2933, lng: 127.2026, address: '경기도 용인시 처인구 포곡읍 에버랜드로 199', category: '테마파크', region: '경기' },
  '수원화성': { lat: 37.2872, lng: 127.0118, address: '경기도 수원시 팔달구 정조로 825', category: '문화유적', region: '경기' },
  '행리단길': { lat: 37.2842, lng: 127.0142, address: '경기도 수원시 팔달구 신풍동', category: '핫플레이스', region: '경기' },
  '남이섬': { lat: 37.7913, lng: 127.5255, address: '강원특별자치도 춘천시 남산면 남이섬길 1', category: '관광명소', region: '강원/경기' },
  '아침고요수목원': { lat: 37.7437, lng: 127.3524, address: '경기도 가평군 상면 수목원로 432', category: '자연/수목원', region: '경기' },
  '양평 두물머리': { lat: 37.5323, lng: 127.3178, address: '경기도 양평군 양서면 양수리', category: '자연/풍경', region: '경기' },
  '파주 헤이리마을': { lat: 37.7885, lng: 126.6997, address: '경기도 파주시 탄현면 헤이리마을길 70-21', category: '예술/문화', region: '경기' },

  // ==================== 부산 ====================
  '해운대': { lat: 35.1587, lng: 129.1604, address: '부산광역시 해운대구 우동', category: '해변', region: '부산' },
  '해운대해수욕장': { lat: 35.1587, lng: 129.1604, address: '부산광역시 해운대구 우동', category: '해변', region: '부산' },
  '더베이101': { lat: 35.1565, lng: 129.1523, address: '부산광역시 해운대구 동백로 52', category: '명소/야경', region: '부산' },
  '동백섬': { lat: 35.1534, lng: 129.1529, address: '부산광역시 해운대구 우동 710-1', category: '자연/산책', region: '부산' },
  '광안리': { lat: 35.1532, lng: 129.1186, address: '부산광역시 수영구 광안해변로 219', category: '해변', region: '부산' },
  '광안리해수욕장': { lat: 35.1532, lng: 129.1186, address: '부산광역시 수영구 광안해변로 219', category: '해변', region: '부산' },
  '광안대교': { lat: 35.1479, lng: 129.1300, address: '부산광역시 수영구 민락동', category: '랜드마크', region: '부산' },
  '민락더마켓': { lat: 35.1554, lng: 129.1311, address: '부산광역시 수영구 민락수변로17번길 56', category: '복합문화', region: '부산' },
  '감천문화마을': { lat: 35.0975, lng: 129.0106, address: '부산광역시 사하구 감내2로 203', category: '문화/거리', region: '부산' },
  '태종대': { lat: 35.0531, lng: 129.0827, address: '부산광역시 영도구 전망로 24', category: '자연/관광', region: '부산' },
  '흰여울문화마을': { lat: 35.0786, lng: 129.0450, address: '부산광역시 영도구 절영로 194', category: '문화/거리', region: '부산' },
  '해운대 블루라인파크': { lat: 35.1627, lng: 129.1764, address: '부산광역시 해운대구 달맞이길62번길 13', category: '테마/해변열차', region: '부산' },
  '청사포': { lat: 35.1610, lng: 129.1915, address: '부산광역시 해운대구 중동', category: '관광명소', region: '부산' },
  '해동용궁사': { lat: 35.1884, lng: 129.2234, address: '부산광역시 기장군 기장읍 용궁길 86', category: '사찰/명소', region: '부산' },
  '자갈치시장': { lat: 35.0968, lng: 129.0306, address: '부산광역시 중구 자갈치해안로 52', category: '전통시장', region: '부산' },
  '송도해수욕장': { lat: 35.0760, lng: 129.0195, address: '부산광역시 서구 암남동', category: '해변', region: '부산' },
  '송도해상케이블카': { lat: 35.0772, lng: 129.0232, address: '부산광역시 서구 송도해변로 171', category: '체험/명소', region: '부산' },
  '전포 카페거리': { lat: 35.1554, lng: 129.0662, address: '부산광역시 부산진구 전포대로', category: '카페거리', region: '부산' },

  // ==================== 강원도 ====================
  '봉포해변': { lat: 38.2548, lng: 128.5658, address: '강원특별자치도 고성군 토성면 봉포리', category: '해변', region: '강원' },
  '봉포해수욕장': { lat: 38.2548, lng: 128.5658, address: '강원특별자치도 고성군 토성면 봉포리', category: '해변', region: '강원' },
  '천진해변': { lat: 38.2612, lng: 128.5589, address: '강원특별자치도 고성군 토성면 천진리', category: '해변', region: '강원' },
  '아야진해변': { lat: 38.2721, lng: 128.5523, address: '강원특별자치도 고성군 토성면 아야진리', category: '해변', region: '강원' },
  '안목해변': { lat: 37.7718, lng: 128.9478, address: '강원특별자치도 강릉시 창해로14번길 20-1', category: '해변/카페거리', region: '강원' },
  '강릉 커피거리': { lat: 37.7718, lng: 128.9478, address: '강원특별자치도 강릉시 창해로14번길 20-1', category: '카페거리', region: '강원' },
  '경포대': { lat: 37.7951, lng: 128.8967, address: '강원특별자치도 강릉시 경포로 365', category: '문화/명소', region: '강원' },
  '경포해변': { lat: 37.8055, lng: 128.9079, address: '강원특별자치도 강릉시 강문동 산1-1', category: '해변', region: '강원' },
  '경포해수욕장': { lat: 37.8055, lng: 128.9079, address: '강원특별자치도 강릉시 강문동 산1-1', category: '해변', region: '강원' },
  '강문해변': { lat: 37.7954, lng: 128.9184, address: '강원특별자치도 강릉시 강문동 102-1', category: '해변', region: '강원' },
  '정동진': { lat: 37.6913, lng: 129.0326, address: '강원특별자치도 강릉시 강동면 정동진리', category: '해변/명소', region: '강원' },
  '정동진 해변': { lat: 37.6913, lng: 129.0326, address: '강원특별자치도 강릉시 강동면 정동진리 64-3', category: '해변', region: '강원' },
  '하슬라아트월드': { lat: 37.7082, lng: 129.0118, address: '강원특별자치도 강릉시 강동면 율곡로 1441', category: '미술관/명소', region: '강원' },
  '아르떼뮤지엄 강릉': { lat: 37.7963, lng: 128.8974, address: '강원특별자치도 강릉시 난설헌로 131', category: '전시/명소', region: '강원' },
  '주문진': { lat: 37.8890, lng: 128.8285, address: '강원특별자치도 강릉시 주문진읍 주문리', category: '항구/명소', region: '강원' },
  '주문진 방사제': { lat: 37.8732, lng: 128.8478, address: '강원특별자치도 강릉시 주문진읍 교항리 81-32', category: '촬영지/명소', region: '강원' },
  '도깨비 촬영지': { lat: 37.8732, lng: 128.8478, address: '강원특별자치도 강릉시 주문진읍 교항리 81-32', category: '촬영지/명소', region: '강원' },
  '속초해수욕장': { lat: 38.1906, lng: 128.6033, address: '강원특별자치도 속초시 조양동', category: '해변', region: '강원' },
  '속초아이': { lat: 38.1906, lng: 128.6033, address: '강원특별자치도 속초시 청호해안길 2', category: '랜드마크', region: '강원' },
  '속초아이 대관람차': { lat: 38.1906, lng: 128.6033, address: '강원특별자치도 속초시 청호해안길 2', category: '랜드마크', region: '강원' },
  '속초 중앙시장': { lat: 38.2045, lng: 128.5901, address: '강원특별자치도 속초시 중앙로147번길 12', category: '전통시장', region: '강원' },
  '속초 관광수산시장': { lat: 38.2045, lng: 128.5901, address: '강원특별자치도 속초시 중앙로147번길 12', category: '전통시장', region: '강원' },
  '영금정': { lat: 38.2117, lng: 128.6015, address: '강원특별자치도 속초시 영금정로 43', category: '자연/명소', region: '강원' },
  '설악산': { lat: 38.1195, lng: 128.4656, address: '강원특별자치도 속초시 설악산로 1091', category: '자연/국립공원', region: '강원' },
  '서피비치': { lat: 38.0278, lng: 128.7175, address: '강원특별자치도 양양군 현북면 하조대해안길 119', category: '해변/서핑', region: '강원' },
  '하조대': { lat: 38.0223, lng: 128.7262, address: '강원특별자치도 양양군 현북면 하조대2길 35', category: '자연/명소', region: '강원' },
  '낙산사': { lat: 38.1251, lng: 128.6277, address: '강원특별자치도 양양군 강현면 낙산사로 100', category: '사찰/명소', region: '강원' },
  '소양강스카이워크': { lat: 37.8938, lng: 127.7226, address: '강원특별자치도 춘천시 영서로 2663', category: '관광명소', region: '강원' },
  '대관령 양떼목장': { lat: 37.6888, lng: 128.7525, address: '강원특별자치도 평창군 대관령면 대관령마루길 483-32', category: '체험/자연', region: '강원' },
  '뮤지엄 산': { lat: 37.4042, lng: 127.8725, address: '강원특별자치도 원주시 지정면 오크밸리2길 260', category: '미술관/명소', region: '강원' },

  // ==================== 경상도 (경주/포항/통영/남해) ====================
  '첨성대': { lat: 35.8347, lng: 129.2190, address: '경상북도 경주시 첨성로 140-25', category: '문화유적', region: '경주' },
  '동궁과 월지': { lat: 35.8341, lng: 129.2266, address: '경상북도 경주시 원화로 102', category: '야경/유적', region: '경주' },
  '안압지': { lat: 35.8341, lng: 129.2266, address: '경상북도 경주시 원화로 102', category: '야경/유적', region: '경주' },
  '황리단길': { lat: 35.8375, lng: 129.2096, address: '경상북도 경주시 포석로 1080', category: '핫플레이스', region: '경주' },
  '불국사': { lat: 35.7901, lng: 129.3321, address: '경상북도 경주시 불국로 385', category: '세계문화유산', region: '경주' },
  '석굴암': { lat: 35.7948, lng: 129.3492, address: '경상북도 경주시 석굴로 238', category: '세계문화유산', region: '경주' },
  '보문관광단지': { lat: 35.8453, lng: 129.2801, address: '경상북도 경주시 신평동', category: '관광명소', region: '경주' },
  '호미곶': { lat: 36.0772, lng: 129.5694, address: '경상북도 포항시 남구 호미곶면 대보리', category: '일출/명소', region: '포항' },
  '호미곶 해맞이광장': { lat: 36.0772, lng: 129.5694, address: '경상북도 포항시 남구 호미곶면 대보리', category: '일출/명소', region: '포항' },
  '스페이스워크': { lat: 36.0664, lng: 129.3807, address: '경상북도 포항시 북구 두호동 환호공원', category: '랜드마크', region: '포항' },
  '이가리 닻 전망대': { lat: 36.1772, lng: 129.3847, address: '경상북도 포항시 북구 청하면 이가리 산67-3', category: '전망대', region: '포항' },
  '통영 동피랑': { lat: 34.8461, lng: 128.4286, address: '경상남도 통영시 동피랑길', category: '벽화마을', region: '통영' },
  '동피랑 벽화마을': { lat: 34.8461, lng: 128.4286, address: '경상남도 통영시 동피랑길', category: '벽화마을', region: '통영' },
  '이순신공원': { lat: 34.8427, lng: 128.4418, address: '경상남도 통영시 멘데해안길 205', category: '공원/바다', region: '통영' },
  '디피랑': { lat: 34.8415, lng: 128.4312, address: '경상남도 통영시 남망공원길 29', category: '야경/테마파크', region: '통영' },
  '남해 독일마을': { lat: 34.8011, lng: 128.0467, address: '경상남도 남해군 삼동면 독일로 89-7', category: '이국적 마을', region: '남해' },
  '보리암': { lat: 34.7505, lng: 127.9867, address: '경상남도 남해군 상주면 보리암로 665', category: '사찰/절경', region: '남해' },
  '다랭이마을': { lat: 34.7277, lng: 127.8938, address: '경상남도 남해군 남면 남면로679번길 21', category: '전통마을', region: '남해' },

  // ==================== 전라도 / 충청도 ====================
  '전주 한옥마을': { lat: 35.8149, lng: 127.1526, address: '전북특별자치도 전주시 완산구 기린대로 99', category: '전통문화', region: '전주' },
  '경기전': { lat: 35.8153, lng: 127.1499, address: '전북특별자치도 전주시 완산구 태조로 44', category: '문화유적', region: '전주' },
  '오동도': { lat: 34.7454, lng: 127.7667, address: '전라남도 여수시 수정동 산1-11', category: '자연/섬', region: '여수' },
  '여수 밤바다': { lat: 34.7408, lng: 127.7410, address: '전라남도 여수시 하멜로 102', category: '명소/야경', region: '여수' },
  '낭만포차거리': { lat: 34.7397, lng: 127.7431, address: '전라남도 여수시 하멜로 102', category: '먹거리/야경', region: '여수' },
  '여수 해상케이블카': { lat: 34.7417, lng: 127.7502, address: '전라남도 여수시 돌산읍 돌산로 3600-1', category: '체험/명소', region: '여수' },
  '향일암': { lat: 34.5917, lng: 127.8109, address: '전라남도 여수시 돌산읍 향일암로 60', category: '일출/사찰', region: '여수' },
  '순천만습지': { lat: 34.8864, lng: 127.5097, address: '전라남도 순천시 순천만길 513-25', category: '자연/생태', region: '순천' },
  '순천만국가정원': { lat: 34.9312, lng: 127.5085, address: '전라남도 순천시 국가정원1호길 47', category: '정원/명소', region: '순천' },
  '단양 도담삼봉': { lat: 36.9934, lng: 128.3734, address: '충청북도 단양군 매포읍 삼봉로 644-33', category: '자연/명승', region: '충북' },
  '꽃지해수욕장': { lat: 36.5028, lng: 126.3353, address: '충청남도 태안군 안면읍 꽃지해안로 284', category: '해변/일몰', region: '충남' }
};

// Region presets for quick jumping in Google Place Picker
export const REGION_SHORTCUTS = [
  { name: '제주 서귀포', lat: 33.2541, lng: 126.5601, zoom: 12 },
  { name: '제주 제주시', lat: 33.5009, lng: 126.5297, zoom: 12 },
  { name: '제주 협재/애월', lat: 33.4200, lng: 126.2700, zoom: 13 },
  { name: '제주 함덕/성산', lat: 33.5000, lng: 126.8000, zoom: 12 },
  { name: '강원 강릉', lat: 37.7718, lng: 128.9100, zoom: 13 },
  { name: '강원 속초/고성', lat: 38.2000, lng: 128.5800, zoom: 13 },
  { name: '부산 해운대/광안리', lat: 35.1550, lng: 129.1400, zoom: 13 },
  { name: '경북 경주', lat: 35.8350, lng: 129.2200, zoom: 13 },
  { name: '전남 여수', lat: 34.7450, lng: 127.7500, zoom: 13 },
  { name: '서울/수도권', lat: 37.5500, lng: 126.9900, zoom: 12 }
];

/**
 * Validate Korean Coordinates bounding box
 */
export function isValidKoreanCoords(lat, lng) {
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  return (
    !isNaN(nLat) &&
    !isNaN(nLng) &&
    nLat >= 33.0 &&
    nLat <= 38.9 &&
    nLng >= 124.5 &&
    nLng <= 132.0
  );
}

/**
 * Search places across multiple engines for Google Place Picker Modal
 * 1. Internal Landmark Dictionary (instant pinpoint accuracy)
 * 2. Photon Geocoding API (Komoot OpenStreetMap POI search with Korean support)
 * 3. Nominatim Geocoding API
 */
export async function searchPlacesGoogle(query, regionHint = '') {
  if (!query || !query.trim()) return [];

  const rawQ = query.trim();
  const cleanQ = rawQ.replace(/[#@,!?()]/g, '').toLowerCase().trim();
  const results = [];
  const seenKeys = new Set();

  // 1. Search Known Locations Dictionary first (Instant & 100% accurate)
  for (const [name, info] of Object.entries(KNOWN_LOCATIONS)) {
    const lowerName = name.toLowerCase();
    const lowerAddr = (info.address || '').toLowerCase();

    if (
      lowerName.includes(cleanQ) ||
      cleanQ.includes(lowerName) ||
      lowerAddr.includes(cleanQ)
    ) {
      const key = `${info.lat.toFixed(4)}_${info.lng.toFixed(4)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `known-${name}`,
          name: name,
          address: info.address,
          category: info.category || '명소',
          region: info.region || '',
          lat: info.lat,
          lng: info.lng,
          source: 'landmark-exact'
        });
      }
    }
  }

  // 2. Query Photon Geocoder API with South Korea bias
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(rawQ)}&limit=6`;
    const response = await fetch(photonUrl);
    if (response.ok) {
      const data = await response.json();
      if (data && data.features && Array.isArray(data.features)) {
        for (const feature of data.features) {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates;
          if (!coords || coords.length < 2) continue;

          const lng = parseFloat(coords[0]);
          const lat = parseFloat(coords[1]);

          if (isValidKoreanCoords(lat, lng)) {
            const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);

              // Build readable Korean address
              const addrParts = [
                props.state || props.county,
                props.city || props.district,
                props.street,
                props.housenumber
              ].filter(Boolean);
              const builtAddr = addrParts.length > 0 ? addrParts.join(' ') : (props.name || rawQ);

              results.push({
                id: `photon-${props.osm_id || Math.random().toString(36).substr(2, 6)}`,
                name: props.name || rawQ,
                address: builtAddr,
                category: props.osm_value === 'place' ? '지역' : '위치/스팟',
                region: props.state || props.city || '',
                lat,
                lng,
                source: 'photon'
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Photon search error:', err);
  }

  // 3. Query OpenStreetMap Nominatim for Korean places / road addresses
  if (results.length < 5) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rawQ)}&countrycodes=kr&limit=5&addressdetails=1`;
      const response = await fetch(nominatimUrl, { headers: { 'Accept': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);

            if (isValidKoreanCoords(lat, lng)) {
              const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                const displayName = item.namedetails?.name || item.name || item.display_name.split(',')[0] || rawQ;
                results.push({
                  id: `osm-${item.place_id}`,
                  name: displayName,
                  address: item.display_name,
                  category: item.type || '장소',
                  region: item.address?.province || item.address?.city || '',
                  lat,
                  lng,
                  source: 'nominatim'
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim search error:', err);
    }
  }

  return results;
}

/**
 * Reverse geocode coordinates to get Korean address when user clicks on Google Map
 */
export async function reverseGeocodeCoords(lat, lng) {
  if (!isValidKoreanCoords(lat, lng)) {
    return {
      name: '선택한 위치',
      address: `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`,
      lat,
      lng
    };
  }

  const cacheKey = `rev_${lat.toFixed(5)}_${lng.toFixed(5)}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  // 1. Check if near any known landmark (within ~150 meters)
  for (const [name, info] of Object.entries(KNOWN_LOCATIONS)) {
    const latDiff = Math.abs(info.lat - lat);
    const lngDiff = Math.abs(info.lng - lng);
    if (latDiff < 0.0015 && lngDiff < 0.0015) {
      const res = {
        name,
        address: info.address || name,
        lat,
        lng,
        source: 'landmark-nearby'
      };
      geoCache.set(cacheKey, res);
      return res;
    }
  }

  // 2. Query Nominatim Reverse Geocoding
  try {
    const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ko`;
    const response = await fetch(revUrl, { headers: { 'Accept': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      if (data) {
        const addrObj = data.address || {};
        const road = addrObj.road || '';
        const houseNum = addrObj.house_number || '';
        const suburb = addrObj.suburb || addrObj.neighbourhood || addrObj.village || addrObj.town || '';
        const city = addrObj.city || addrObj.county || addrObj.district || '';
        const province = addrObj.province || addrObj.state || '';

        let cleanAddress = [province, city, suburb, road, houseNum].filter(Boolean).join(' ');
        if (!cleanAddress.trim()) {
          cleanAddress = data.display_name || '';
        }

        const spotName = data.name || (road ? `${suburb} ${road}`.trim() : suburb) || '지도에서 선택한 장소';

        const res = {
          name: spotName,
          address: cleanAddress || spotName,
          lat,
          lng,
          source: 'nominatim-reverse'
        };
        geoCache.set(cacheKey, res);
        return res;
      }
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err);
  }

  const fallback = {
    name: '지도에서 선택한 장소',
    address: `좌표 (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    lat,
    lng,
    source: 'coords-only'
  };
  geoCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * High-accuracy Korean Address Hierarchical Geocoder
 * Resolves exact coordinates for Kakao (Daum) Postcode address outputs
 */
export async function geocodeKoreanAddress(rawAddress, regionHint = '', postalDetails = null) {
  if (!rawAddress || !rawAddress.trim()) return null;

  const cleanAddr = rawAddress
    .replace(/\s+\d+층.*|\s+\d+호.*|\s+지하.*|\s*\(.*?\)/g, '')
    .trim();

  const cacheKey = `addr__${cleanAddr}_${postalDetails?.buildingName || ''}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  // 1. Direct landmark dictionary exact match check (Building Name, Clean Addr, or Raw Query)
  const candidateNames = [
    postalDetails?.buildingName,
    cleanAddr,
    rawAddress
  ].filter(Boolean);

  for (const cand of candidateNames) {
    const cleanCand = cand.trim().toLowerCase();
    for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
      const lowerKey = key.toLowerCase();
      if (cleanCand === lowerKey || cleanCand.includes(lowerKey) || lowerKey.includes(cleanCand)) {
        const res = { lat: coords.lat, lng: coords.lng, address: coords.address || cleanAddr, source: 'landmark-exact' };
        geoCache.set(cacheKey, res);
        return res;
      }
    }
  }

  // 2. Build precision search candidate queries from postal details
  const queries = [];
  queries.push(cleanAddr);

  if (postalDetails) {
    const { sido = '', sigungu = '', bname = '', roadname = '', buildingName = '', jibunAddress = '' } = postalDetails;
    if (buildingName && sigungu) queries.push(`${sigungu} ${buildingName}`);
    if (buildingName) queries.push(buildingName);
    if (jibunAddress) queries.push(jibunAddress);
    if (sigungu && bname && roadname) queries.push(`${sigungu} ${bname} ${roadname}`);
    if (sigungu && roadname) queries.push(`${sigungu} ${roadname}`);
    if (sido && sigungu && bname) queries.push(`${sido} ${sigungu} ${bname}`);
  }

  // Extract components from string: e.g. "강원특별자치도 고성군 토성면 봉포4길 3"
  const tokens = cleanAddr.split(/\s+/);
  if (tokens.length >= 3) {
    queries.push(tokens.slice(1).join(' ')); // e.g. "고성군 토성면 봉포4길 3"
    queries.push(tokens.slice(2).join(' ')); // e.g. "토성면 봉포4길 3"
  }

  // 3. Query Nominatim with structured candidates
  for (const q of queries) {
    if (!q || q.length < 2) continue;
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=kr&limit=1&addressdetails=1`;
      const response = await fetch(nominatimUrl, { headers: { 'Accept': 'application/json', 'User-Agent': 'OurTravelApp/1.0' } });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (isValidKoreanCoords(lat, lng)) {
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

  // 4. Query Photon Komoot Geocoder
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
            if (isValidKoreanCoords(lat, lng)) {
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

  // 5. Regional center fallback based on regionHint or address prefix
  const lowerAddr = (cleanAddr + ' ' + regionHint).toLowerCase();
  if (lowerAddr.includes('제주') || lowerAddr.includes('서귀포')) {
    return { lat: 33.3940, lng: 126.2397, address: cleanAddr, source: 'jeju-fallback' };
  }
  if (lowerAddr.includes('강원') || lowerAddr.includes('강릉') || lowerAddr.includes('속초') || lowerAddr.includes('고성')) {
    return { lat: 37.7718, lng: 128.9478, address: cleanAddr, source: 'gangwon-fallback' };
  }
  if (lowerAddr.includes('부산') || lowerAddr.includes('해운대') || lowerAddr.includes('광안리')) {
    return { lat: 35.1587, lng: 129.1604, address: cleanAddr, source: 'busan-fallback' };
  }
  if (lowerAddr.includes('경주')) {
    return { lat: 35.8347, lng: 129.2190, address: cleanAddr, source: 'gyeongju-fallback' };
  }
  if (lowerAddr.includes('여수') || lowerAddr.includes('순천')) {
    return { lat: 34.7454, lng: 127.7667, address: cleanAddr, source: 'yeosu-fallback' };
  }

  return { lat: 37.5665, lng: 126.9780, address: cleanAddr, source: 'default' };
}

/**
 * Geocode list of places with strict coordinate accuracy & auto-correction for corrupt legacy defaults
 */
export async function geocodePlaceList(places, regionHint = '') {
  if (!places || !Array.isArray(places) || places.length === 0) return [];

  const results = [];

  for (let index = 0; index < places.length; index++) {
    const block = places[index];
    const placeName = block.placeName || block.content || '';
    if (!placeName.trim()) continue;

    const rawAddr = (block.address || block.roadAddress || '').trim();

    // 1. Check if saved coordinates exist and are valid (NOT the corrupt legacy Seoul default for non-Seoul posts)
    let validSavedCoords = false;
    if (block.lat && block.lng && !isNaN(Number(block.lat)) && !isNaN(Number(block.lng))) {
      const savedLat = Number(block.lat);
      const savedLng = Number(block.lng);

      const isDefaultSeoul = Math.abs(savedLat - 37.5665) < 0.005 && Math.abs(savedLng - 126.9780) < 0.005;
      const indicatesNonSeoul = (rawAddr + ' ' + placeName + ' ' + regionHint).match(/제주|서귀포|강원|고성|강릉|속초|양양|춘천|평창|부산|해운대|광안리|경주|포항|여수|순천|전주|남해|통영|단양|태안/i);

      // If it is NOT a suspicious default Seoul coordinate on a regional post, preserve the saved coordinates
      if (!isDefaultSeoul || !indicatesNonSeoul) {
        validSavedCoords = true;
        results.push({
          id: block.id || `spot-${index}`,
          index: index + 1,
          name: placeName.trim(),
          address: rawAddr,
          lat: savedLat,
          lng: savedLng,
          source: 'saved-address-coords'
        });
      }
    }

    // 2. If no valid coordinates or legacy corrupt default, geocode the actual address
    if (!validSavedCoords) {
      const targetQuery = rawAddr || placeName.trim();
      const coords = await geocodeKoreanAddress(targetQuery, regionHint);
      if (coords && coords.lat && coords.lng) {
        results.push({
          id: block.id || `spot-${index}`,
          index: index + 1,
          name: placeName.trim(),
          address: rawAddr || coords.address || '',
          lat: coords.lat,
          lng: coords.lng,
          source: coords.source
        });
      }
    }
  }

  return results;
}
