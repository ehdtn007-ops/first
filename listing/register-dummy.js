const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyD5sY2g4t6M3U82ZJjKwQvi7-o5WuvVFFg",
  authDomain: "my-first-site-fad82.firebaseapp.com",
  projectId: "my-first-site-fad82",
  storageBucket: "my-first-site-fad82.firebasestorage.app",
  messagingSenderId: "841269966344",
  appId: "1:841269966344:web:5f534de3d2588a0ca483bd"
};

const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function getRegCode(prov, area, dong) {
  const provCodes = {'서울':'11','부산':'26','인천':'28','경기':'41'};
  const provCode = provCodes[prov];
  if (!provCode) return null;
  try {
    const res = await fetch('https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=' + provCode + '*&is_ignore_zero=true');
    const data = await res.json();
    const match = data.regcodes.find(r => r.name.includes(area) && r.name.includes(dong));
    return match ? match.code : null;
  } catch(e) { return null; }
}

async function fetchBldgInfo(prov, area, dong, jibun, floor) {
  try {
    const regCode = await getRegCode(prov, area, dong);
    if (!regCode) return {};
    const sigunguCd = regCode.substring(0, 5);
    const bjdongCd = regCode.substring(5, 10);
    const parts = jibun.replace(/-/g, ' ').split(' ');
    const bun = String(parseInt(parts[0]) || 0).padStart(4, '0');
    const ji = String(parseInt(parts[1]) || 0).padStart(4, '0');
    const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstHubService';
    const commonParam = '?serviceKey=' + encodeURIComponent(BLDG_API_KEY) + '&sigunguCd=' + sigunguCd + '&bjdongCd=' + bjdongCd + '&bun=' + bun + '&ji=' + ji + '&numOfRows=5&pageNo=1&_type=json';
    let res = await fetch(baseUrl + '/getBrTitleInfo' + commonParam);
    let json = await res.json();
    let item = json?.response?.body?.items?.item;
    let d = Array.isArray(item) ? item[0] : item;
    if (!d) {
      res = await fetch(baseUrl + '/getBrRecapTitleInfo' + commonParam);
      json = await res.json();
      item = json?.response?.body?.items?.item;
      d = Array.isArray(item) ? item[0] : item;
    }
    if (!d) return {};
    const result = {};
    if (d.grndFlrCnt) result.totalfloor = parseInt(d.grndFlrCnt);
    if (d.mainPurpsCdNm) result.mainPurpose = d.mainPurpsCdNm;
    if (d.useAprDay && d.useAprDay.length >= 8) {
      result.year = parseInt(d.useAprDay.substring(0, 4));
      result.approvedate = d.useAprDay.substring(0,4) + '-' + d.useAprDay.substring(4,6) + '-' + d.useAprDay.substring(6,8);
    }
    const parking = (parseInt(d.indrMechUtcnt)||0) + (parseInt(d.indrAutoUtcnt)||0) + (parseInt(d.oudrMechUtcnt)||0) + (parseInt(d.oudrAutoUtcnt)||0);
    result.parking = parking;
    result.illegal = d.vlawBldYn === 'Y' ? '위반건축물' : '해당없음';
    if (d.totArea) result.area2 = Math.round(parseFloat(d.totArea));
    return result;
  } catch(e) { console.log('  건축물대장 조회 실패:', e.message); return {}; }
}

const dirs = ['동향','서향','남향','북향','남동향','남서향','북동향','북서향'];

