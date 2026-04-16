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

// 법정동코드 조회
async function getRegCode(prov, area, dong) {
  // 시도코드 매핑
  const provCodes = {
    '서울': '11', '부산': '26', '대구': '27', '인천': '28', '광주': '29',
    '대전': '30', '울산': '31', '세종': '36', '경기': '41', '강원': '42',
    '충북': '43', '충남': '44', '전북': '45', '전남': '46', '경북': '47',
    '경남': '48', '제주': '50'
  };
  const provCode = provCodes[prov];
  if (!provCode) throw new Error('시/도 코드를 찾을 수 없습니다: ' + prov);

  const res = await fetch(`https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=${provCode}*&is_ignore_zero=true`);
  const data = await res.json();
  const match = data.regcodes.find(r => r.name.includes(area) && r.name.includes(dong));
  if (!match) throw new Error('법정동코드를 찾을 수 없습니다: ' + [prov, area, dong].join(' '));
  return match.code;
}

// 건축물대장 조회
async function fetchBldgInfo(prov, area, dong, jibun, floor) {
  console.log('건축물대장 조회 중...');

  const regCode = await getRegCode(prov, area, dong);
  const sigunguCd = regCode.substring(0, 5);
  const bjdongCd = regCode.substring(5, 10);

  const parts = jibun.replace(/-/g, ' ').split(' ');
  const bun = String(parseInt(parts[0]) || 0).padStart(4, '0');
  const ji = String(parseInt(parts[1]) || 0).padStart(4, '0');

  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstHubService';
  const commonParam = `?serviceKey=${encodeURIComponent(BLDG_API_KEY)}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}&numOfRows=5&pageNo=1&_type=json`;

  // 일반건축물 먼저
  let res = await fetch(baseUrl + '/getBrTitleInfo' + commonParam);
  let json = await res.json();
  let item = json?.response?.body?.items?.item;
  let d = Array.isArray(item) ? item[0] : item;

  // 없으면 집합건물
  if (!d) {
    res = await fetch(baseUrl + '/getBrRecapTitleInfo' + commonParam);
    json = await res.json();
    item = json?.response?.body?.items?.item;
    d = Array.isArray(item) ? item[0] : item;
  }

  if (!d) {
    console.log('건축물대장 정보를 찾을 수 없습니다.');
    return {};
  }

  const result = {};

  if (d.grndFlrCnt) result.totalfloor = parseInt(d.grndFlrCnt);
  if (d.mainPurpsCdNm) result.mainPurpose = d.mainPurpsCdNm;
  if (d.useAprDay && d.useAprDay.length >= 8) {
    result.year = parseInt(d.useAprDay.substring(0, 4));
    result.approvedate = `${d.useAprDay.substring(0, 4)}-${d.useAprDay.substring(4, 6)}-${d.useAprDay.substring(6, 8)}`;
  }

  const parking = (parseInt(d.indrMechUtcnt) || 0) + (parseInt(d.indrAutoUtcnt) || 0)
    + (parseInt(d.oudrMechUtcnt) || 0) + (parseInt(d.oudrAutoUtcnt) || 0);
  result.parking = parking;

  result.illegal = d.vlawBldYn === 'Y' ? '위반건축물' : '해당없음';

  // 층별 면적 조회
  const floorMatch = String(floor).match(/^(\d+)-(\d+)$/);
  if (floorMatch) {
    const startFloor = parseInt(floorMatch[1]);
    const endFloor = parseInt(floorMatch[2]);
    try {
      const resF = await fetch(baseUrl + '/getBrFlrOulnInfo' + commonParam.replace('numOfRows=5', 'numOfRows=30'));
      const jsonF = await resF.json();
      const flrItems = jsonF?.response?.body?.items?.item;
      const flrList = Array.isArray(flrItems) ? flrItems : (flrItems ? [flrItems] : []);
      let sumArea = 0;
      for (let f = startFloor; f <= endFloor; f++) {
        const matched = flrList.filter(fi => parseInt(fi.flrNo) === f);
        matched.forEach(fi => { sumArea += parseFloat(fi.area || fi.atchArea || 0); });
      }
      if (sumArea > 0) result.area2 = Math.round(sumArea);
    } catch (e) { /* 면적 조회 실패 무시 */ }
  }

  if (!result.area2 && d.totArea) result.area2 = Math.round(parseFloat(d.totArea));

  console.log('건축물대장 조회 완료:', result);
  return result;
}

async function registerListing() {
  try {
    await signInAnonymously(auth);
    console.log('로그인 성공');

    const lid = 'listing_' + Date.now();

    // 매물번호 자동 부여 (현재 최대 no + 1)
    const allSnap = await getDocs(collection(db, 'base_listings'));
    let maxNo = 0;
    allSnap.forEach(d => { const n = d.data().no; if (typeof n === 'number' && n > maxNo) maxNo = n; });
    const no = maxNo + 1;
    console.log('매물번호:', no);

    // === 매물 정보 (여기만 수정하면 됨) ===
    const prov = "서울";
    const area = "마포구";
    const dong = "합정동";
    const jibun = "356-1";
    const floor = "2-4";

    // 건축물대장 자동조회
    const bldg = await fetchBldgInfo(prov, area, dong, jibun, floor);

    // 방향 랜덤
    const dirs = ['동향','서향','남향','북향','남동향','남서향','북동향','북서향'];
    const direction = dirs[Math.floor(Math.random()*dirs.length)];

    const listingData = {
      lid,
      no,
      type: "고시원",
      gsType: "올원룸",
      deal: "월세",
      name: "합정 스카이고시원",
      prov, area, dong, jibun,
      deposit: 1500,
      monthly: 120,
      maintenance: 15,
      keymoney: 8000,
      rooms: 22,
      baths: 22,
      floor,
      direction,
      movein: "협의",
      hidden: false,
      desc: "합정역 도보 3분. 올원룸 22실 만실 운영 중. 각 실 에어컨·냉장고·책상 완비. 1층 편의점·카페 입점으로 유동인구 풍부. 2호선·6호선 더블역세권.",
      lat: 37.5496,
      lng: 126.9139,
      registeredAt: Date.now(),
      registeredBy: "마스터",
      // 건축물대장 자동입력
      ...bldg
    };

    await setDoc(doc(db, "base_listings", lid), listingData);
    console.log('매물 등록 완료!');
    console.log('매물 ID:', lid);
    console.log('Firestore:', `https://console.firebase.google.com/project/my-first-site-fad82/firestore/databases/-default-/data/base_listings/${lid}`);

    process.exit(0);
  } catch (error) {
    console.error('등록 실패:', error.message);
    process.exit(1);
  }
}

registerListing();
