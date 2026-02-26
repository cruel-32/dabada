# Dabada App Release Guide

이 문서는 웹 애플리케이션 'Dabada'를 앱 스토어(iOS) 및 플레이 스토어(Android)에 성공적으로 출시하기 위해 필요한 체크리스트와 가이드를 포함합니다.

---

## 📋 적용 현황 요약

| 구분 | 항목 | 상태 | 비고 |
|------|------|------|------|
| **서버** | `NEXT_PUBLIC_APP_URL`, `AUTH_URL` | ✅ 적용됨 | `https://dabada.cloudish.cloud` |
| **AdMob** | 보상형 광고 단위 (iOS/Android) | ✅ 적용됨 | 코드 기본값으로 설정됨 |
| **AdMob** | 앱 ID (네이티브) | ⚠️ placeholder | `~0000000000` → AdMob 앱 설정에서 실제 값으로 교체 필요 |
| **소셜 로그인** | Google / Apple Client ID·권능 | ❌ 미완료 | 콘솔·개발자 계정 설정 필요 |
| **앱 리소스** | 아이콘(1024×1024), 스플래시(2732×2732) | ❌ 미완료 | `npx @capacitor/assets generate` 실행 필요 |
| **스토어** | iOS/Android 빌드 및 제출 | ❌ 미완료 | Xcode·Android Studio 아카이브·AAB 제출 |

---

## ✅ 현재 적용된 것

- **Capacitor**: 플러그인 의존성·린트 정리, `@capacitor/assets` 추가
- **AdMob**: 리스너 로직 안정화, **보상형 광고 단위** 실제 ID 적용
  - iOS: `ca-app-pub-2386475362105141/8510682156`
  - Android: `ca-app-pub-2386475362105141/7855232145`
- **AdMob 앱 ID**: 네이티브에 publisher ID 적용, **`~0000000000`은 출시 전 실제 앱 ID로 교체 필요**
- **개인정보 처리방침**: 페이지 및 푸터 링크 추가
- **릴리스 가이드**: 본 문서 작성·갱신

---

## 📌 남은 작업 (사용자 확인 필요)

1. **AdMob 앱 ID 교체**  
   `Info.plist`, `AndroidManifest.xml`의 `~0000000000`을 AdMob 콘솔 → 앱 → dabada (iOS/Android) → **앱 설정**에 표시된 실제 앱 ID(`ca-app-pub-2386475362105141~실제숫자`)로 교체

2. **Google Cloud Console**  
   모바일용 Client ID 등록 (Android 릴리스 키스토어 SHA-1 포함)

3. **Apple Developer**  
   앱 ID에 Sign In with Apple 권능 추가, 서버 `.env`의 Apple 키와 AuthKey 매칭 확인

4. **앱 아이콘·스플래시**  
   `assets/logo.png`(1024×1024), `assets/splash.png`(2732×2732) 준비 후 `npx @capacitor/assets generate` 실행

5. **스토어 제출**  
   Xcode Archive → App Store Connect, Android Signed AAB → Play Console  
   - **App Store Connect**: 앱 등록 시 **이름(App Name)**을 **"Dabada Video"**로 입력하세요. "dabada" 단독은 이미 사용 중일 수 있어 거절됩니다.

---

## 🚀 1. 환경 변수 및 서버 설정 (Production)

앱이 정식 배포 환경에서 작동하려면 서버 설정이 올바르게 되어 있어야 합니다.

- **`NEXT_PUBLIC_APP_URL`**: `https://dabada.cloudish.cloud` (현재 설정 확인 완료)
- **`AUTH_URL`**: 서버 배포 시 반드시 `https://dabada.cloudish.cloud`로 설정되어야 합니다. (모바일 애플리케이션 로그인 시 중요)
- **CORS 설정**: 서버 엔진(Next.js API)에서 모바일 앱의 호출을 신뢰하도록 설정되어야 합니다. Capacitor 호스팅 버전 사용 중이므로 동일 도메인 호출로 처리됩니다.

## 📱 2. 네이티브 프로젝트 설정 (iOS/Android)

