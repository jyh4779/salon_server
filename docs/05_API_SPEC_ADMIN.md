# 05. 관리자 웹 API 정의서 (Admin API Spec)

## 1. 개요
본 문서는 Salon Manager **관리자 웹(Admin Web)**에서 사용하는 백엔드 API 명세를 정의한다.
- **Base URL**: `/api` (Nginx Proxy) 또는 `http://localhost:3000`
- **Auth**: `Bearer <AccessToken>` (Authorization Header)

## 2. API 목록

### 2.1. 인증 (Auth)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | 이메일/비밀번호 로그인 | X |
| **POST** | `/auth/logout` | 로그아웃 (Refresh Token 삭제) | X |
| **POST** | `/auth/refresh` | Access Token 재발급 (Cookie) | X |
| **POST** | `/auth/verify-password` | 민감한 작업 전 비밀번호 재확인 | O |

### 2.2. 사용자 (Users)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/users` | 회원 가입 (관리자) | X |
| **GET** | `/users` | 전체 사용자 조회 (검색: `?search=`) | O |
| **GET** | `/users/me` | 내 정보 조회 | O |
| **GET** | `/users/email-check` | 이메일 중복 확인 | X |
| **POST** | `/users/device-token` | FCM 기기 토큰 저장/갱신 | O |

### 2.3. 매장 (Shops)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/my-shop` | 내가 소유한 매장 조회 | O |
| **GET** | `/shops/:id` | 매장 상세 정보 조회 | O |
| **PATCH** | `/shops/:id` | 매장 정보 수정 | O |

### 2.4. 디자이너 (Designers)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/designers` | 디자이너 목록 조회 | O |
| **POST** | `/shops/:shopId/designers` | 디자이너 등록 | O |
| **PATCH** | `/shops/:shopId/designers/:id` | 디자이너 정보 수정 | O |

### 2.5. 시술 메뉴 (Menus)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/menus` | 시술 메뉴 목록 조회 | O |
| **POST** | `/shops/:shopId/menus` | 시술 메뉴 등록 | O |
| **PATCH** | `/shops/:shopId/menus/:id` | 시술 메뉴 수정 | O |
| **DELETE** | `/shops/:shopId/menus/:id` | 시술 메뉴 삭제 | O |

### 2.6. 예약 (Reservations)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/reservations` | 예약 목록 조회 (`?from=&to=`) | O |
| **GET** | `/shops/:shopId/reservations/:id` | 예약 상세 조회 | O |
| **POST** | `/shops/:shopId/reservations` | 신규 예약 등록 | O |
| **PATCH** | `/shops/:shopId/reservations/:id` | 예약 수정 (상태, 시간 등) | O |
| **POST** | `/shops/:shopId/reservations/:id/complete`| 시술 완료 및 결제 처리 | O |
| **DELETE** | `/shops/:shopId/reservations/:id` | 예약 삭제 | O |

### 2.7. 고객 관리 (Customers)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/customers` | 고객 목록 조회 (`?search=`) | O |
| **GET** | `/shops/:shopId/customers/:id` | 고객 상세 정보 조회 | O |
| **POST** | `/shops/:shopId/customers` | 신규 고객 등록 (by 관리자) | O |
| **POST** | `/shops/:shopId/customers/:id/memos`| 고객 메모 추가 (Legacy) | O |

### 2.8. 매출 (Sales)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/sales/daily` | 일간 매출 조회 (`?date=`) | O |
| **GET** | `/shops/:shopId/sales/weekly` | 주간 매출 조회 (`?date=`) | O |

### 2.9. 기타 기능 (Etc)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/uploads/:category` | 이미지 업로드 (designers/logs 등) | O |
| **GET** | `/shops/:shopId/prepaid-tickets` | 선불권 목록 조회 | O |
| **POST** | `/shops/:shopId/prepaid-tickets` | 선불권 생성 | O |
| **GET** | `/shops/:shopId/customers/:userId/prepaid`| 고객 잔액 조회 | O |
| **POST** | `/shops/:shopId/customers/:userId/prepaid/charge`| 선불권 충전 | O |

### 2.10. 시술 기록 (Visit Logs)
| Method | URI | 상세 설명 | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/shops/:shopId/visit-logs` | 시술 기록 작성 | O |
| **GET** | `/shops/:shopId/visit-logs/customer/:customerId` | 고객별 시술 이력 조회 | O |
| **GET** | `/shops/:shopId/visit-logs/reservation/:id` | 예약별 시술 이력 조회 | O |
