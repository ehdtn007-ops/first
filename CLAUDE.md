# 이 프로젝트 소개
이 프로젝트는 [my-website] 입니다.

## 기술 스택
- Node.js 백엔드
- HTML CSS JS 기반 홈페이지

## 주요 폴더 구조
- `index.html` 등 : 홈페이지 코드
- `.claude/rules/homepage.md` : 홈페이지 개발 규칙
- `.claude/rules/listing.md` : 매물 관리 규칙
- `listing/` : 매물 등록/수정 스크립트
- `public/` : 이미지 등 정적 파일

## 사이트 정보
- 로컬 서버 주소: http://localhost:3000
- 관리자 페이지: http://localhost:3000/admin
- 계정 정보: .env 파일 참조 (master, master123)
- 홈페이지 매물 링크: `https://ehdtn007-ops.github.io/first/?lid={lid}`

## 규칙 분리 안내
- **홈페이지 코드 수정** → `.claude/rules/homepage.md` 를 따른다
- **매물 데이터 작업 (등록/수정/삭제)** → `.claude/rules/listing.md` 를 따른다
- 요청이 어느 쪽인지 애매하면 반드시 물어보고 확인한다

### 구분 기준
**매물 관리** (listing.md 적용):
- 매물등록, 매물번호, 매매가, 보증금/월세, 권리금 등 매물 데이터 언급
- "등록해", "수정해", "삭제해" + 매물 관련 내용
- 주소, 방 수, 층수 등 매물 정보 나열

**홈페이지 개발** (homepage.md 적용):
- UI, 디자인, 레이아웃, CSS, 버튼, 팝업 등 화면 관련
- 기능 추가/수정 (지도, 필터, 검색 등)
- 버그 수정 (클릭 안 됨, 안 뜸, 깨짐 등)
- 코드(HTML/CSS/JS) 수정이 필요한 모든 요청

**애매한 경우** (물어본다):
- 매물 얘기가 섞여 있지만 실제로는 코드 수정이 필요한 경우 (예: "매물 링크 클릭하면 지도가 안 움직여" → 홈페이지 개발)
- 둘 다 해당될 수 있는 요청

## 공통 주의사항
- .env 파일의 내용을 절대 출력하지 않는다.
- 파일 삭제는 명시적으로 요청하기 전에는 하지 않는다.
- 대화 창을 끄라고 안내하기 전에, 진행 중이던 작업 내용을 반드시 먼저 메모리에 저장한다.
- 작업 중간중간 중요한 지점마다 `WORK_LOG.md`에 누적 기록한다.
- 새 대화가 시작되면 `WORK_LOG.md`를 먼저 확인하고, 이전 작업이 남아있으면 이어서 진행할지 물어본다.

## GitHub 배포 (동기화) 규칙 — 절대 규칙
- **리포:** `ehdtn007-ops/first` (GitHub Pages)
- **push 전 반드시 사용자에게 "동기화할까요?" 확인을 받는다.** 자동으로 push 금지.
- **push 전 반드시 백업 파일을 만든다.** 예: `index.html` → `index_backup_20260323.html` 로컬에 복사 후 push.
- push 대상 파일만 커밋한다. `.env`, `node_modules`, `.claude` 등 올리지 않는다.

## 민감정보 보호 규칙 — 절대 규칙 (위반 시 작업 전체 무효)

> GitHub 업로드 시 민감정보 유출을 막기 위한 규칙. 어떤 상황에서도 예외 없음.

### 절대 커밋/푸시 금지 파일 (업로드 시 즉시 사고)
- **`.env`, `.env.*`, `*.env`** — ID/비밀번호, API 키 등
- **`serviceAccountKey.json`, `firebase-adminsdk-*.json`** — Firebase 관리자 키
- **`*.key`, `*.pem`, `credentials.json`, `secrets/`** — 인증서 / 자격증명

### 커밋 전 필수 점검 루틴
1. **`.gitignore` 확인** — 프로젝트 루트에 `.gitignore`가 존재하는지 먼저 확인. 없으면 만들기 전까지 커밋 금지.
2. **`git status` 로 확인** — 커밋 직전 민감파일이 스테이징에 없는지 반드시 확인.
3. **`git diff --cached` 로 확인** — 코드 내부에 하드코딩된 비밀번호/키가 있는지 확인 (master/master123 같은 하드코딩도 주의).
4. **`git add .` / `git add -A` 사용 금지** — 반드시 파일명을 명시하여 `git add index.html admin.html` 식으로 선택적 스테이징.
5. 위 중 하나라도 빠지면 push 금지.

### 민감정보가 이미 커밋된 경우
- **조용히 덮어쓰기 금지.** 사용자에게 즉시 보고한다.
- GitHub 히스토리에 남은 비밀은 `git rm` 만으로 제거되지 않는다. `.env`의 모든 비밀번호/키를 교체(rotate)해야 한다.
- 필요 시 `git filter-repo` 또는 BFG 사용은 사용자 승인 후에만.

### 출력 금지
- `.env` 파일 내용을 화면에 출력하지 않는다. `cat .env`, `Read .env` 후 그 내용을 답변에 포함 금지.
- 단, 내부적으로 읽어서 변수명 존재 여부를 확인하는 것은 가능 (값은 절대 노출 X).

## 매물 데이터 구조
> - **실제 매물 데이터** → **Firebase Firestore** 에 저장됨
> - Firebase 프로젝트: `my-first-site-fad82`
> - Firestore 콘솔: https://console.firebase.google.com/project/my-first-site-fad82/firestore