const listings = [
  // 상가 3개
  {type:'상가',deal:'월세',name:'합정역 코너상가',prov:'서울',area:'마포구',dong:'합정동',jibun:'356-1',floor:'1',
   deposit:3000,monthly:200,maintenance:20,keymoney:5000,rooms:1,baths:1,
   lat:37.5496,lng:126.9139,desc:'합정역 도보 2분. 대로변 코너 1층 상가. 유동인구 최상급. 전면 통유리 10m. 현재 카페 운영 중.'},
  {type:'상가',deal:'월세',name:'역삼동 먹자골목 상가',prov:'서울',area:'강남구',dong:'역삼동',jibun:'677-25',floor:'1-2',
   deposit:5000,monthly:350,maintenance:30,keymoney:10000,rooms:2,baths:2,
   lat:37.5010,lng:127.0396,desc:'역삼역 도보 5분. 먹자골목 핵심 위치. 1~2층 복층 구조. 주변 오피스 밀집, 점심 수요 풍부.'},
  {type:'상가',deal:'월세',name:'종로 대로변 상가',prov:'서울',area:'종로구',dong:'종로1가',jibun:'1',floor:'1',
   deposit:8000,monthly:500,maintenance:40,keymoney:0,rooms:1,baths:1,
   lat:37.5700,lng:126.9828,desc:'종로1가 대로변 1층. 유동인구 서울 최고 수준. 버스정류장 바로 앞. 무권리 즉시 입점 가능.'},

  // 사무실 3개
  {type:'사무실',deal:'월세',name:'서초동 법조타운 사무실',prov:'서울',area:'서초구',dong:'서초동',jibun:'1321-8',floor:'5',
   deposit:3000,monthly:180,maintenance:15,keymoney:2000,rooms:4,baths:1,
   lat:37.4920,lng:127.0076,desc:'서초역 도보 3분. 법원/검찰청 인접. 4룸 독립 사무실. 엘리베이터 2기. 주차 여유.'},
  {type:'사무실',deal:'월세',name:'여의도 IFC 인근 사무실',prov:'서울',area:'영등포구',dong:'여의도동',jibun:'28',floor:'8',
   deposit:5000,monthly:280,maintenance:25,keymoney:3000,rooms:6,baths:2,
   lat:37.5247,lng:126.9264,desc:'여의도역 도보 4분. IFC몰 인접. 한강 조망 가능. 금융기관 밀집지역. 넓은 회의실 포함.'},
  {type:'사무실',deal:'월세',name:'을지로 센트럴 오피스',prov:'서울',area:'중구',dong:'을지로3가',jibun:'295-1',floor:'3',
   deposit:2000,monthly:150,maintenance:10,keymoney:1000,rooms:3,baths:1,
   lat:37.5666,lng:126.9885,desc:'을지로3가역 도보 1분. 2호선/3호선 더블역세권. 중소형 사무실 최적. 리모델링 완료.'},

  // 건물매매 3개
  {type:'건물',deal:'매매',name:'성수동 신축 꼬마빌딩',prov:'서울',area:'성동구',dong:'성수동1가',jibun:'685-700',floor:'1-5',
   price:180000,rooms:10,baths:5,
   lat:37.5445,lng:127.0560,desc:'성수역 도보 7분. 2022년 신축 5층. 근생+사무실 복합. 월 수익 1,200만원. 공실 없음.'},
  {type:'건물',deal:'매매',name:'한남동 단독주택 겸 상가',prov:'서울',area:'용산구',dong:'한남동',jibun:'683-127',floor:'1-3',
   price:250000,rooms:6,baths:3,
   lat:37.5340,lng:127.0009,desc:'한남동 이태원 인접. 3층 단독건물. 1층 상가 임대 중. 리모델링 후 카페/갤러리 활용 가능. 주차 2대.'},
  {type:'건물',deal:'매매',name:'잠실 역세권 수익형 빌딩',prov:'서울',area:'송파구',dong:'잠실동',jibun:'40-1',floor:'1-6',
   price:350000,rooms:15,baths:8,
   lat:37.5133,lng:127.1002,desc:'잠실역 도보 5분. 6층 수익형 빌딩. 1층 편의점, 2~6층 사무실. 연 수익률 4.2%. 만실 운영.'}
];

(async () => {
  await signInAnonymously(auth);
  console.log('Firebase 로그인 성공');

  const allSnap = await getDocs(collection(db, 'base_listings'));
  let maxNo = 0;
  allSnap.forEach(d => { const n = d.data().no; if (typeof n === 'number' && n > maxNo) maxNo = n; });
  console.log('현재 최대 매물번호:', maxNo);

  const results = [];

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const no = maxNo + i + 1;
    const lid = 'listing_' + (Date.now() + i);
    const direction = dirs[Math.floor(Math.random() * dirs.length)];

    console.log('\n[' + (i+1) + '/9] ' + l.name + ' (' + l.type + '/' + l.deal + ') 등록 중...');

    const bldg = await fetchBldgInfo(l.prov, l.area, l.dong, l.jibun, l.floor);

    const data = {
      lid, no, type: l.type, deal: l.deal, name: l.name,
      prov: l.prov, area: l.area, dong: l.dong, jibun: l.jibun,
      floor: l.floor, direction, movein: '협의', hidden: false,
      desc: l.desc, lat: l.lat, lng: l.lng,
      registeredAt: Date.now(), registeredBy: '마스터',
      rooms: l.rooms, baths: l.baths,
      ...bldg
    };

    if (l.deal === '매매') {
      data.price = l.price;
    } else {
      data.deposit = l.deposit;
      data.monthly = l.monthly;
      data.maintenance = l.maintenance;
      data.keymoney = l.keymoney;
    }

    await setDoc(doc(db, 'base_listings', lid), data);
    console.log('  완료! 매물번호:', no, '/ lid:', lid);
    const link = 'https://ehdtn007-ops.github.io/first/?lid=' + lid;
    console.log('  링크:', link);
    results.push({ no, name: l.name, type: l.type, deal: l.deal, lid, link });
  }

  console.log('\n========================================');
  console.log('9개 매물 등록 완료!');
  console.log('========================================');
  results.forEach(r => {
    console.log('  매물번호 ' + r.no + ' | ' + r.type + '/' + r.deal + ' | ' + r.name);
    console.log('    ' + r.link);
  });

  process.exit(0);
})().catch(e => { console.error('에러:', e.message); process.exit(1); });
