const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// 좀 더 큰 건물이 있을 법한 지번으로 테스트
const tests = [
  // 동대문구 - 청량리 인근 상업지구
  { label:'동대문구 전농동 588-21', sigungu:'11230', bjdong:'10600', bun:'0588', ji:'0021' },
  { label:'동대문구 전농동 89-6', sigungu:'11230', bjdong:'10600', bun:'0089', ji:'0006' },
  { label:'동대문구 답십리동 292-1', sigungu:'11230', bjdong:'10900', bun:'0292', ji:'0001' },
  { label:'동대문구 장안동 55-18', sigungu:'11230', bjdong:'11000', bun:'0055', ji:'0018' },
  { label:'동대문구 청량리동 38-191', sigungu:'11230', bjdong:'10300', bun:'0038', ji:'0191' },
  // 은평구 - 다세대/상가
  { label:'은평구 응암동 8-24', sigungu:'11380', bjdong:'10500', bun:'0008', ji:'0024' },
  { label:'은평구 불광동 39-7', sigungu:'11380', bjdong:'10100', bun:'0039', ji:'0007' },
  { label:'은평구 갈현동 375-3', sigungu:'11380', bjdong:'10800', bun:'0375', ji:'0003' },
  // 도봉구
  { label:'도봉구 방학동 255-4', sigungu:'11320', bjdong:'10400', bun:'0255', ji:'0004' },
  { label:'도봉구 창동 42-7', sigungu:'11320', bjdong:'10300', bun:'0042', ji:'0007' },
  { label:'도봉구 쌍문동 77-4', sigungu:'11320', bjdong:'10200', bun:'0077', ji:'0004' },
  { label:'도봉구 쌍문동 167-23', sigungu:'11320', bjdong:'10200', bun:'0167', ji:'0023' },
  // 중랑구
  { label:'중랑구 면목동 237-5', sigungu:'11260', bjdong:'10500', bun:'0237', ji:'0005' },
  { label:'중랑구 면목동 1264', sigungu:'11260', bjdong:'10500', bun:'1264', ji:'0000' },
  { label:'중랑구 묵동 84-1', sigungu:'11260', bjdong:'10300', bun:'0084', ji:'0001' },
  // 구로구 - 좀 더 상업 건물
  { label:'구로구 구로동 611-68', sigungu:'11530', bjdong:'10100', bun:'0611', ji:'0068' },
  { label:'구로구 고척동 71-14', sigungu:'11530', bjdong:'10400', bun:'0071', ji:'0014' },
  { label:'구로구 개봉동 302-5', sigungu:'11530', bjdong:'10500', bun:'0302', ji:'0005' },
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
    if (d && parseInt(d.grndFlrCnt||0) >= 3) {
      console.log('★ ' + t.label + ' → 층수:' + d.grndFlrCnt + ' 용도:' + (d.mainPurpsCdNm||'-') + ' 준공:' + (d.useAprDay||'-') + ' 면적:' + (d.totArea||'-'));
    } else if (d) {
      console.log('○ ' + t.label + ' → 층수:' + (d.grndFlrCnt||'-') + ' 용도:' + (d.mainPurpsCdNm||'-'));
    } else {
      console.log('X  ' + t.label);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}
test();
