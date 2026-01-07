# 데이터베이스 정보

## 개요

이 프로젝트는 PostgreSQL 데이터베이스를 사용하며, Drizzle ORM을 통해 스키마를 관리합니다.

## 연결 정보

### 개발 환경 (Docker Compose)

- **호스트**: `localhost`
- **포트**: `5433` (호스트) → `5432` (컨테이너 내부)
- **데이터베이스명**: `dabada_db`
- **사용자**: `dabada`
- **비밀번호**: `dabada_password`

### 연결 문자열

```
postgresql://dabada:dabada_password@localhost:5433/dabada_db
```

### Docker 컨테이너 내부 연결

```
postgresql://dabada:dabada_password@postgres:5432/dabada_db
```

## 환경 변수

다음 환경 변수를 사용합니다:

- `DB_HOST`: 데이터베이스 호스트 (기본값: `localhost` 또는 `postgres`)
- `DB_PORT`: 데이터베이스 포트 (기본값: `5432`)
- `DB_USER`: 데이터베이스 사용자 (기본값: `dabada`)
- `DB_PASSWORD`: 데이터베이스 비밀번호 (기본값: `dabada_password`)
- `DB_NAME`: 데이터베이스 이름 (기본값: `dabada_db`)
- `DATABASE_URL`: 전체 연결 문자열 (우선 사용)

## 테이블 구조

### 1. user (사용자)

Better Auth를 위한 사용자 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 사용자 고유 ID |
| name | text | NOT NULL | 사용자 이름 |
| email | text | NOT NULL, UNIQUE | 이메일 주소 |
| emailVerified | boolean | NOT NULL, DEFAULT false | 이메일 인증 여부 |
| image | text | | 프로필 이미지 URL |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | 생성 시간 |
| updatedAt | timestamp | NOT NULL, DEFAULT NOW() | 수정 시간 |

### 2. session (세션)

사용자 세션 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 세션 고유 ID |
| expiresAt | timestamp | NOT NULL | 만료 시간 |
| token | text | NOT NULL, UNIQUE | 세션 토큰 |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | 생성 시간 |
| updatedAt | timestamp | NOT NULL, DEFAULT NOW() | 수정 시간 |
| ipAddress | text | | IP 주소 |
| userAgent | text | | User Agent |
| userId | text | NOT NULL, FK → user.id | 사용자 ID (CASCADE DELETE) |

### 3. account (계정)

OAuth 계정 정보를 저장합니다 (Google, Apple 등).

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 계정 고유 ID |
| accountId | text | NOT NULL | 제공자 계정 ID |
| providerId | text | NOT NULL | 제공자 ID (google, apple 등) |
| userId | text | NOT NULL, FK → user.id | 사용자 ID (CASCADE DELETE) |
| accessToken | text | | 액세스 토큰 |
| refreshToken | text | | 리프레시 토큰 |
| idToken | text | | ID 토큰 |
| expiresAt | timestamp | | 토큰 만료 시간 |
| password | text | | 비밀번호 (이메일 로그인용) |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | 생성 시간 |
| updatedAt | timestamp | NOT NULL, DEFAULT NOW() | 수정 시간 |

### 4. verification (인증)

이메일 인증 토큰 등을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 인증 고유 ID |
| identifier | text | NOT NULL | 식별자 (이메일 등) |
| value | text | NOT NULL | 인증 값 (토큰 등) |
| expiresAt | timestamp | NOT NULL | 만료 시간 |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | 생성 시간 |
| updatedAt | timestamp | NOT NULL, DEFAULT NOW() | 수정 시간 |

### 5. videos (동영상)

다운로드된 동영상 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 동영상 고유 ID |
| url | text | NOT NULL, UNIQUE | 원본 URL |
| platform | text | NOT NULL | 플랫폼 (youtube, instagram) |
| filePath | text | NOT NULL | 저장된 파일 경로 |
| fileSize | bigint | NOT NULL, DEFAULT 0 | 파일 크기 (bytes) |
| userId | text | NOT NULL, FK → user.id | 다운로드한 사용자 ID (CASCADE DELETE) |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | 생성 시간 |

### 6. download_logs (다운로드 로그)

사용자의 다운로드 이력을 기록합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | text | PRIMARY KEY | 로그 고유 ID |
| userId | text | NOT NULL, FK → user.id | 사용자 ID (CASCADE DELETE) |
| videoId | text | FK → videos.id | 동영상 ID (SET NULL) |
| downloadedAt | timestamp | NOT NULL, DEFAULT NOW() | 다운로드 시간 |

