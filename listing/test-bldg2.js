const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

const tests = [
  // 동대문구 - 더 많은 지번
  { label:'동대문구 청량리동 235-1', sigungu:'11230', bjdong:'10300', bun:'0235', ji:'0001' },
  { label:'동대문구 회기동 1-1', sigungu:'11230', bjdong:'10400', bun:'0001', ji:'0001' },
  { label:'동대문구 장안동 297-1', sigungu:'11230', bjdong:'11000', bun:'0297', ji:'0001' },
  { label:'동대문구 이문동 264-51', sigungu:'11230', bjdong:'10500', bun:'0264', ji:'0051' },
  { label:'동대문구 휘경동 281-14', sigungu:'11230', bjdong:'10700', bun:'0281', ji:'0014' },
  // 은평구 - 층수도 있는 건물
  { label:'은평구 응암동 96-1', sigungu:'11380', bjdong:'10500', bun:'0096', ji:'0001' },
  { label:'은평구 대조동 2-26', sigungu:'11380', bjdong:'10900', bun:'0002', ji:'0026' },
  { label:'은평구 증산동 180', sigungu:'11380', bjdong:'10600', bun:'0180', ji:'0000' },
  // 도봉구
  { label:'도봉구 방학동 678-2', sigungu:'11320', bjdong:'10400', bun:'0678', ji:'0002' },
  { label:'도봉구 창동 800', sigungu:'11320', bjdong:'10300', bun:'0800', ji:'0000' },
  { label:'도봉구 쌍문동 516-8', sigungu:'11320', bjdong:'10200', bun:'0516', ji:'0008' },
  { label:'도봉구 도봉동 230', sigungu:'11320', bjdong:'10500', bun:'0230', ji:'0000' },
  // 중랑구 - 상봉동 128-4 성공했으니 비슷한 것
  { label:'중랑구 상봉동 73-11', sigungu:'11260', bjdong:'10200', bun:'0073', ji:'0011' },
  { label:'중랑구 망우동 260-1', sigungu:'11260', bjdong:'10400', bun:'0260', ji:'0001' },
  // 구로구
  { label:'구로구 구로동 128-6', sigungu:'11530', bjdong:'10100', bun:'0128', ji:'0006' },
  { label:'구로구 오류동 104-5', sigungu:'11530', bjdong:'10600', bun:'0104', ji:'0005' },
  { label:'구로구 개봉동 170-1', sigungu:'11530', bjdong:'10500', bun:'0170', ji:'0001' },
  { label:'구로구 가리봉동 133-6', sigungu:'11530', bjdong:'10300', bun:'0133', ji:'0006' },
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
      console.log('OK ' + t.label + ' → 층수:' + (d.grndFlrCnt||'-') + ' 용도:' + (d.mainPurpsCdNm||'-') + ' 준공:' + (d.useAprDay||'-') + ' 면적:' + (d.totArea||'-'));
    } else {
      console.log('X  ' + t.label);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}
test();
