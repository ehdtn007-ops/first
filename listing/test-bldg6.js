const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

// 도봉구만 집중 탐색 - 매우 넓게
const tests = [];
const dongs = [
  { name:'방학동', code:'10400' },
  { name:'창동', code:'10300' },
  { name:'쌍문동', code:'10200' },
  { name:'도봉동', code:'10500' },
];

for (const d of dongs) {
  for (const bun of [1,2,3,5,10,15,20,30,50,80,100,150,200,250,300,400,500,600]) {
    tests.push({
      label: '도봉구 ' + d.name + ' ' + bun,
      sigungu: '11320',
      bjdong: d.code,
      bun: String(bun).padStart(4,'0'),
      ji: '0000'
    });
  }
}

async function test() {
  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstHubService';
  let found = 0;
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
    if (d && parseInt(d.grndFlrCnt||0) >= 2) {
      console.log('★ ' + t.label + ' → 층수:' + d.grndFlrCnt + ' 용도:' + (d.mainPurpsCdNm||'-') + ' 준공:' + (d.useAprDay||'-') + ' 면적:' + Math.round(parseFloat(d.totArea||0)));
      found++;
      if (found >= 5) { console.log('\n충분히 찾음!'); process.exit(0); }
    }
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('\n총 ' + found + '건 발견');
}
test();