## 관계 (Relations)

### User Relations
- `sessions`: 사용자의 모든 세션
- `accounts`: 사용자의 모든 계정
- `videos`: 사용자가 다운로드한 모든 동영상
- `downloadLogs`: 사용자의 모든 다운로드 로그

### Session Relations
- `user`: 세션을 소유한 사용자

### Account Relations
- `user`: 계정을 소유한 사용자

### Videos Relations
- `user`: 동영상을 다운로드한 사용자
- `downloadLogs`: 해당 동영상의 다운로드 로그

### DownloadLogs Relations
- `user`: 다운로드를 수행한 사용자
- `video`: 다운로드된 동영상

## 스키마 관리

### 자동 테이블 생성

Docker Compose를 통해 앱을 시작하면 자동으로 스키마가 데이터베이스에 적용됩니다.

```bash
docker compose up
```

앱 컨테이너 시작 시 `pnpm db:push`가 자동으로 실행되어 스키마 변경사항을 데이터베이스에 반영합니다.

### 수동 명령어

#### 스키마 푸시 (변경사항 적용)

```bash
# Docker 컨테이너 내부에서 실행
docker compose exec app pnpm db:push

# 로컬에서 실행 (환경 변수 설정 필요)
pnpm db:push
```

#### 마이그레이션 생성

```bash
# 마이그레이션 파일 생성
docker compose exec app pnpm db:generate

# 로컬에서 실행
pnpm db:generate
```

#### 마이그레이션 적용

```bash
# 마이그레이션 적용
docker compose exec app pnpm db:migrate

# 로컬에서 실행
pnpm db:migrate
```

#### Drizzle Studio 실행

```bash
# Docker 컨테이너에서 실행 (포트 4983)
docker compose up drizzle-studio

# 로컬에서 실행
pnpm db:studio
```

브라우저에서 `http://localhost:4983` 접속

## 스키마 파일 위치

- **스키마 정의**: `db/schema.ts`
- **마이그레이션 파일**: `db/migrations/`
- **Drizzle 설정**: `drizzle.config.ts`

## 스키마 수정 방법

1. `db/schema.ts` 파일을 수정합니다.
2. 변경사항을 확인합니다:
   ```bash
   docker compose exec app pnpm db:generate
   ```
3. 데이터베이스에 적용합니다:
   ```bash
   docker compose exec app pnpm db:push
   ```
4. 또는 컨테이너를 재시작하면 자동으로 적용됩니다:
   ```bash
   docker compose restart app
   ```

## 데이터베이스 접속

### psql을 통한 직접 접속

```bash
# Docker 컨테이너를 통한 접속
docker compose exec postgres psql -U dabada -d dabada_db

# 로컬에서 접속 (포트 5433)
psql -h localhost -p 5433 -U dabada -d dabada_db
```

### Drizzle Studio를 통한 접속

웹 브라우저에서 `http://localhost:4983` 접속하여 GUI로 데이터베이스를 관리할 수 있습니다.

## 주의사항

1. **자동 스키마 푸시**: 개발 환경에서는 `db:push`를 사용하여 스키마를 즉시 반영할 수 있습니다.
2. **프로덕션 환경**: 프로덕션에서는 마이그레이션 파일(`db:generate` + `db:migrate`)을 사용하는 것이 권장됩니다.
3. **데이터 손실**: `db:push`는 기존 데이터를 보존하지만, 스키마 변경 시 주의가 필요합니다.
4. **백업**: 중요한 데이터는 정기적으로 백업하세요.

## 문제 해결

### 연결 오류

```bash
# 데이터베이스 상태 확인
docker compose ps postgres

# 로그 확인
docker compose logs postgres

# 연결 테스트
docker compose exec app pnpm db:push
```

### 테이블이 생성되지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. 데이터베이스가 실행 중인지 확인: `docker compose ps`
3. 수동으로 스키마 푸시: `docker compose exec app pnpm db:push`

### 스키마 충돌

스키마 충돌이 발생하면:
1. `db/migrations/` 폴더의 마이그레이션 파일 확인
2. 필요시 마이그레이션 파일 수정 또는 삭제
3. `db:push`로 강제 적용 (주의: 데이터 손실 가능)

