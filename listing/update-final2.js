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

// 건축물대장 API에서 직접 확인된 sigunguCd/bjdongCd/bun/ji 사용
const FINAL = {
  'b20': {
    prov:'서울', area:'동대문구', dong:'답십리동', jibun:'292-1', floor:'2-3',
    sigunguCd:'11230', bjdongCd:'10900', bun:'0292', ji:'0001'
  },
  'b25': {
    prov:'서울', area:'은평구', dong:'수색동', jibun:'120', floor:'2-4',
    sigunguCd:'11380', bjdongCd:'10300', bun:'0120', ji:'0000'
  },
  'b26': {
    prov:'서울', area:'도봉구', dong:'도봉동', jibun:'20', floor:'2-3',
    sigunguCd:'11320', bjdongCd:'10500', bun:'0020', ji:'0000'
  },
  'b37': {
    prov:'서울', area:'구로구', dong:'신도림동', jibun:'100', floor:'2-3',
    sigunguCd:'11530', bjdongCd:'10200', bun:'0100', ji:'0000'
  },
};
// b35는 이미 성공 (상봉동 128)

async function fetchBldgDirect(sigunguCd, bjdongCd, bun, ji) {
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
  console.log('최종 업데이트 (직접 코드): ' + Object.keys(FINAL).length + '건\n');

  let success = 0, fail = 0, noBldg = 0;
  const lids = Object.keys(FINAL);

  for (let i = 0; i < lids.length; i++) {
    const lid = lids[i];
    const addr = FINAL[lid];
    try {
      process.stdout.write('[' + (i+1) + '/' + lids.length + '] ' + lid + ' - ' + addr.dong + ' ' + addr.jibun + ' ... ');
      const bldg = await fetchBldgDirect(addr.sigunguCd, addr.bjdongCd, addr.bun, addr.ji);
      const update = { prov: addr.prov, area: addr.area, dong: addr.dong, jibun: addr.jibun, floor: addr.floor };
      if (bldg) {
        Object.assign(update, bldg);
        console.log('OK (층수:' + (bldg.totalfloor||'-') + ' 면적:' + (bldg.area2||'-') + ' 준공:' + (bldg.year||'-') + ' 용도:' + (bldg.mainPurpose||'-') + ' 주차:' + (bldg.parking||0) + ')');
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

  console.log('\n=== 최종 완료 ===');
  console.log('성공: ' + success + ' / 없음: ' + noBldg + ' / 실패: ' + fail);
  process.exit(0);
}

main();
