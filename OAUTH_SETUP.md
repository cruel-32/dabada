# OAuth 설정 가이드

Google과 Apple 로그인을 위한 OAuth 설정 방법을 단계별로 안내합니다.

## 목차

1. [Google OAuth 설정](#google-oauth-설정)
2. [Apple OAuth 설정](#apple-oauth-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [테스트 방법](#테스트-방법)

---

## Google OAuth 설정

### 1단계: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 생성

1. 상단의 프로젝트 선택 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 이름 입력 (예: `dabada-auth`)
4. **"만들기"** 클릭
5. 프로젝트가 생성될 때까지 대기 (약 1-2분)

### 3단계: OAuth 동의 화면 설정

1. 왼쪽 메뉴에서 **"API 및 서비스"** > **"OAuth 동의 화면"** 선택
2. **"외부"** 선택 후 **"만들기"** 클릭
3. 앱 정보 입력:
   - **앱 이름**: `DABADA` (또는 원하는 이름)
   - **사용자 지원 이메일**: 본인 이메일 선택
   - **앱 로고**: (선택사항) 업로드
   - **앱 도메인**: (선택사항) 나중에 설정 가능
   - **개발자 연락처 정보**: 본인 이메일 입력
4. **"저장 후 계속"** 클릭
5. **"범위"** 단계에서 **"저장 후 계속"** 클릭 (기본 범위만 사용)
6. **"테스트 사용자"** 단계에서 (선택사항) 테스트용 이메일 추가
7. **"저장 후 계속"** 클릭
8. **"요약"** 단계에서 **"대시보드로 돌아가기"** 클릭

### 4단계: OAuth 2.0 클라이언트 ID 생성

1. 왼쪽 메뉴에서 **"API 및 서비스"** > **"사용자 인증 정보"** 선택
2. 상단의 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"OAuth 클라이언트 ID"** 선택
4. **"애플리케이션 유형"**: **"웹 애플리케이션"** 선택
5. **"이름"**: `DABADA Web Client` (또는 원하는 이름)
6. **"승인된 JavaScript 원본"**:
   - 개발 환경: `http://localhost:3030`
   - 프로덕션 환경: 실제 도메인 추가 (예: `https://yourdomain.com`)
7. **"승인된 리디렉션 URI"**:
   - 개발 환경: `http://localhost:3030/api/auth/callback/google`
   - 프로덕션 환경: `https://yourdomain.com/api/auth/callback/google`
8. **"만들기"** 클릭
9. 팝업 창에서 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 확인
   - ⚠️ **중요**: 클라이언트 보안 비밀번호는 이 창을 닫으면 다시 볼 수 없습니다!
   - 복사해서 안전한 곳에 보관하세요

### 5단계: OAuth 클라이언트 ID 확인

- **클라이언트 ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com` 형식
- **클라이언트 보안 비밀번호**: `GOCSPX-xxxxxxxxxxxxxxxxxxxx` 형식

---

## Apple OAuth 설정

### 1단계: Apple Developer 계정 준비

1. [Apple Developer](https://developer.apple.com/)에 접속
2. Apple ID로 로그인
3. **Apple Developer Program**에 가입되어 있어야 함 (연간 $99)
   - 가입되지 않은 경우: [가입 페이지](https://developer.apple.com/programs/enroll/)에서 가입

### 2단계: App ID 생성

1. [Apple Developer Portal](https://developer.apple.com/account/)에 로그인
2. **"Certificates, Identifiers & Profiles"** 클릭
3. 왼쪽 메뉴에서 **"Identifiers"** 선택
4. 상단의 **"+"** 버튼 클릭
5. **"App IDs"** 선택 후 **"Continue"** 클릭
6. **"App"** 선택 후 **"Continue"** 클릭
7. **Description**: `DABADA` (또는 원하는 이름)
8. **Bundle ID**: `com.yourcompany.dabada` 형식으로 입력 (예: `com.dabada.app`)
9. **"Capabilities"** 섹션에서 **"Sign In with Apple"** 체크
10. **"Continue"** 클릭 후 **"Register"** 클릭

### 3단계: Services ID 생성 (웹용)

1. **"Identifiers"** 페이지에서 상단의 **"+"** 버튼 클릭
2. **"Services IDs"** 선택 후 **"Continue"** 클릭
3. **Description**: `DABADA Web` (또는 원하는 이름)
4. **Identifier**: `com.yourcompany.dabada.web` 형식으로 입력 (예: `com.dabada.web`)
5. **"Continue"** 클릭 후 **"Register"** 클릭
6. 생성된 Services ID를 클릭하여 상세 페이지로 이동
7. **"Sign In with Apple"** 옵션 체크 후 **"Configure"** 클릭
8. **"Primary App ID"**: 위에서 생성한 App ID 선택
9. **"Website URLs"** 섹션:
   - **Domains and Subdomains**: `localhost` (개발), 실제 도메인 (프로덕션)
   - **Return URLs**: 
     - 개발: `http://localhost:3030/api/auth/callback/apple`
     - 프로덕션: `https://yourdomain.com/api/auth/callback/apple`
10. **"Next"** 클릭 후 **"Done"** 클릭
11. **"Save"** 클릭

### 4단계: Key 생성

1. 왼쪽 메뉴에서 **"Keys"** 선택
2. 상단의 **"+"** 버튼 클릭
3. **Key Name**: `DABADA Sign In Key` (또는 원하는 이름)
4. **"Sign In with Apple"** 체크
5. **"Configure"** 클릭
6. **Primary App ID**: 위에서 생성한 App ID 선택
7. **"Save"** 클릭
8. **"Continue"** 클릭 후 **"Register"** 클릭
9. ⚠️ **중요**: Key를 다운로드하세요 (`.p8` 파일)
   - 이 파일은 한 번만 다운로드 가능합니다!
   - **Key ID**도 복사해서 보관하세요

### 5단계: Team ID 확인

1. [Apple Developer Portal](https://developer.apple.com/account/) 상단 우측의 계정 정보 클릭
2. **Team ID** 확인 (예: `ABC123DEF4`)

### 6단계: Private Key 준비

다운로드한 `.p8` 파일의 내용을 확인:

```bash
# 터미널에서 확인
cat /path/to/AuthKey_XXXXXXXXXX.p8
```

또는 텍스트 에디터로 열어서 내용 복사:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

---

## 환경 변수 설정

### 개발 환경 (`.env.local`)

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=dabada
DB_PASSWORD=dabada_password
DB_NAME=dabada_db
DATABASE_URL=postgresql://dabada:dabada_password@postgres:5432/dabada_db

# Better Auth
AUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3030
NEXT_PUBLIC_AUTH_URL=http://localhost:3030

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx

# Apple OAuth
APPLE_ID=com.dabada.web
APPLE_TEAM_ID=ABC123DEF4
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----

# App Settings
MAX_STORAGE_SIZE=10737418240
DOWNLOAD_COOLDOWN_SECONDS=300
```

### AUTH_SECRET 생성 방법

터미널에서 다음 명령어 실행:

```bash
openssl rand -base64 32
```

또는 Node.js로 생성:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Apple Private Key 주의사항

`.env.local` 파일에 Private Key를 넣을 때:
- 줄바꿈을 `\n`으로 변환해야 합니다
- 전체 키를 한 줄로 작성하거나, 여러 줄로 작성할 수 있습니다

**예시 (한 줄)**:
```
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----
```

**예시 (여러 줄)** - 일부 환경 변수 로더는 지원:
```
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
```

---

## Docker Compose 환경 변수 설정

Docker Compose를 사용하는 경우, `.env` 파일을 생성하거나 환경 변수를 직접 설정:

```bash
# .env 파일 생성 (루트 디렉토리)
cat > .env << EOF
DB_USER=dabada
DB_PASSWORD=dabada_password
DB_NAME=dabada_db
AUTH_SECRET=your-generated-secret
AUTH_URL=http://localhost:3030
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_ID=com.dabada.web
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=your-private-key
EOF
```

---

## 테스트 방법

### 1. 개발 서버 시작

```bash
# Docker Compose 사용
docker compose up

# 또는 로컬에서
pnpm dev
```

### 2. 브라우저에서 접속

1. `http://localhost:3030` 접속
2. 우측 상단의 **"Sign In"** 버튼 클릭
3. 로그인 모달에서 **"Google로 로그인"** 또는 **"Apple로 로그인"** 클릭

### 3. Google 로그인 테스트

1. Google 로그인 버튼 클릭
2. Google 계정 선택 화면으로 리디렉션
3. 계정 선택 및 권한 승인
4. 자동으로 앱으로 리디렉션되어 로그인 완료

### 4. Apple 로그인 테스트

1. Apple 로그인 버튼 클릭
2. Apple ID 로그인 화면으로 리디렉션
3. Apple ID 입력 및 인증
4. 권한 승인
5. 자동으로 앱으로 리디렉션되어 로그인 완료

---

## 문제 해결

### Google OAuth 오류

**오류: "redirect_uri_mismatch"**
- Google Cloud Console의 **"승인된 리디렉션 URI"**에 정확한 URL이 등록되었는지 확인
- 개발 환경: `http://localhost:3030/api/auth/callback/google`
- 프로토콜(`http` vs `https`), 포트 번호, 경로가 정확해야 함

**오류: "invalid_client"**
- 클라이언트 ID와 클라이언트 보안 비밀번호가 올바른지 확인
- 환경 변수 이름이 정확한지 확인 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

### Apple OAuth 오류

**오류: "invalid_client"**
- Services ID가 올바른지 확인
- Return URL이 Services ID 설정과 일치하는지 확인

**오류: "invalid_key"**
- Key ID가 올바른지 확인
- Private Key가 올바르게 설정되었는지 확인 (줄바꿈 문자 포함)
- Team ID가 올바른지 확인

**오류: "unauthorized_client"**
- App ID와 Services ID가 올바르게 연결되었는지 확인
- "Sign In with Apple" 기능이 활성화되었는지 확인

### 일반적인 문제

**환경 변수가 로드되지 않음**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- Next.js를 재시작해야 환경 변수가 적용됨
- Docker Compose 사용 시 컨테이너 재시작 필요

**세션이 유지되지 않음**
- 쿠키 설정 확인 (SameSite, Secure 등)
- `AUTH_URL`과 `NEXT_PUBLIC_AUTH_URL`이 올바른지 확인

---

## 프로덕션 배포 시 주의사항

### Google OAuth

1. **승인된 JavaScript 원본**에 프로덕션 도메인 추가
2. **승인된 리디렉션 URI**에 프로덕션 URL 추가
3. OAuth 동의 화면을 **"프로덕션"**으로 변경 (테스트 모드 해제)

### Apple OAuth

1. **Return URLs**에 프로덕션 도메인 추가
2. **Domains and Subdomains**에 프로덕션 도메인 추가
3. App ID의 Bundle ID가 프로덕션과 일치하는지 확인

### 환경 변수

1. 프로덕션 환경의 `AUTH_URL`을 실제 도메인으로 변경
2. `NEXT_PUBLIC_AUTH_URL`도 동일하게 변경
3. 모든 민감한 정보는 환경 변수로 관리 (절대 코드에 하드코딩하지 않음)

---

## 참고 자료

- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In 문서](https://developer.apple.com/sign-in-with-apple/)
- [Better Auth 문서](https://www.better-auth.com/docs)

