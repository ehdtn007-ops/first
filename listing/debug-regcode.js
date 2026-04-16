const BLDG_API_KEY = '60b9aa20b5a6ba28ef15c313109fd19d4303f1e175c24af104b70690a2eac0bd';

async function debug() {
  // 법정동코드 조회
  const res = await fetch('https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=11*&is_ignore_zero=true');
  const data = await res.json();
  
  const targets = [
    { area:'동대문구', dong:'답십리동' },
    { area:'은평구', dong:'수색동' },
    { area:'도봉구', dong:'도봉동' },
    { area:'중랑구', dong:'상봉동' },
    { area:'구로구', dong:'신도림동' },
  ];
  
  for (const t of targets) {
    const match = data.regcodes.find(r => r.name.includes(t.area) && r.name.includes(t.dong));
    if (match) {
      const sigungu = match.code.substring(0,5);
      const bjdong = match.code.substring(5,10);
      console.log(t.area + ' ' + t.dong + ' → code:' + match.code + ' sigungu:' + sigungu + ' bjdong:' + bjdong + ' name:' + match.name);
    } else {
      console.log(t.area + ' ' + t.dong + ' → NOT FOUND');
      // 부분 매칭 시도
      const partials = data.regcodes.filter(r => r.name.includes(t.area) && r.name.includes(t.dong.replace('동',''))).slice(0,3);
      partials.forEach(p => console.log('  partial: ' + p.name + ' (' + p.code + ')'));
    }
  }
  
  // 직접 API 테스트 - 하드코딩 코드 vs 조회 코드 비교
  console.log('\n--- 직접 API 테스트 ---');
  // 중랑구 상봉동 128 - 직접 하드코딩으로 성공했던 것
  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstHubService';
  const hardcoded = '?serviceKey=' + encodeURIComponent(BLDG_API_KEY) + '&sigunguCd=11260&bjdongCd=10200&bun=0128&ji=0000&numOfRows=3&pageNo=1&_type=json';
  let r1 = await fetch(baseUrl + '/getBrTitleInfo' + hardcoded);
  let j1 = await r1.json();
  console.log('하드코딩(11260/10200) 상봉동 128: ' + (j1?.response?.body?.items?.item ? 'OK' : 'FAIL'));
  
  // 법정동코드로 조회한 코드 사용
  const match = data.regcodes.find(r => r.name.includes('중랑구') && r.name.includes('상봉동'));
  if (match) {
    const dynamic = '?serviceKey=' + encodeURIComponent(BLDG_API_KEY) + '&sigunguCd=' + match.code.substring(0,5) + '&bjdongCd=' + match.code.substring(5,10) + '&bun=0128&ji=0000&numOfRows=3&pageNo=1&_type=json';
    let r2 = await fetch(baseUrl + '/getBrTitleInfo' + dynamic);
    let j2 = await r2.json();
    console.log('동적코드(' + match.code.substring(0,5) + '/' + match.code.substring(5,10) + ') 상봉동 128: ' + (j2?.response?.body?.items?.item ? 'OK' : 'FAIL'));
  }
}
debug();
