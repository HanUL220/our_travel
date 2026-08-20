// Korea 17 Administrative Divisions (시/도) Data & Matching Engine

export const KOREA_REGIONS = [
  {
    id: 'seoul',
    name: '서울',
    shortName: '서울',
    fullName: '서울특별시',
    emoji: '🗼',
    color: '#FF3B30',
    center: { x: 190, y: 155 },
    labelPos: { x: 190, y: 155 },
    keywords: [
      '서울', '서울특별시', '종로', '중구', '용산', '성동', '광진', '동대문', '중랑',
      '성북', '강북', '도봉', '노원', '은평', '서대문', '마포', '양천', '강서', '구로',
      '금천', '영등포', '동작', '관악', '서초', '강남', '송파', '강동', '홍대', '신촌',
      '성수', '이태원', '잠실', '명동', '여의도', '북촌', '삼청동', '익선동', '인사동',
      '남산', '한강', '롯데월드', '코엑스', 'ddp', '동대문디자인플라자', '경복궁', '창덕궁'
    ]
  },
  {
    id: 'gyeonggi',
    name: '경기',
    shortName: '경기',
    fullName: '경기도',
    emoji: '🏰',
    color: '#FF9500',
    center: { x: 215, y: 195 },
    labelPos: { x: 228, y: 200 },
    keywords: [
      '경기', '경기도', '수원', '성남', '분당', '판교', '의정부', '안양', '평촌', '부천',
      '광명', '평택', '동두천', '안산', '대부도', '고양', '일산', '과천', '구리', '남양주',
      '다산', '오산', '시흥', '오이도', '군포', '의왕', '하남', '미사', '용인', '수지',
      '기흥', '파주', '헤이리', '이천', '안성', '김포', '화성', '동탄', '제부도', '경기 광주',
      '광주시', '양주', '포천', '여주', '연천', '가평', '청평', '자라섬', '양평', '두물머리',
      '용문산', '에버랜드', '캐리비안베이', '한국민속촌', '아침고요수목원', '쁘띠프랑스'
    ]
  },
  {
    id: 'incheon',
    name: '인천',
    shortName: '인천',
    fullName: '인천광역시',
    emoji: '✈️',
    color: '#5856D6',
    center: { x: 135, y: 165 },
    labelPos: { x: 125, y: 165 },
    keywords: [
      '인천', '인천광역시', '송도', '청라', '영종도', '을왕리', '강화', '강화도', '옹진',
      '백령도', '연평도', '월미도', '차이나타운', '부평', '계양', '소래포구', '신시모도',
      '무의도', '선재도', '영흥도', '구읍뱃터'
    ]
  },
  {
    id: 'gangwon',
    name: '강원',
    shortName: '강원',
    fullName: '강원특별자치도',
    emoji: '🌲',
    color: '#34C759',
    center: { x: 335, y: 140 },
    labelPos: { x: 340, y: 135 },
    keywords: [
      '강원', '강원도', '강원특별자치도', '춘천', '원주', '강릉', '정동진', '주문진', '안목',
      '경포', '동해', '묵호', '삼척', '장호항', '태백', '속초', '대포항', '설악', '설악산',
      '영월', '평창', '대관령', '휘닉스', '정선', '하이원', '철원', '화천', '양구', '인제',
      '자작나무숲', '고성', '간성', '화진포', '양양', '서피비치', '낙산', '하조대', '죽도',
      '인구', '홍천', '비발디파크', '남이섬', '소양강', '오죽헌'
    ]
  },
  {
    id: 'chungbuk',
    name: '충북',
    shortName: '충북',
    fullName: '충청북도',
    emoji: '🏞️',
    color: '#00C7BE',
    center: { x: 260, y: 275 },
    labelPos: { x: 265, y: 275 },
    keywords: [
      '충북', '충청북도', '청주', '상당산성', '충주', '충주호', '중앙탑', '제천', '청풍호',
      '의림지', '보은', '속리산', '법주사', '옥천', '영동', '와인', '증평', '진천', '괴산',
      '산막이옛길', '음성', '단양', '도담삼봉', '만천하스카이워크', '구담봉', '사인암'
    ]
  },
  {
    id: 'chungnam',
    name: '충남',
    shortName: '충남',
    fullName: '충청남도',
    emoji: '🌊',
    color: '#32ADE6',
    center: { x: 165, y: 285 },
    labelPos: { x: 155, y: 295 },
    keywords: [
      '충남', '충청남도', '천안', '독립기념관', '공주', '공산성', '마곡사', '무령왕릉',
      '보령', '대천', '머드', '무창포', '아산', '온양', '신정호', '외암민속마을', '서산',
      '해미읍성', '논산', '탑정호', '당진', '왜목마을', '삽교호', '아미미술관', '금산',
      '부여', '궁남지', '낙화암', '정림사지', '서천', '신성리갈대밭', '청양', '홍성',
      '예산', '예당호', '출렁다리', '수덕사', '태안', '안면도', '꽃지', '만리포', '몽산포', '천리포'
    ]
  },
  {
    id: '대전',
    id: 'daejeon',
    name: '대전',
    shortName: '대전',
    fullName: '대전광역시',
    emoji: '🔬',
    color: '#007AFF',
    center: { x: 215, y: 315 },
    labelPos: { x: 215, y: 315 },
    keywords: [
      '대전', '대전광역시', '유성', '유성온천', '성심당', '엑스포', '한빛탑', '둔산',
      '대덕', '계족산', '대청호', '오월드', '소제동', '은행동'
    ]
  },
  {
    id: 'sejong',
    name: '세종',
    shortName: '세종',
    fullName: '세종특별자치시',
    emoji: '🏛️',
    color: '#5AC8FA',
    center: { x: 200, y: 280 },
    labelPos: { x: 200, y: 280 },
    keywords: [
      '세종', '세종시', '세종특별자치시', '조치원', '세종호수공원', '국립세종수목원', '금강보행교'
    ]
  },
  {
    id: 'jeonbuk',
    name: '전북',
    shortName: '전북',
    fullName: '전북특별자치도',
    emoji: '🍱',
    color: '#AF52DE',
    center: { x: 190, y: 390 },
    labelPos: { x: 185, y: 395 },
    keywords: [
      '전북', '전라북도', '전북특별자치도', '전주', '한옥마을', '덕진공원', '경기전', '객리단길',
      '군산', '선유도', '고군산군도', '이성당', '초원사진관', '경암동철길마을', '익산',
      '미륵사지', '정읍', '내장산', '남원', '광한루', '지리산', '김제', '완주', '대둔산',
      '아원고택', '진안', '마이산', '무주', '덕유산', '반디랜드', '장수', '임실', '치즈마을',
      '옥정호', '순창', '강천산', '고창', '선운사', '청보리밭', '부안', '변산', '변산반도',
      '채석강', '내소사', '격포'
    ]
  },
  {
    id: 'jeonnam',
    name: '전남',
    shortName: '전남',
    fullName: '전라남도',
    emoji: '🌅',
    color: '#FF2D55',
    center: { x: 165, y: 500 },
    labelPos: { x: 155, y: 500 },
    keywords: [
      '전남', '전라남도', '목포', '유달산', '해상케이블카', '평화광장', '여수', '오동도',
      '돌산', '향일암', '낭만포차', '해상케이블카', '웅천', '순천', '순천만', '순천만국가정원',
      '낙안읍성', '나주', '광양', '매화마을', '담양', '죽녹원', '메타세콰이어', '관방제림',
      '곡성', '기차마을', '섬진강', '구례', '산수유', '화엄사', '고흥', '나로우주센터',
      '보성', '녹차밭', '율포', '화순', '장흥', '강진', '다산초당', '가우도', '해남',
      '땅끝마을', '두륜산', '영암', '월출산', '무안', '함평', '영광', '백수해안도로',
      '장성', '축령산', '완도', '청산도', '보길도', '진도', '팽목항', '운림산방', '쏠비치진도',
      '신안', '천사대교', '퍼플교', '퍼플섬', '자은도', '흑산도', '홍도'
    ]
  },
  {
    id: 'gwangju',
    name: '광주',
    shortName: '광주',
    fullName: '광주광역시',
    emoji: '🎨',
    color: '#FF6482',
    center: { x: 165, y: 440 },
    labelPos: { x: 165, y: 440 },
    keywords: [
      '광주광역시', '무등산', '상무지구', '충장로', '양림동', '펭귄마을', '국립아시아문화전당',
      'acc', '송정역시장', '첨단'
    ]
  },
  {
    id: 'gyeongbuk',
    name: '경북',
    shortName: '경북',
    fullName: '경상북도',
    emoji: '🏯',
    color: '#FF9F0A',
    center: { x: 360, y: 280 },
    labelPos: { x: 365, y: 280 },
    keywords: [
      '경북', '경상북도', '포항', '호미곶', '영일대', '스페이스워크', '구룡포', '이가리닻전망대',
      '경주', '보문', '황리단길', '첨성대', '동궁과월지', '불국사', '석굴암', '월정교', '대릉원',
      '김천', '직지사', '안동', '하회마을', '월영교', '도산서원', '구미', '금오산', '영주',
      '부석사', '소수서원', '영천', '상주', '경천대', '문경', '문경새재', '경산', '군위',
      '화본역', '사유원', '의성', '조문국', '청송', '주왕산', '영양', '영덕', '강구항',
      '해맞이공원', '청도', '와인터널', '고령', '대가야', '성주', '칠곡', '예천', '회룡포',
      '봉화', '울진', '덕구온천', '불영사', '울릉', '울릉도', '독도'
    ]
  },
  {
    id: 'gyeongnam',
    name: '경남',
    shortName: '경남',
    fullName: '경상남도',
    emoji: '⛵',
    color: '#30B0C7',
    center: { x: 300, y: 435 },
    labelPos: { x: 295, y: 445 },
    keywords: [
      '경남', '경상남도', '창원', '마산', '진해', '여좌천', '경화역', '군항제', '진주',
      '진주성', '남강', '유등축제', '통영', '동피랑', '서피랑', '이순신공원', '디피랑',
      '케이블카', '루지', '사천', '삼천포', '바다케이블카', '김해', '가야테마파크', '봉리단길',
      '밀양', '영남루', '위양지', '거제', '거제도', '바람의언덕', '신선대', '매미성', '외도',
      '해금강', '학동몽돌', '양산', '통도사', '의령', '함안', '악양생태공원', '창녕', '우포늪',
      '경남 고성', '상족암', '공룡엑스포', '남해', '독일마을', '보리암', '다랭이마을', '미조항',
      '하동', '쌍계사', '화개장터', '최참판댁', '스타웨이하동', '산청', '동의보감촌', '함양',
      '상림공원', '거창', '수승대', 'Y자형출렁다리', '합천', '해인사', '황매산', '영상테마파크'
    ]
  },
  {
    id: 'daegu',
    name: '대구',
    shortName: '대구',
    fullName: '대구광역시',
    emoji: '🍎',
    color: '#FF375F',
    center: { x: 335, y: 355 },
    labelPos: { x: 335, y: 355 },
    keywords: [
      '대구', '대구광역시', '동성로', '수성못', '팔공산', '갓바위', '김광석', '김광석거리',
      '이월드', '83타워', '앞산', '앞산전망대', '서문시장', '동화사', '스파크랜드'
    ]
  },
  {
    id: 'ulsan',
    name: '울산',
    shortName: '울산',
    fullName: '울산광역시',
    emoji: '🐋',
    color: '#64D2FF',
    center: { x: 410, y: 395 },
    labelPos: { x: 410, y: 395 },
    keywords: [
      '울산', '울산광역시', '간절곶', '태화강', '국가정원', '십리대숲', '대왕암', '대왕암공원',
      '출렁다리', '방어진', '슬도', '장생포', '고래문화마을', '영남알프스', '간월재', '신불산',
      '자수정동굴나라'
    ]
  },
  {
    id: 'busan',
    name: '부산',
    shortName: '부산',
    fullName: '부산광역시',
    emoji: '🏖️',
    color: '#0A84FF',
    center: { x: 385, y: 450 },
    labelPos: { x: 395, y: 455 },
    keywords: [
      '부산', '부산광역시', '해운대', '광안리', '광안대교', '서면', '영도', '흰여울문화마을',
      '태종대', '남포동', '자갈치', '국제시장', '기장', '해동용궁사', '아난티', '연화리',
      '송정', '송도', '송도해수욕장', '다대포', '동래', '온천천', '금정산', '감천문화마을',
      '청사포', '미포', '블루라인파크', '더베이101', '센텀시티', '송도케이블카', '오륙도'
    ]
  },
  {
    id: 'jeju',
    name: '제주',
    shortName: '제주',
    fullName: '제주특별자치도',
    emoji: '🍊',
    color: '#FF9500',
    center: { x: 135, y: 640 },
    labelPos: { x: 135, y: 640 },
    keywords: [
      '제주', '제주도', '제주시', '제주특별자치도', '서귀포', '서귀포시', '우도', '애월',
      '한담해변', '협재', '금능', '성산', '성산일출봉', '섭지코지', '조천', '함덕', '구좌',
      '월정리', '세화', '평대', '종달리', '한림', '표선', '중문', '중문관광단지', '한라산',
      '백록담', '영실', '산방산', '용머리해안', '송악산', '가파도', '마라도', '비양도',
      '추자도', '사려니숲길', '비자림', '천지연', '정방폭포', '카멜리아힐', '스누피가든',
      '아르떼뮤지엄', '빛의시어터', '오설록', '새별오름', '용눈이오름', '금오름', '이호테우'
    ]
  }
];

