import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const config: CapacitorConfig = {
  appId: 'io.dabada.app',
  appName: 'dabada',
  webDir: 'public',
  server: {
    // 개발 시 로컬 IP로 변경 (예: http://192.168.1.100:3000)
    // 프로덕션에서는 실제 도메인으로 변경
    url: process.env.NEXT_PUBLIC_APP_URL,
    cleartext: true, // http 허용 (개발용)
  },
};

export default config;