### 📢 AdMob 설정 (배포용 적용 완료)

배포 시 실제 광고가 노출되도록 아래가 적용되어 있습니다.

- **광고 단위 (보상형)**  
  - iOS: `ca-app-pub-2386475362105141/8510682156` (미디어 다운로드를 위한 광고 시청)  
  - Android: `ca-app-pub-2386475362105141/7855232145` (동일)  
  - `hooks/use-download.ts`에서 사용. 환경 변수 `NEXT_PUBLIC_AD_MOB_IOS_UNIT`, `NEXT_PUBLIC_AD_MOB_ANDROID_UNIT`로 덮어쓸 수 있음.

- **앱 ID (네이티브)**  
  - **iOS** `ios/App/App/Info.plist`: `GADApplicationIdentifier` = `ca-app-pub-2386475362105141~0000000000`  
  - **Android** `android/app/src/main/AndroidManifest.xml`: `com.google.android.gms.ads.APPLICATION_ID` = `ca-app-pub-2386475362105141~0000000000`  
  - **출시 전 필수**: AdMob 콘솔 → 앱 → dabada (iOS/Android) → **앱 설정**에서 각 플랫폼의 **앱 ID** 전체 값을 확인한 뒤, 위 `~0000000000` 부분을 실제 값으로 교체하세요. (형식: `ca-app-pub-2386475362105141~실제숫자`)

### 🔑 소셜 로그인 설정

