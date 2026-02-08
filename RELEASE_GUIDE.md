# Dabada App Release Guide

이 문서는 웹 애플리케이션 'Dabada'를 앱 스토어(iOS) 및 플레이 스토어(Android)에 성공적으로 출시하기 위해 필요한 체크리스트와 가이드를 포함합니다.

---

## 🚀 1. 환경 변수 및 서버 설정 (Production)

앱이 정식 배포 환경에서 작동하려면 서버 설정이 올바르게 되어 있어야 합니다.

- **`NEXT_PUBLIC_APP_URL`**: `https://dabada.cloudish.cloud` (현재 설정 확인 완료)
- **`AUTH_URL`**: 서버 배포 시 반드시 `https://dabada.cloudish.cloud`로 설정되어야 합니다. (모바일 애플리케이션 로그인 시 중요)
- **CORS 설정**: 서버 엔진(Next.js API)에서 모바일 앱의 호출을 신뢰하도록 설정되어야 합니다. Capacitor 호스팅 버전 사용 중이므로 동일 도메인 호출로 처리됩니다.

## 📱 2. 네이티브 프로젝트 설정 (iOS/Android)

### 📢 AdMob 설정 (실제 ID로 교체)

현재 테스트 광고 ID가 적용되어 있습니다. 출시 직전에 실제 광고 ID로 교체해야 합니다. 교체 완료했습니다.

- **iOS (`ios/App/App/Info.plist`)**:
  - `GADApplicationIdentifier`를 실제 AdMob iOS 앱 ID로 변경.
- **Android (`android/app/src/main/AndroidManifest.xml`)**:
  - `com.google.android.gms.ads.APPLICATION_ID`를 실제 AdMob Android 앱 ID로 변경.

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

## 🛠 4. 빌드 및 배포 방법

### 🍏 iOS (App Store)

1.  **동기화**: `npx cap sync ios`
2.  **Xcode 열기**: `npx cap open ios`
3.  **버전 관리**: Xcode 프로젝트 설정에서 `Marketing Version`과 `Build`를 확인합니다.
4.  **아카이브**: 메뉴에서 `Product > Archive`를 선택하여 빌드 후 App Store Connect로 업로드합니다.

### 🤖 Android (Play Store)

1.  **동기화**: `npx cap sync android`
2.  **Android Studio 열기**: `npx cap open android`
3.  **버전 관리**: `android/app/build.gradle`에서 `versionCode`를 이전보다 높게 설정합니다.
4.  **서명 빌드**: `Build > Generate Signed Bundle / APK`를 선택하여 AAB 파일을 생성하고 Play Console에 업로드합니다.

---

## ✅ 완료된 사항 (내가 한 일)

- [x] Capacitor 플러그인 의존성 확인 및 린트 수정
- [x] AdMob 리스너 로직 안정화
- [x] `@capacitor/assets` 도구 추가 (package.json)
- [x] 앱 배포용 통합 가이드 문서 작성

## 📌 남은 작업 (사용자 확인 필요)

- [ ] 실제 AdMob App ID 발급 및 적용
- [ ] Google Cloud Console에 모바일 Client ID 등록
- [ ] 고해상도 앱 아이콘(1024x1024) 및 스플래시 화면(2732x2732) 준비 및 생성 명령 실행
- [ ] Xcode/Android Studio를 통한 최종 빌드 및 스토어 제출