// Fast Lookup Map by ID
export const REGION_MAP = KOREA_REGIONS.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

/**
 * Match post to one of the 17 Korean administrative regions
 * @param {Object} post 
 * @returns {Object|null} Region object or null if unmatched
 */
export function getPostRegion(post) {
  if (!post) return null;

  const textToSearch = [];

  // 1. Location field has top priority
  if (post.location && typeof post.location === 'string') {
    textToSearch.push(post.location.trim().toLowerCase());
  }

  // 2. Place blocks (extracted spot names and descriptions)
  if (post.blocks && Array.isArray(post.blocks)) {
    for (const b of post.blocks) {
      if (b.type === 'place' && b.placeName) {
        textToSearch.push(b.placeName.trim().toLowerCase());
      }
      if (b.placeAddress) {
        textToSearch.push(b.placeAddress.trim().toLowerCase());
      }
    }
  }

  // 3. Post Title & Summary fallback
  if (post.title && typeof post.title === 'string') {
    textToSearch.push(post.title.trim().toLowerCase());
  }
  if (post.summary && typeof post.summary === 'string') {
    textToSearch.push(post.summary.trim().toLowerCase());
  }

  const fullText = textToSearch.join(' ');
  if (!fullText.trim()) return null;

  // Exact / Longest match first to avoid false positives (e.g. '강원도 고성' vs '경남 고성')
  // Specific disambiguation rules:
  if (fullText.includes('강원') && fullText.includes('고성')) return REGION_MAP['gangwon'];
  if (fullText.includes('경남') && fullText.includes('고성')) return REGION_MAP['gyeongnam'];
  if (fullText.includes('경기') && fullText.includes('광주')) return REGION_MAP['gyeonggi'];
  if (fullText.includes('광주광역시') || fullText.includes('광주 무등산') || fullText.includes('상무지구')) return REGION_MAP['gwangju'];

  // Score each region by keyword matches
  let bestRegion = null;
  let highestScore = 0;

  for (const region of KOREA_REGIONS) {
    let score = 0;

    // Check full name & short name
    if (fullText.includes(region.fullName.toLowerCase())) score += 10;
    if (fullText.includes(region.name.toLowerCase())) score += 5;

    // Check keywords
    for (const kw of region.keywords) {
      const lowerKw = kw.toLowerCase();
      if (fullText.includes(lowerKw)) {
        // Longer keyword matches are weighted more specifically
        score += Math.max(2, lowerKw.length);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestRegion = region;
    }
  }

  return highestScore > 0 ? bestRegion : null;
}

/**
 * Group posts by 17 Korean regions
 * @param {Array} posts 
 * @returns {Object} { [regionId]: { region: Object, posts: Array, count: number } }
 */
export function groupPostsByRegion(posts = []) {
  const result = {};

  // Initialize all 17 regions
  for (const r of KOREA_REGIONS) {
    result[r.id] = {
      region: r,
      posts: [],
      count: 0
    };
  }

  // Also include unmatched bucket if any
  result['other'] = {
    region: {
      id: 'other',
      name: '기타 / 해외',
      shortName: '기타',
      fullName: '기타 및 해외 여행지',
      emoji: '🌏',
      color: '#8E8E93',
      center: { x: 0, y: 0 }
    },
    posts: [],
    count: 0
  };

  for (const post of posts) {
    const matchedRegion = getPostRegion(post);
    if (matchedRegion && result[matchedRegion.id]) {
      result[matchedRegion.id].posts.push(post);
      result[matchedRegion.id].count += 1;
    } else {
      result['other'].posts.push(post);
      result['other'].count += 1;
    }
  }

  return result;
}
