const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// 각 구별로 여러 지번을 직접 테스트
const tests = [
  // 동대문구
  { label:'동대문구 제기동 56-5', sigungu:'11230', bjdong:'10200', bun:'0056', ji:'0005' },
  { label:'동대문구 전농동 620-82', sigungu:'11230', bjdong:'10600', bun:'0620', ji:'0082' },
  { label:'동대문구 용두동 15-17', sigungu:'11230', bjdong:'10100', bun:'0015', ji:'0017' },
  { label:'동대문구 답십리동 218', sigungu:'11230', bjdong:'10900', bun:'0218', ji:'0000' },
  // 은평구
  { label:'은평구 녹번동 5', sigungu:'11380', bjdong:'10200', bun:'0005', ji:'0000' },
  { label:'은평구 불광동 25', sigungu:'11380', bjdong:'10100', bun:'0025', ji:'0000' },
  { label:'은평구 역촌동 35-2', sigungu:'11380', bjdong:'10400', bun:'0035', ji:'0002' },
  // 도봉구
  { label:'도봉구 도봉동 525-1', sigungu:'11320', bjdong:'10500', bun:'0525', ji:'0001' },
  { label:'도봉구 창동 1-10', sigungu:'11320', bjdong:'10300', bun:'0001', ji:'0010' },
  { label:'도봉구 쌍문동 4-1', sigungu:'11320', bjdong:'10200', bun:'0004', ji:'0001' },
  // 중랑구
  { label:'중랑구 면목동 1748', sigungu:'11260', bjdong:'10500', bun:'1748', ji:'0000' },
  { label:'중랑구 상봉동 128-4', sigungu:'11260', bjdong:'10200', bun:'0128', ji:'0004' },
  { label:'중랑구 중화동 325-4', sigungu:'11260', bjdong:'10100', bun:'0325', ji:'0004' },
  // 구로구
  { label:'구로구 구로동 222-8', sigungu:'11530', bjdong:'10100', bun:'0222', ji:'0008' },
  { label:'구로구 구로동 97-5', sigungu:'11530', bjdong:'10100', bun:'0097', ji:'0005' },
  { label:'구로구 신도림동 337', sigungu:'11530', bjdong:'10200', bun:'0337', ji:'0000' },
];

async function test() {
  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstHubService';
  for (const t of tests) {
    const param = '?serviceKey=' + encodeURIComponent(BLDG_API_KEY) + '&sigunguCd=' + t.sigungu + '&bjdongCd=' + t.bjdong + '&bun=' + t.bun + '&ji=' + t.ji + '&numOfRows=3&pageNo=1&_type=json';
    let res = await fetch(baseUrl + '/getBrTitleInfo' + param);
    let json = await res.json();
    let item = json?.response?.body?.items?.item;
    let d = Array.isArray(item) ? item[0] : item;
    if (!d) {
      res = await fetch(baseUrl + '/getBrRecapTitleInfo' + param);
      json = await res.json();
      item = json?.response?.body?.items?.item;
      d = Array.isArray(item) ? item[0] : item;
    }
    if (d) {
      console.log('✓ ' + t.label + ' → 층수:' + (d.grndFlrCnt||'-') + ' 용도:' + (d.mainPurpsCdNm||'-') + ' 준공:' + (d.useAprDay||'-'));
    } else {
      console.log('✗ ' + t.label + ' → 없음');
    }
    await new Promise(r => setTimeout(r, 300));
  }
}
test();
