# 03. BACKEND RULES (API Server)

## 1. 아키텍처 패턴 (NestJS Architecture)
- **Controller:** 요청/응답 처리, DTO Validation (`class-validator` 필수). 비즈니스 로직 포함 금지.
- **Service:** 실제 비즈니스 로직 수행, 트랜잭션 처리, 예외 던지기.
- **Repository:** Prisma를 통한 DB 직접 접근 로직. (`this.prisma.user.findMany...`)

## 2. 데이터베이스 모델링 원칙 (ERD 반영)
- **Users 테이블 핵심 로직:**
  - `firebase_uid`: **Nullable** (오프라인 고객은 NULL, 앱 유저는 값 존재).
  - `phone`: **NOT NULL & Unique** (온/오프라인 통합 식별자).
  - `password`: 사용하지 않음 (Firebase 위임).
- **예약 로직:** 예약 가능 시간 계산 시 `Designers`의 근무시간, `Reservations`의 기존 예약, `Schedule_Blocks`의 휴무를 모두 고려해야 함.

## 3. DTO 및 Validation
- 모든 API 요청(Request Body)과 응답(Response)은 명확한 Class 기반 DTO로 정의한다.
- `class-validator` 데코레이터(@IsString, @IsOptional 등)를 사용하여 입력값을 엄격하게 검증한다.

## 4. 에러 처리 (Error Handling)
- `class-validator`로 검증 실패 시 `class-validator`가 제공하는 `ValidationPipe`를 사용하여 `400 Bad Request` 응답을 반환한다.
- `PrismaClientKnownRequestError`를 사용하여 Prisma에서 발생하는 예외를 처리한다.