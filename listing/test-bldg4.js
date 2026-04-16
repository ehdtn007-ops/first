const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// API 조회가 잘 되는 건 bun만 있고 ji가 0000인 본번 지번인 경우가 많음
// 각 구별로 본번만으로 더 시도
const tests = [
  // 동대문구
  { label:'동대문구 답십리동 190', sigungu:'11230', bjdong:'10900', bun:'0190', ji:'0000' },
  { label:'동대문구 답십리동 120', sigungu:'11230', bjdong:'10900', bun:'0120', ji:'0000' },
  { label:'동대문구 장안동 300', sigungu:'11230', bjdong:'11000', bun:'0300', ji:'0000' },
  { label:'동대문구 장안동 463', sigungu:'11230', bjdong:'11000', bun:'0463', ji:'0000' },
  { label:'동대문구 전농동 300', sigungu:'11230', bjdong:'10600', bun:'0300', ji:'0000' },
  // 은평구
  { label:'은평구 녹번동 167', sigungu:'11380', bjdong:'10200', bun:'0167', ji:'0000' },
  { label:'은평구 불광동 39', sigungu:'11380', bjdong:'10100', bun:'0039', ji:'0000' },
  { label:'은평구 응암동 100', sigungu:'11380', bjdong:'10500', bun:'0100', ji:'0000' },
  { label:'은평구 역촌동 53', sigungu:'11380', bjdong:'10400', bun:'0053', ji:'0000' },
  // 도봉구
  { label:'도봉구 방학동 500', sigungu:'11320', bjdong:'10400', bun:'0500', ji:'0000' },
  { label:'도봉구 방학동 700', sigungu:'11320', bjdong:'10400', bun:'0700', ji:'0000' },
  { label:'도봉구 창동 100', sigungu:'11320', bjdong:'10300', bun:'0100', ji:'0000' },
  { label:'도봉구 쌍문동 500', sigungu:'11320', bjdong:'10200', bun:'0500', ji:'0000' },
  // 중랑구
  { label:'중랑구 면목동 200', sigungu:'11260', bjdong:'10500', bun:'0200', ji:'0000' },
  { label:'중랑구 면목동 100', sigungu:'11260', bjdong:'10500', bun:'0100', ji:'0000' },
  { label:'중랑구 상봉동 100', sigungu:'11260', bjdong:'10200', bun:'0100', ji:'0000' },
  { label:'중랑구 묵동 200', sigungu:'11260', bjdong:'10300', bun:'0200', ji:'0000' },
  { label:'중랑구 묵동 100', sigungu:'11260', bjdong:'10300', bun:'0100', ji:'0000' },
  // 구로구
  { label:'구로구 구로동 200', sigungu:'11530', bjdong:'10100', bun:'0200', ji:'0000' },
  { label:'구로구 개봉동 200', sigungu:'11530', bjdong:'10500', bun:'0200', ji:'0000' },
  { label:'구로구 오류동 100', sigungu:'11530', bjdong:'10600', bun:'0100', ji:'0000' },
  { label:'구로구 고척동 100', sigungu:'11530', bjdong:'10400', bun:'0100', ji:'0000' },
  { label:'구로구 신도림동 100', sigungu:'11530', bjdong:'10200', bun:'0100', ji:'0000' },
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
