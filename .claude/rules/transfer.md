# 홈페이지 명의변경 절차

> "홈페이지 명의변경" 이라고 하면 이 절차를 실행한다.
> 기존 Firebase/GitHub를 새 계정으로 전환하는 작업.

## 사전 준비 (사용자에게 확인)

시작 전 아래 정보를 사용자에게 받는다:

| 항목 | 설명 | 예시 |
|---|---|---|
| 새 Firebase 프로젝트 ID | Firebase 콘솔에서 생성한 프로젝트 | `my-first-site-fad82` |
| 새 Firebase 웹앱 config | apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId | Firebase 콘솔 > 프로젝트 설정 > 웹앱 |
| 새 GitHub Pages 리포명 | GitHub Pages로 배포할 리포지토리 이름 | `first` |
| GitHub 사용자명 | (변경 시) | `ehdtn007-ops` |
| 새 Firebase 서비스 계정 키 | (backup.js 사용 시) .env에 넣을 JSON | Firebase 콘솔 > 서비스 계정 |

---

## 절차 (순서대로 진행)

### 1단계: firebaseConfig 교체 — 모든 파일

아래 파일들에 있는 `firebaseConfig` 객체를 새 프로젝트 값으로 교체한다.

**교체 대상 파일 목록:**

| 파일 | 위치/설명 |
|---|---|
| `index.html` | 메인 홈페이지 (프론트엔드) |
| `listing/register-listing.js` | 매물 등록 스크립트 (Node.js) |
| `listing/delete-all-listings.js` | 매물 전체 삭제 스크립트 |
| `register-listing.js` | 루트의 매물 등록 스크립트 (있는 경우) |
| `backup.js` | 백업 스크립트 (admin SDK — `projectId`만) |

**찾는 법:** `firebaseConfig` 로 grep 해서 누락 없이 전부 찾는다.

```bash
grep -r "firebaseConfig\|projectId" --include="*.js" --include="*.html" .
```

**교체할 필드 (6개):**
```javascript
const firebaseConfig = {
  apiKey: "새_API_KEY",
  authDomain: "새_PROJECT_ID.firebaseapp.com",
  projectId: "새_PROJECT_ID",
  storageBucket: "새_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "새_SENDER_ID",
  appId: "새_APP_ID"
};
```

**backup.js는 admin SDK라서 형태가 다름:**
```javascript
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: '새_PROJECT_ID'    // ← 이것만 변경
});
```

### 2단계: GitHub Pages URL 교체

`index.html` 내 OG 태그의 URL을 새 리포명으로 변경:

```html
<meta property="og:url" content="https://사용자명.github.io/새리포명/">
<meta property="og:image" content="https://사용자명.github.io/새리포명/share.png">
```

### 3단계: SEED_DATA 제거 (신규 프로젝트일 때)

새 Firebase에는 기존 시드 데이터가 없으므로 `index.html`의 `SEED_DATA` 배열과 자동 마이그레이션 로직을 제거한다.
- `SEED_DATA` 배열 전체 삭제
- `autoMigrate` / 시드 업로드 관련 함수 삭제

**주의:** 기존 매물이 있는 Firebase로 전환하는 경우, 시드 데이터 제거 여부를 사용자에게 확인한다.

### 4단계: 문서 갱신

아래 문서들의 프로젝트 정보를 새 값으로 수정:

| 파일 | 변경 내용 |
|---|---|
| `CLAUDE.md` | Firebase 프로젝트 ID, Firestore 콘솔 URL, 홈페이지 매물 링크, GitHub 리포명 |
| `.claude/rules/listing.md` | 매물 링크 URL (있는 경우) |

**CLAUDE.md 에서 바꿀 곳:**
- `홈페이지 매물 링크` → `https://사용자명.github.io/새리포명/?lid={lid}`
- `리포:` → `사용자명/새리포명`
- `Firebase 프로젝트:` → `새_PROJECT_ID`
- `Firestore 콘솔:` → `https://console.firebase.google.com/project/새_PROJECT_ID/firestore`

### 5단계: .env 업데이트

`.env` 파일에 새 Firebase 서비스 계정 키를 넣는다 (backup.js용):
- `FIREBASE_SERVICE_ACCOUNT` 값을 새 프로젝트의 서비스 계정 JSON으로 교체

### 6단계: 카카오 개발자 콘솔 설정 변경

카카오 공유(Kakao Share SDK) 사용 시, [Kakao Developers](https://developers.kakao.com) 콘솔에서 아래 항목을 새 정보로 변경한다.

1. **내 애플리케이션** → 해당 앱 선택
2. **앱 설정 → 일반**:
   - **앱 이름**: 새 담당자/사업체 이름으로 변경
   - **회사명**: 새 사업체 이름으로 변경
3. **앱 설정 → 플랫폼 → Web**:
   - **사이트 도메인**: `https://새사용자명.github.io/새리포명` 으로 변경
4. **앱 키 변경 시**: `index.html`의 카카오 SDK 초기화 코드에서 `Kakao.init('앱키')` 와 카카오 지도 SDK `appkey=` 값도 새 앱키로 교체
5. **루트 도메인 리다이렉트**: `새사용자명.github.io` 리포에 `/새리포명/`으로 리다이렉트하는 index.html이 있는지 확인. 없으면 생성. (카카오 공유 카드 하단 앱 이름 클릭 시 루트 도메인으로 이동하므로 404 방지 필요)

### 7단계: Firebase 설정 확인

새 Firebase 프로젝트에서 아래가 활성화되어 있는지 확인:
- **Firestore Database** — 생성됨
- **Authentication > 익명 인증** — 활성화됨 (Anonymous sign-in)
- **Firestore 보안 규칙** — 읽기/쓰기 허용 설정됨

### 8단계: 검증

1. `node listing/register-listing.js` 로 테스트 매물 등록 시도 → 새 Firestore에 저장되는지 확인
2. 로컬 서버 실행 → `http://localhost:3000` 에서 지도/매물 정상 로드 확인
3. Firebase 콘솔에서 `base_listings` 컬렉션 확인

### 9단계: GitHub 동기화 (사용자 승인 후)

- 사용자에게 "동기화할까요?" 확인
- 백업 파일 생성 (예: `index_backup_날짜.html`)
- 새 GitHub 리포에 push

---

## 수정 대상 파일 체크리스트

명의변경 시 빠뜨리기 쉬운 파일을 grep으로 반드시 확인:

```bash
# firebaseConfig가 있는 모든 파일 찾기
grep -rl "firebaseConfig\|projectId.*bssbs\|projectId.*기존ID" --include="*.js" --include="*.html" .

# GitHub Pages URL이 있는 모든 파일 찾기  
grep -rl "github.io/기존리포명" --include="*.html" --include="*.md" .
```

---

## 주의사항

- **기존 프로젝트의 매물 데이터는 자동으로 이전되지 않는다.** 매물 데이터 마이그레이션이 필요하면 별도로 진행.
- **API 키는 Firebase 웹앱용 공개키**이므로 index.html에 노출되어도 됨. 단 서비스 계정 키(.env)는 절대 커밋 금지.
- **backup.js의 서비스 계정**은 .env에서 읽으므로 .env만 교체하면 됨.
- index.html 외 backup용 파일(index_backup_*.html)은 교체하지 않아도 됨 (로컬 백업용).
