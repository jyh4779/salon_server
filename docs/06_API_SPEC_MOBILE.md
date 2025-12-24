# 06. 모바일 앱 API 정의서 (Mobile API Spec)

## 1. 개요
본 문서는 Salon Manager **모바일 앱(Customer App)**에서 사용하는 백엔드 API 명세를 정의한다.
- **Base URL**: `/api/app`
- **Auth**: `Bearer <AccessToken>` (Authorization Header)
- **Pagination**: 기본적으로 목록 조회 시 `?page=1&limit=10` 쿼리 파라미터를 지원한다.
- **비고**: `[NEW]` 태그가 붙은 API는 백엔드 구현이 필요함.

## 2. API 목록

### 2.1. 앱 공통 & 버전 (App)
| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/app/version` | `[NEW]` | 앱 강제 업데이트 체크 (Min-Version 반환) |

### 2.2. 인증 (Auth)
모바일 앱은 Firebase Authentication을 사용하여 1차 인증 후, 서버에서 JWT를 발급받는다.

| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login/firebase` | `[NEW]` | Firebase Token으로 로그인 (JWT 발급) |
| **POST** | `/auth/signup/mobile` | `[NEW]` | 앱 회원가입 (계정 통합 로직 포함) |
| **POST** | `/auth/refresh` | `[Existing]`| Access Token 재발급 |
| **POST** | `/users/device-token` | `[Existing]`| FCM 토큰 저장 (로그인 직후 호출) |

### 2.3. 홈 & 대시보드 (Home)
| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/users/me/reservations/upcoming` | `[NEW]` | 가장 가까운 예약 1건 조회 (D-Day 카운트용) |
| **GET** | `/users/me/notifications` | `[NEW]` | 알림 함(이력) 조회 (`?page=&limit=`) |

### 2.4. 매장 조회 (Shops)
| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops` | `[Existing]`| 매장 목록 조회 (검색 가능, `?page=&limit=`) |
| **GET** | `/shops/:id` | `[Existing]`| 매장 상세 정보 (소개, 영업시간 등) |
| **GET** | `/shops/:id/designers` | `[Existing]`| 디자이너 목록 (`is_active=true` 필터링) |
| **GET** | `/shops/:id/menus` | `[Existing]`| 시술 메뉴 목록 |

### 2.5. 예약 (Reservations)
| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/slots` | `[NEW]` | 예약 가능 시간 슬롯 조회 (`?date=&designerId=&duration=`) |
| **POST** | `/shops/:shopId/reservations` | `[Existing]`| 예약 요청 (`source='APP'` 필수) |
| **PATCH**| `/shops/:shopId/reservations/:id/cancel` | `[NEW]` | 예약 취소 요청 (환불 규정 적용) |

### 2.6. 마이 페이지 (My Page)
| Method | URI | 태그 | 상세 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/users/me` | `[Existing]`| 내 정보 조회 (프로필) |
| **PATCH**| `/users/me` | `[NEW]` | 내 정보 수정 (이름, 프로필 사진 등) |
| **GET** | `/users/me/reservations` | `[NEW]` | 내 예약 이력 조회 (`?status=COMPLETED&page=&limit=`) |
| **GET** | `/shops/:shopId/visit-logs/me` | `[NEW]` | 내 시술 기록(VisitLog) 조회 (`?page=&limit=`) |
| **DELETE**| `/users/me` | `[NEW]` | 회원 탈퇴 |

## 3. 상세 요구사항 (로직)

### 3.1. 예약 가능 시간 조회 (`GET /shops/:shopId/slots`)
- **Input**: `date` (YYYY-MM-DD), `designerId` (Optional), `menuId`(or duration)
- **Logic**:
    1. **'랜덤 배정(ANY)' 처리**: `designerId`가 없거나 'ANY'인 경우, 모든 Active 디자이너의 가용 스케줄을 합집합(Union)하여 반환.
    2. 디자이너의 근무 시간(`work_start` ~ `work_end`) 확인
    3. `SCHEDULE_BLOCKS`(휴무/식사) 제외
    4. 기존 `RESERVATIONS`와 겹치는 시간 제외

### 3.2. 회원가입 (`POST /auth/signup/mobile`)
- **Input**: `firebaseToken`, `name`, `phone`, `birthdate`, `gender`
- **Logic**:
    1. Firebase Token 검증하여 UID 획득
    2. `phone` 번호로 `USERS` 테이블 검색
    3. **Case A (기존 오프라인 고객)**: `firebase_uid` 업데이트 + `email` 업데이트 -> 통합 완료
    4. **Case B (신규 고객)**: `USERS` 테이블 신규 Insert (`role='CUSTOMER'`)

## 4. 보안 및 구현 가이드 (Security & Implementation)
> **[Existing] 태그 구현 시 주의사항**: 관리자 API를 그대로 노출하지 말고, **Mobile 전용 Controller/DTO**를 사용하여 민감 정보를 필터링해야 한다.

1. **DTO 분리 (Data Hide)**
    - 매장/디자이너 조회 시 `settlement_bank`, `phone`(개인번호), `admin_memo` 등 민감 정보 제외.
    - `AppShopResponseDto`, `AppDesignerResponseDto` 사용.
2. **시술 기록 프라이버시 (`GET /visit-logs/me`)**
    - **필수 Exclude**: 디자이너가 작성한 `admin_memo`(예: "고객 진상")는 절대 노출 금지.
    - **Include**: 시술 날짜, 시술 메뉴명, `photo_urls`만 반환.
