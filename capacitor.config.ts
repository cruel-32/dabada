import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.dabada.app',
  appName: 'dabada',
  webDir: 'public', // External Server 방식을 사용하므로 로컬 디렉토리는 public으로 지정
  server: {
    // 🚨 중요: 실제 배포된 웹사이트 주소로 변경해주세요. (예: https://dabada.io)
    // 로컬 개발 중에는 http://자신의-IP-주소:3000 을 사용하세요.
    url: 'https://dabada.cloudish.cloud', 
    cleartext: true, // http 허용 (로컬 개발용)
    androidScheme: 'https'
  }
};

export default config;