- **Google Login**:
  - [Google Cloud Console](https://console.cloud.google.com/)에서 각 플랫폼(iOS, Android)용 Client ID를 추가로 생성해야 합니다.
  - Android의 경우, 릴리스용 키스토어의 SHA-1 인증서를 등록해야 로그인이 작동합니다.
- **Apple Login**:
  - Apple Developer 계정에서 앱 ID에 'Sign In with Apple' 권능을 추가해야 합니다.
  - 서버의 `.env`에 등록된 `APPLE_PRIVATE_KEY` 등이 현재 프로젝트의 `AuthKey_***.p8`과 매치되는지 확인하세요.

## 🎨 3. 앱 아이콘 및 스플래시 화면 생성

Capacitor Assets 도구를 사용하여 모든 리소스를 한 번에 생성할 수 있습니다.

1.  프로젝트 루트에 `assets` 폴더를 생성합니다.
2.  폴더 안에 다음 파일들을 준비합니다:
    - `assets/logo.png` (1024x1024 이상, 투명도 없는 사각형)
    - `assets/splash.png` (2732x2732 이상, 중앙에 로고 배치)
3.  터미널에서 다음 명령어를 실행합니다:
    ```bash
    npx @capacitor/assets generate
    ```

## 🛠 4. 빌드하는 방법

### 웹(서버) 빌드

배포 서버에 올릴 때 사용합니다.

```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드 (standalone 출력)
pnpm build

# 로컬에서 프로덕션 빌드 실행
pnpm start
```

- 빌드 결과는 `.next/` (standalone 사용 시 서버 배포용 파일 포함).
- 실제 배포는 Docker 사용 시: `pnpm docker:prod:build` 등으로 서버에 올린 뒤, 앱은 `capacitor.config.ts`의 `server.url`(예: `https://dabada.cloudish.cloud`)을 로드합니다.

---

### iOS 앱 빌드 (Xcode → App Store)

1. **웹이 배포된 URL 확인**  
   `capacitor.config.ts`의 `server.url`이 실제 서비스 주소인지 확인합니다.

2. **Capacitor 동기화**
   ```bash
   npx cap sync ios
   ```

3. **Xcode에서 열기**
   ```bash
   npx cap open ios
   ```

4. **Xcode에서**
   - **버전**: 프로젝트 설정에서 `Marketing Version`, `Build` 확인·수정
   - **아카이브**: 메뉴 `Product` → `Archive` 실행 후, Organizer에서 App Store Connect에 업로드
   - **앱 이름**: App Store Connect에서 앱을 **처음 등록**할 때 이름을 **"Dabada Video"**로 입력 (단독 "dabada"는 이미 사용 중이면 거절됨)
   - **"Upload Symbols Failed" (GoogleMobileAds / UserMessagingPlatform)**: 아카이브 업로드 후 나오는 경고. AdMob·UMP SDK는 dSYM을 배포에 포함하지 않아서 생기는 것으로, **무시해도 됨**. 앱 심사·동작에는 영향 없고, 해당 구글 프레임워크 내부 크래시만 심볼이 안 보일 뿐임.

#### 애플 스토어에 앱 배포하는 방법 (전체 흐름)

**사전 준비**

- [Apple Developer Program](https://developer.apple.com/programs/) 가입 (유료, 연회비)
- Xcode가 설치된 Mac
- 앱이 실제로 동작하는 서버 URL이 배포된 상태 (`capacitor.config.ts`의 `server.url`)

---

**1단계: Xcode에서 아카이브·업로드**

1. 터미널에서 `npx cap sync ios` → `npx cap open ios` 로 프로젝트 열기
2. Xcode 상단에서 **Any iOS Device (arm64)** 선택 (시뮬레이터 말고 실제 기기)
3. **Product** → **Archive** 실행 (몇 분 소요)
4. 아카이브가 끝나면 **Organizer** 창이 뜸
5. 방금 만든 아카이브 선택 후 **Distribute App** 클릭
6. **App Store Connect** → **Upload** → 다음 단계에서 기본값 유지 후 **Upload**
7. 업로드가 끝나면 "Upload Successful" 표시 (Upload Symbols 경고는 무시)

---

**2단계: App Store Connect에서 앱 등록·정보 입력**

1. [App Store Connect](https://appstoreconnect.apple.com) 로그인
2. **앱** → **+** (앱 추가)
   - **플랫폼**: iOS
   - **이름**: **Dabada Video** (이미 사용 중인 이름이면 거절되므로 고유한 이름 사용)
   - **기본 언어**, **번들 ID**: Xcode 프로젝트와 동일하게 선택 (예: `io.dabada.app`)
   - **SKU**: 내부용 식별자 (예: `dabada-video-001`)
3. 생성된 앱 선택 후 왼쪽 메뉴에서:
   - **앱 정보**: 카테고리, 연령 등급 등
   - **가격 및 배포**: 무료/유료, 제공 국가
   - **1.0 준비 제출** (또는 해당 버전):  
     - **스크린샷** (필수): 6.7", 6.5", 5.5" 등 요구 사이즈별로 등록  
     - **앱 미리보기** (선택): 동영상  
     - **설명**, **키워드**, **홍보용 텍스트** 등  
     - **빌드**: 1단계에서 업로드한 빌드가 처리되면 여기서 **+** 로 선택  
     - **개인정보 처리방침 URL**: 서비스 개인정보처리방침 페이지 (예: `https://dabada.cloudish.cloud/ko/privacy`)  
     - **연락처 정보** 등

---

**3단계: 심사 제출**

1. **1.0 준비 제출** (또는 해당 버전) 화면에서 필수 항목이 모두 채워졌는지 확인
2. **심사를 위해 제출** 버튼 클릭
3. **수출 규정**, **광고 식별자**, **콘텐츠 권리** 등 질문에 답한 뒤 **제출**
4. Apple 심사(보통 1~3일) 후 승인되면 **출시** 가능. **앱 Store** 탭에서 **수동으로 이 버전 출시** 또는 **자동 출시** 선택

---

**요약**

| 단계 | 하는 일 |
|------|---------|
| 1 | Xcode Archive → Distribute App → App Store Connect 업로드 |
| 2 | App Store Connect에서 앱 추가·메타데이터·스크린샷·빌드 연결 |
| 3 | 심사를 위해 제출 → 승인 후 출시 |

---

### Android 앱 빌드 (Play Store)

1. **웹이 배포된 URL 확인**  
   `capacitor.config.ts`의 `server.url`이 실제 서비스 주소인지 확인합니다.

2. **Capacitor 동기화**
   ```bash
   npx cap sync android
   ```

3. **Android Studio에서 열기**
   ```bash
   npx cap open android
   ```

4. **Android Studio에서**
   - **버전**: `android/app/build.gradle`에서 `versionCode`, `versionName` 수정
   - **서명 빌드**: 아래 "키스토어로 서명하기" 절차대로 진행
   - 생성된 AAB를 Play Console에 업로드

#### 키스토어로 서명하기

**처음 한 번: 키스토어 파일 만들기**

1. Android Studio 메뉴에서 **Build** → **Generate Signed Bundle / APK** 선택.
2. **Android App Bundle** 선택 후 **Next**.
3. **Create new...** 클릭 (이미 키스토어가 있으면 **Choose existing...** 로 해당 `.jks` 또는 `.keystore` 선택 후 6번부터).
4. **New Key Store** 창에서:
   - **Key store path**: 키스토어를 저장할 경로 (예: `android/app/release.keystore`). **반드시 비밀번호·별칭·파일을 안전한 곳에 보관**하고, 분실 시 Play Store 업데이트 불가.
   - **Password**: 키스토어 비밀번호 (두 번 입력).
   - **Alias**: 키 별칭 (예: `dabada-key`).
   - **Key password**: 키 비밀번호 (별도로 둘 수 있음).
   - **Validity**: 25년 등 긴 기간 권장.
   - **Certificate** 영역: 이름·조직 등 입력 (Play Console에 표시되는 정보).
5. **OK** 후 **Next**.
6. **Build Variants**: `release` 선택.
7. **Finish** → 빌드가 끝나면 `android/app/release/` 아래에 `.aab` 파일이 생성됩니다.

**이미 키스토어가 있을 때**

1. **Build** → **Generate Signed Bundle / APK** → **Android App Bundle** → **Next**.
2. **Choose existing...** 로 기존 `.jks`(또는 `.keystore`) 파일 선택.
3. **Key store password**, **Key alias**, **Key password** 입력 후 **Next**.
4. **release** 선택 → **Finish**.

**주의**

- 키스토어 파일(`.jks`/`.keystore`)과 비밀번호·alias는 **절대 분실하면 안 됩니다**. 분실 시 같은 서명으로 업데이트할 수 없어 새 앱으로 등록해야 할 수 있습니다.
- 키스토어는 **Git에 올리지 말고** 로컬·비밀관리 도구에만 보관하세요.

---

### 미리보기 및 스크린샷 자동 생성 도구

App Store Connect·Play Console에는 기기별 스크린샷(및 선택 시 앱 미리보기 영상)이 필요합니다. 아래 도구로 자동 생성할 수 있습니다.

#### 0. 프로젝트 제공 스크립트 (권장) — 웹 URL 캡처

Capacitor 앱은 웹 URL을 로드하므로, **웹 주소만 열어서** App Store 해상도로 스크린샷을 찍는 스크립트를 두었습니다.

- **실행 (처음 한 번 puppeteer 설치)**:
  ```bash
  pnpm add -D puppeteer
  pnpm screenshots:appstore
  ```
- **"Could not find Chrome" 오류 시**: 스크립트는 macOS 기본 경로의 **Google Chrome**을 사용합니다. Chrome이 없다면  
  1) [Google Chrome](https://www.google.com/chrome/) 설치 후 다시 실행하거나  
  2) `npx puppeteer browsers install chrome` 실행 후 다시 `pnpm screenshots:appstore` 하세요.
- **결과**: 프로젝트 루트의 `screenshots-app-store/` 폴더에 `iPhone-6.9-portrait.png`, `iPhone-6.5-portrait.png`, `iPhone-5.5-portrait.png` 가 생성됩니다. 이 폴더의 이미지를 App Store Connect에 업로드하면 됩니다.
- **URL 변경**: 기본은 `https://dabada.cloudish.cloud/ko`. 다른 URL을 쓰려면 `SCREENSHOT_URL=https://... pnpm screenshots:appstore` 로 실행하세요.

#### 1. Fastlane (snapshot) — iOS, 시뮬레이터 기반

시뮬레이터에서 앱을 실행한 뒤 **UI 테스트**가 `snapshot("이름")`을 호출할 때 스크린샷이 저장됩니다. 이 프로젝트에는 **AppSnapshotUITests** UI 테스트 타깃과 공유 스킴 **App**이 설정되어 있어, 아래 명령으로 Fastlane 스크린샷을 생성할 수 있습니다.

- **설치**: `brew install fastlane` 또는 `gem install fastlane`
- **실행**: **`cd ios/App && fastlane screenshots`** (실행 위치: `.xcodeproj`가 있는 `ios/App/`)
- **결과**: `ios/App/screenshots/` 아래에 기기·언어별 스크린샷이 생성됩니다. UI 테스트는 앱 실행 후 8초 대기 뒤 `01Main` 한 장을 캡처합니다.
- **문서**: [Fastlane Screenshots](https://docs.fastlane.tools/getting-started/ios/screenshots/)
- **추가 캡처**: `ios/App/App/AppSnapshotUITests/AppSnapshotUITests.swift`에서 `snapshot("02Other")` 등을 추가한 뒤 같은 방식으로 실행하면 됩니다.
- **대안**: 웹 URL만으로 캡처하려면 위 **0. 프로젝트 제공 스크립트**를 사용하세요.

#### 2. 웹 URL 기준으로 캡처 (Puppeteer / Playwright)

앱이 웹 URL을 로드하는 경우, 해당 URL을 브라우저로 열고 뷰포트만 바꿔가며 스크린샷을 찍는 방식입니다.

- **Puppeteer**: `npx puppeteer screenshot --url=https://dabada.cloudish.cloud/ko --viewport=1284x2778 --path=6.5-portrait.png` (예시)
- **Playwright**: 비슷하게 `page.goto()` 후 `page.screenshot()`로 각 해상도 저장
- **특징**: 시뮬레이터 없이 Node만으로 실행 가능. 해상도는 아래 “필수 크기”에 맞춰 설정

#### 3. 한 장을 여러 크기로 리사이즈

이미 만든 대표 스크린샷 1장을 App Store 필수 해상도로 리사이즈할 때 사용합니다.

- **ImageMagick**: `convert input.png -resize 1284x2778! output.png` (예시)
- **온라인**: “App Store screenshot generator”, “screenshot resize tool” 등으로 검색하면 한 장 업로드 후 여러 크기로 내려받는 서비스가 있음 (유료·무료 혼재)

#### iOS 스크린샷 필수 크기 (참고)

| 디스플레이 | 세로(portrait) 예시 | 비고 |
|------------|----------------------|------|
| 6.9" | 1290×2796 또는 1320×2868 | 최신 대형 |
| 6.5" | 1284×2778 또는 1242×2688 | **가장 많이 요구** |
| 5.5" | 1242×2208 | 소형 |

- 6.9"만 올리면 작은 크기는 Apple이 축소해 씁니다. 6.5" 이상 한 세트만 있어도 되는 경우가 많습니다.
- **앱 미리보기**(동영상)는 선택 사항이며, [App preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/)에서 길이·해상도·포맷을 확인하세요.

#### Dabada에 맞는 선택

- **권장**: `pnpm add -D puppeteer` 후 **`pnpm screenshots:appstore`** 실행 → `screenshots-app-store/` 의 PNG를 App Store Connect에 업로드.
- **대안**: 서비스 URL을 브라우저에서 열고, 개발자 도구로 뷰포트를 1284×2778 등으로 맞춘 뒤 수동 캡처.

---

### 요약 (한 줄씩)

| 대상 | 순서 |
|------|------|
| **웹** | `pnpm build` → `pnpm start` 또는 Docker/호스팅 배포 |
| **iOS** | `npx cap sync ios` → `npx cap open ios` → Xcode에서 Archive → 업로드 |
| **Android** | `npx cap sync android` → `npx cap open android` → 서명 AAB 빌드 → 업로드 |

---

*적용 현황·남은 작업은 상단 **📋 적용 현황 요약** / **✅ 현재 적용된 것** / **📌 남은 작업** 섹션을 참고하세요.*
