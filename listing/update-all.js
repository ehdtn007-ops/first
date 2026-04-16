const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, getDocs } = require('firebase/firestore');
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

// 실제 존재하는 건물 주소 매핑
const REAL_ADDRESSES = {
  'b10': { prov:'서울', area:'서대문구', dong:'신촌동', jibun:'134', floor:'3' },
  'b11': { prov:'서울', area:'노원구', dong:'상계동', jibun:'713', floor:'2-3' },
  'b13': { prov:'서울', area:'종로구', dong:'종로5가', jibun:'1-1', floor:'3-6' },
  'b14': { prov:'서울', area:'영등포구', dong:'영등포동', jibun:'442-5', floor:'3-5' },
  'b15': { prov:'서울', area:'영등포구', dong:'문래동3가', jibun:'54-10', floor:'2-5' },
  'b16': { prov:'서울', area:'강서구', dong:'마곡동', jibun:'757', floor:'3' },
  'b17': { prov:'서울', area:'강서구', dong:'공항동', jibun:'72-1', floor:'2-4' },
  'b18': { prov:'서울', area:'성북구', dong:'안암동5가', jibun:'1-1', floor:'2-3' },
  'b19': { prov:'서울', area:'동대문구', dong:'청량리동', jibun:'38-1', floor:'2' },
  'b2':  { prov:'서울', area:'서초구', dong:'서초동', jibun:'1574-7', floor:'3-4' },
  'b20': { prov:'서울', area:'동대문구', dong:'신설동', jibun:'102-42', floor:'2-5' },
  'b21': { prov:'서울', area:'중구', dong:'을지로3가', jibun:'295-1', floor:'3-6' },
  'b22': { prov:'서울', area:'중구', dong:'충무로4가', jibun:'125', floor:'2-9' },
  'b23': { prov:'서울', area:'광진구', dong:'화양동', jibun:'8-4', floor:'3-4' },
  'b24': { prov:'서울', area:'광진구', dong:'구의동', jibun:'243-22', floor:'2-5' },
  'b25': { prov:'서울', area:'은평구', dong:'불광동', jibun:'10-5', floor:'2-3' },
  'b26': { prov:'서울', area:'도봉구', dong:'창동', jibun:'23-8', floor:'2-3' },
  'b27': { prov:'서울', area:'강북구', dong:'수유동', jibun:'184-12', floor:'2-5' },
  'b28': { prov:'서울', area:'양천구', dong:'목1동', jibun:'404-17', floor:'3' },
  'b29': { prov:'서울', area:'양천구', dong:'신정동', jibun:'321-3', floor:'2-4' },
  'b3':  { prov:'서울', area:'송파구', dong:'잠실동', jibun:'184-7', floor:'2-3' },
  'b30': { prov:'서울', area:'관악구', dong:'신림동', jibun:'1432-21', floor:'2-3' },
  'b31': { prov:'서울', area:'관악구', dong:'봉천동', jibun:'856-4', floor:'2-3' },
  'b32': { prov:'서울', area:'관악구', dong:'남현동', jibun:'1057-1', floor:'2-4' },
  'b33': { prov:'서울', area:'성동구', dong:'행당동', jibun:'291-7', floor:'2-3' },
  'b34': { prov:'서울', area:'성동구', dong:'성수동2가', jibun:'273-12', floor:'2-5' },
  'b35': { prov:'서울', area:'중랑구', dong:'면목동', jibun:'239-8', floor:'2-3' },
  'b36': { prov:'서울', area:'금천구', dong:'가산동', jibun:'60-24', floor:'3' },
  'b37': { prov:'서울', area:'구로구', dong:'구로동', jibun:'685-88', floor:'2-5' },
  'b38': { prov:'서울', area:'동작구', dong:'노량진동', jibun:'250-15', floor:'2-4' },
  'b39': { prov:'서울', area:'동작구', dong:'사당동', jibun:'1027-3', floor:'2-3' },
  'b4':  { prov:'서울', area:'마포구', dong:'아현동', jibun:'618-2', floor:'2-3' },
  'b40': { prov:'서울', area:'강동구', dong:'천호동', jibun:'454-18', floor:'2-5' },
  'b41': { prov:'서울', area:'강동구', dong:'길동', jibun:'411-2', floor:'2-3' },
  'b42': { prov:'서울', area:'노원구', dong:'중계동', jibun:'362-9', floor:'2-5' },
  'b43': { prov:'서울', area:'서초구', dong:'방배동', jibun:'481-17', floor:'2-3' },
  'b44': { prov:'서울', area:'은평구', dong:'응암동', jibun:'99-8', floor:'2-5' },
  'b45': { prov:'서울', area:'마포구', dong:'합정동', jibun:'393-5', floor:'2-3' },
  'b46': { prov:'서울', area:'강남구', dong:'삼성동', jibun:'144-18', floor:'2-6' },
  'b47': { prov:'서울', area:'강남구', dong:'대치동', jibun:'998-1', floor:'3' },
  'b48': { prov:'서울', area:'송파구', dong:'석촌동', jibun:'165-1', floor:'2-5' },
  'b49': { prov:'서울', area:'용산구', dong:'한강로2가', jibun:'327', floor:'2-3' },
  'b5':  { prov:'서울', area:'마포구', dong:'서교동', jibun:'395-114', floor:'2-5' },
  'b6':  { prov:'서울', area:'용산구', dong:'이태원동', jibun:'119-1', floor:'2-6' },
  'b7':  { prov:'서울', area:'송파구', dong:'방이동', jibun:'44-4', floor:'2-7' },
  'b8':  { prov:'서울', area:'강남구', dong:'논현동', jibun:'49-1', floor:'2-5' },
  'b9':  { prov:'서울', area:'용산구', dong:'이태원동', jibun:'128-5', floor:'2-7' },
};

const provCodes = {
  '서울':'11','부산':'26','대구':'27','인천':'28','광주':'29',
  '대전':'30','울산':'31','세종':'36','경기':'41','강원':'42',
  '충북':'43','충남':'44','전북':'45','전남':'46','경북':'47','경남':'48','제주':'50'
};

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
  console.log('로그인 성공. 총 ' + Object.keys(REAL_ADDRESSES).length + '건 업데이트 시작...\n');

  let success = 0, fail = 0, noBldg = 0;
  const lids = Object.keys(REAL_ADDRESSES);

  for (let i = 0; i < lids.length; i++) {
    const lid = lids[i];
    const addr = REAL_ADDRESSES[lid];
    try {
      process.stdout.write('[' + (i+1) + '/' + lids.length + '] ' + lid + ' - ' + addr.dong + ' ' + addr.jibun + ' ... ');

      const bldg = await fetchBldgInfo(addr.prov, addr.area, addr.dong, addr.jibun);

      const update = {
        prov: addr.prov,
        area: addr.area,
        dong: addr.dong,
        jibun: addr.jibun,
        floor: addr.floor,
      };

      if (bldg) {
        Object.assign(update, bldg);
        console.log('OK (층수:' + (bldg.totalfloor||'-') + ' 면적:' + (bldg.area2||'-') + ' 준공:' + (bldg.year||'-') + ')');
        success++;
      } else {
        console.log('건축물대장 없음');
        noBldg++;
      }

      await updateDoc(doc(db, 'base_listings', lid), update);

      // API 부하 방지
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log('실패: ' + e.message);
      fail++;
    }
  }

  console.log('\n=== 완료 ===');
  console.log('건축물대장 성공: ' + success);
  console.log('건축물대장 없음: ' + noBldg);
  console.log('실패: ' + fail);
  process.exit(0);
}

main();
