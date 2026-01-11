// 다운로드 관련 상수 설정

// 쿨타임 (초 단위)
// 환경 변수 DOWNLOAD_COOLDOWN_SECONDS가 있으면 사용, 없으면 기본값 300초 (5분)
export const DOWNLOAD_COOLDOWN_SECONDS = process.env.DOWNLOAD_COOLDOWN_SECONDS
  ? parseInt(process.env.DOWNLOAD_COOLDOWN_SECONDS, 10)
  : 300;

// 쿨타임 (분 단위 - 일부 레거시 로직용, 가능하면 초 단위 사용 권장)
export const DOWNLOAD_COOLDOWN_MINUTES = Math.ceil(DOWNLOAD_COOLDOWN_SECONDS / 60);
