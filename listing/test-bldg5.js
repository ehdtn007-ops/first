const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// 이번에는 다른 동으로도 확장 (은평구, 도봉구, 중랑구가 어려움)
// 5건중 2건 확보 (동대문구 답십리동 292-1, 구로구 신도림동 100)
// 은평구/도봉구/중랑구에서 3층 이상 필요
const tests = [
  // 은평구 - 연신내/구산동 등 상업지역
  { label:'은평구 구산동 92', sigungu:'11380', bjdong:'10700', bun:'0092', ji:'0000' },
  { label:'은평구 구산동 10', sigungu:'11380', bjdong:'10700', bun:'0010', ji:'0000' },
  { label:'은평구 신사동 20', sigungu:'11380', bjdong:'11000', bun:'0020', ji:'0000' },
  { label:'은평구 신사동 225', sigungu:'11380', bjdong:'11000', bun:'0225', ji:'0000' },
  { label:'은평구 진관동 100', sigungu:'11380', bjdong:'11200', bun:'0100', ji:'0000' },
  { label:'은평구 수색동 120', sigungu:'11380', bjdong:'10300', bun:'0120', ji:'0000' },
  // 도봉구 - 좀 더 넓게
  { label:'도봉구 방학동 620', sigungu:'11320', bjdong:'10400', bun:'0620', ji:'0000' },
  { label:'도봉구 방학동 448', sigungu:'11320', bjdong:'10400', bun:'0448', ji:'0000' },
  { label:'도봉구 창동 720', sigungu:'11320', bjdong:'10300', bun:'0720', ji:'0000' },
  { label:'도봉구 쌍문동 20', sigungu:'11320', bjdong:'10200', bun:'0020', ji:'0000' },
  { label:'도봉구 쌍문동 100', sigungu:'11320', bjdong:'10200', bun:'0100', ji:'0000' },
  { label:'도봉구 도봉동 100', sigungu:'11320', bjdong:'10500', bun:'0100', ji:'0000' },
  // 중랑구
  { label:'중랑구 상봉동 128', sigungu:'11260', bjdong:'10200', bun:'0128', ji:'0000' },
  { label:'중랑구 중화동 100', sigungu:'11260', bjdong:'10100', bun:'0100', ji:'0000' },
  { label:'중랑구 면목동 50', sigungu:'11260', bjdong:'10500', bun:'0050', ji:'0000' },
  { label:'중랑구 면목동 10', sigungu:'11260', bjdong:'10500', bun:'0010', ji:'0000' },
  { label:'중랑구 신내동 100', sigungu:'11260', bjdong:'10600', bun:'0100', ji:'0000' },
  // 동대문구 추가 (더 큰 건물)
  { label:'동대문구 답십리동 150', sigungu:'11230', bjdong:'10900', bun:'0150', ji:'0000' },
  { label:'동대문구 장안동 100', sigungu:'11230', bjdong:'11000', bun:'0100', ji:'0000' },
  { label:'동대문구 용두동 100', sigungu:'11230', bjdong:'10100', bun:'0100', ji:'0000' },
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
      console.log('★ ' + t.label + ' → 층수:' + d.grndFlrCnt + ' 용도:' + (d.mainPurpsCdNm||'-') + ' 준공:' + (d.useAprDay||'-') + ' 면적:' + Math.round(parseFloat(d.totArea||0)));
    } else if (d) {
      console.log('○ ' + t.label + ' → 층수:' + (d.grndFlrCnt||'-') + ' 용도:' + (d.mainPurpsCdNm||'-'));
    } else {
      console.log('X  ' + t.label);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}
test();
