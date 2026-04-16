const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

const app = initializeApp({
  apiKey: 'AIzaSyBJ90L8kSbfEhEfxJ_A1Bb5UPDQZhFFKkE',
  authDomain: 'bssbs-25cc1.firebaseapp.com',
  projectId: 'bssbs-25cc1',
  storageBucket: 'bssbs-25cc1.firebasestorage.app',
  messagingSenderId: '442806584816',
  appId: '1:442806584816:web:ae14351a86f039f4664935'
});
const db = getFirestore(app);
const auth = getAuth(app);
const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// 5차 - 확실한 대형 건물 (구청, 시장 등 주변 상업건물)
const RETRY5 = {
  'b20': { prov:'서울', area:'동대문구', dong:'제기동', jibun:'1028', floor:'2-5' },
  'b25': { prov:'서울', area:'은평구', dong:'갈현동', jibun:'300', floor:'2-3' },
  'b26': { prov:'서울', area:'도봉구', dong:'방학동', jibun:'413-5', floor:'2-3' },
  'b35': { prov:'서울', area:'중랑구', dong:'묵동', jibun:'225', floor:'2-3' },
  'b37': { prov:'서울', area:'구로구', dong:'개봉동', jibun:'73-1', floor:'2-5' },
};

const provCodes = {'서울':'11'};

async function getRegCode(prov, area, dong) {
  const provCode = provCodes[prov];
  const res = await fetch('https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=' + provCode + '*&is_ignore_zero=true');
  const data = await res.json();
  const match = data.regcodes.find(r => r.name.includes(area) && r.name.includes(dong));
  if (!match) throw new Error('법정동코드 없음: ' + [prov, area, dong].join(' '));
  return match.code;
}

async function fetchBldgInfo(prov, area, dong, jibun) {
  const regCode = await getRegCode(prov, area, dong);
  const sigunguCd = regCode.substring(0,5);
  const bjdongCd = regCode.substring(5,10);
  const parts = jibun.replace(/-/g,' ').split(' ');
  const bun = String(parseInt(parts[0])||0).padStart(4,'0');
  const ji = String(parseInt(parts[1])||0).padStart(4,'0');

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

  if (!d) return null;

  const result = {};
  if (d.grndFlrCnt) result.totalfloor = parseInt(d.grndFlrCnt);
  if (d.mainPurpsCdNm) result.mainPurpose = d.mainPurpsCdNm;
  if (d.useAprDay && d.useAprDay.length >= 8) {
    result.year = parseInt(d.useAprDay.substring(0,4));
    result.approvedate = d.useAprDay.substring(0,4)+'-'+d.useAprDay.substring(4,6)+'-'+d.useAprDay.substring(6,8);
  }
  const parking = (parseInt(d.indrMechUtcnt)||0)+(parseInt(d.indrAutoUtcnt)||0)+(parseInt(d.oudrMechUtcnt)||0)+(parseInt(d.oudrAutoUtcnt)||0);
  result.parking = parking;
  result.illegal = d.vlawBldYn === 'Y' ? '위반건축물' : '해당없음';
  if (d.totArea) result.area2 = Math.round(parseFloat(d.totArea));
  return result;
}

async function main() {
  await signInAnonymously(auth);
  console.log('5차 업데이트: ' + Object.keys(RETRY5).length + '건\n');

  let success = 0, fail = 0, noBldg = 0;
  const lids = Object.keys(RETRY5);

  for (let i = 0; i < lids.length; i++) {
    const lid = lids[i];
    const addr = RETRY5[lid];
    try {
      process.stdout.write('[' + (i+1) + '/' + lids.length + '] ' + lid + ' - ' + addr.dong + ' ' + addr.jibun + ' ... ');
      const bldg = await fetchBldgInfo(addr.prov, addr.area, addr.dong, addr.jibun);
      const update = { prov: addr.prov, area: addr.area, dong: addr.dong, jibun: addr.jibun, floor: addr.floor };
      if (bldg) {
        Object.assign(update, bldg);
        console.log('OK (층수:' + (bldg.totalfloor||'-') + ' 면적:' + (bldg.area2||'-') + ' 준공:' + (bldg.year||'-') + ')');
        success++;
      } else {
        console.log('건축물대장 없음');
        noBldg++;
      }
      await updateDoc(doc(db, 'base_listings', lid), update);
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log('실패: ' + e.message);
      fail++;
    }
  }

  console.log('\n=== 5차 완료 ===');
  console.log('성공: ' + success + ' / 없음: ' + noBldg + ' / 실패: ' + fail);
  process.exit(0);
}

main();
