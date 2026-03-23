# 홈페이지 개발 규칙

> 이 규칙은 홈페이지 코드(HTML/CSS/JS) 수정에만 적용된다.
> 매물 데이터 작업(등록/수정/삭제)은 이 규칙을 따르지 않는다. → listing.md 참조

## 절대 규칙 (위반 시 작업 무효)
- **Opus(메인 모델)는 코드를 절대 직접 수정하지 않는다.** 모든 코드 수정(Edit, Write)은 반드시 Sonnet 에이전트(Agent 도구, model=sonnet)에게 위임한다. Opus가 더 빠르거나 효율적이라도 예외 없다. (위반 시 작업 전체 무효)
- **Opus가 직접 해도 되는 것:** 분석, 계획 설명, 파일 읽기(승인 후), 테스트 실행(Bash), 커밋/푸시
- **Opus가 절대 하면 안 되는 것:** Edit, Write 도구로 코드 파일(html/css/js) 직접 수정
- 1단계에서는 Read, Grep, Glob, Bash 등 어떤 도구도 사용 금지
- 파일을 읽기 전에 반드시 "X 파일의 Y 부분을 읽겠습니다. 진행할까요?" 라고 물어봐라
- 사용자가 "응" / "yes" / "진행해" 라고 승인하기 전까지 도구 사용 불가

## 주의사항 (위반 시 절대 무효)
- 절대로 실서버(prod)에서 테스트하지 않는다. 항상 로컬에서 먼저.
- .env 파일의 내용을 절대 출력하지 않는다.
- 파일 삭제는 내가 명시적으로 요청하기 전에는 하지 않는다.
- 요청이 부동산 매물 데이터 작업인지 홈페이지 제작/개발인지 애매하면 반드시 물어보고 확인한다.
- 대화 창을 끄라고 안내하기 전에, 진행 중이던 작업 내용을 반드시 먼저 메모리에 저장한다.
- 작업 중간중간 중요한 지점(단계 완료, 복잡한 수정 후 등)마다 현재까지의 작업 내용을 `WORK_LOG.md`에 누적 기록한다. 컨텍스트가 클리어되거나 에러가 발생해도 이어서 작업할 수 있도록.
- 새 대화가 시작되면 `WORK_LOG.md`를 먼저 확인하고, 이전 작업이 남아있으면 이어서 진행할지 물어본다.

## 작업 방식 — 반드시 순서대로 진행

### 1단계: 분석 (Opus 역할)
- 요청을 정확히 파악한다. 애매한 경우 다시 물어본다.
- Opus는 절대 코드를 읽지도, 쓰지도, 수정하지도 않는다.(위반 시 절대 무효)
- 혼자 하는게 빠르다는 이유로 팀 워크플로우를 스킵할 수 없다. 속도보다 프로세스 준수가 우선.(위반 시 절대 무효)
- 팀원 소집없이 커밋, 푸시, 배포하면 작업 무효. 반드시 Phase를 거쳐야 함.
- 어떤 파일의 어느 부분을 수정할지 명확히 한다.
- 수정 계획을 먼저 말로 설명하고 시작한다.
- 이 규칙은 어떤 상황에서도 자의적으로 완화하거나 스킵할 수 없다. (위반 시 절대 무효)

### 2단계: 코딩 (Sonnet 역할 — 무조건 위임)
- **반드시 Agent 도구(model=sonnet)로 Sonnet에게 위임한다.** Opus가 직접 Edit/Write 사용 금지.
- Sonnet에게 정확한 수정 지시(파일 경로, 라인 번호, 수정 내용)를 prompt로 전달한다.
- 지시받은 부분만 수정한다 (다른 코드 건드리지 않기)
- 기존 코드 스타일 유지
- 수정 후 어떤 파일을 어떻게 바꿨는지 보고한다

### 3단계: 테스트 (Haiku 역할)
- Playwright로 해당 기능을 반드시 테스트한다
- 테스트할 URL: .env의 SITE_URL 사용
- 데스크탑(1280x800)과 모바일(375x812) 두 가지로 확인
- 스크린샷을 /tmp/ 폴더에 저장한다
- 결과를 PASS 또는 FAIL로 명확히 보고한다

### 4단계: 실패 시 자동 재시도
- FAIL이면 원인을 분석하고 다른 방법으로 다시 수정한다
- 최대 5회까지 반복한다
- 3회 연속 실패하면 접근 방법을 완전히 바꾼다
- 5회 모두 실패하면 "직접 확인이 필요합니다"라고 보고한다

## 자주 쓰는 루틴 (키워드로 실행)

**"스크린샷"** 이라고 하면:
1. 홈/로그인/대시보드 세 페이지를
2. 모바일/태블릿/데스크탑 세 가지 크기로
3. 총 9장 스크린샷을 /tmp/ 에 저장

**"로그인테스트"** 이라고 하면:
1. /login 페이지 접속
2. .env의 SITE_ID / SITE_PW 로 로그인 시도
3. 성공하면 대시보드로 이동하는지 확인
4. 결과 PASS/FAIL 보고

## 로컬 서버 실행 방법

프로젝트 경로에 한글이 있어서 `http-server`는 index.html을 못 찾음. 아래 node 스크립트로 실행:
```
node -e "const http=require('http');const fs=require('fs');const path=require('path');const url=require('url');const server=http.createServer((req,res)=>{const parsed=url.parse(req.url);let pathname=decodeURIComponent(parsed.pathname);if(pathname==='/')pathname='/index.html';let fp=path.join(process.cwd(),pathname);const ext=path.extname(fp).toLowerCase();const mt={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon'};fs.readFile(fp,(err,c)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mt[ext]||'application/octet-stream'});res.end(c);});});server.listen(3000,()=>console.log('Server on http://localhost:3000'));"
```
테스트 전 로컬 서버가 실행 중인지 확인하고, 없으면 위 명령어로 먼저 실행한다.

## 시드 데이터 안내

`index.html` 코드 내 `SEED_DATA` (b1~b49) 는 **최초 마이그레이션용 더미 데이터**입니다.
Firestore 업로드 후에는 사용되지 않으며, 실제 운영 데이터는 모두 Firestore에 있습니다.

## 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 지도에 핀이 안 뜸 | lat/lng 없음 | 관리자 페이지에서 주소 재저장 |
| 매물이 목록에 안 보임 | hidden: true | Firestore에서 hidden 필드 false로 변경 |
| 가격이 이상하게 표시 | 단위 오류 (원 vs 만원) | price 필드는 만원 단위로 입력 |
| 등록 후 지도에 바로 안 나타남 | 좌표 계산 딜레이 | 30초 후 새로고침 |
