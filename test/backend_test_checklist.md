# Backend API Test Checklist

이 문서는 Salon Manager 백엔드 API의 정상 동작을 검증하기 위한 포괄적인 테스트 체크리스트입니다.
각 기능별 API 요청 예시(`curl`)와 기대 결과를 포함하고 있어, Regression Test(회귀 테스트) 시 활용할 수 있습니다.

> **참고:** `accessToken`, `shop_id` 등은 실제 환경에 맞게 치환하여 사용하세요.

## 1. 인증 (Auth Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | 로그인 (Access/Refresh Token 발급) | **Body:** `{"email": "test@example.com", "password": "password"}`<br>**검증:** `201 Created`, `accessToken` 반환, 쿠키에 `refresh_token` 설정 확인. |
| **POST** | `/auth/refresh` | 토큰 갱신 | **Header:** Cookie(`refresh_token`)<br>**검증:** `200/201`, 새 `accessToken` 반환. |
| **POST** | `/auth/logout` | 로그아웃 | **Body:** `{"userId": 1}`<br>**검증:** `200/201`, 쿠키 삭제 확인. |

---

## 2. 매장 관리 (Shops Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/my-shop` | 내 매장 조회 | **Header:** Auth Token<br>**검증:** `200 OK`, `shop_id`를 포함한 매장 정보 반환. |
| **GET** | `/shops/:id` | 매장 상세 조회 | **Param:** `id`<br>**검증:** `200 OK`, 해당 매장 상세 정보 반환. |
| **PATCH** | `/shops/:id` | 매장 정보 수정 | **Body:** `{"name": "New Name"}`<br>**검증:** `200 OK`, 수정된 정보 반환. |

---

## 3. 회원 (Users Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **POST** | `/users` | 회원 가입 | **Body:** `{"email": "...", "password": "...", "name": "...", "phone": "..."}`<br>**검증:** `201 Created`. |
| **GET** | `/users` | 회원 검색 | **Query:** `?search=홍길동`<br>**검증:** `200 OK`, 검색된 회원 목록 반환. |

---

## 4. 디자이너 (Designers Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/designers` | 디자이너 목록 조회 | **검증:** `200 OK`, 디자이너 배열 반환. |
| **POST** | `/shops/:shopId/designers` | 디자이너 등록 | **Body:** `{"name": "Kim"}`<br>**검증:** `201 Created`, 생성된 디자이너 ID 반환. |
| **PATCH** | `/shops/:shopId/designers/:id` | 디자이너 수정 | **Body:** `{"working_hours": "..."}`<br>**검증:** `200 OK`. |

---

## 5. 메뉴 (Menus Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/menus` | 메뉴 목록 조회 | **검증:** `200 OK`, 메뉴 배열(카테고리 포함) 반환. |
| **POST** | `/shops/:shopId/menus` | 메뉴 등록 | **Body:** `{"name": "Cut", "price": 20000, "category_id": 1}`<br>**검증:** `201 Created`. |
| **PATCH** | `/shops/:shopId/menus/:id` | 메뉴 수정 | **검증:** `200 OK`. |
| **DELETE** | `/shops/:shopId/menus/:id` | 메뉴 삭제 | **검증:** `200 OK`. |

---

## 6. 고객 관리 (Customers Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/customers` | 고객 목록 조회 | **Query:** `?search=010`<br>**검증:** `200 OK`. |
| **GET** | `/shops/:shopId/customers/:id` | 고객 상세(이력) 조회 | **검증:** `200 OK`, 방문 로그 및 통계 포함 여부 확인. |
| **POST** | `/shops/:shopId/customers` | 신규 고객 등록 | **Body:** `{"name": "Customer", "phone": "010-0000-0000"}`<br>**검증:** `201 Created`. |
| **POST** | `/shops/:shopId/customers/:id/memos` | 고객 메모 추가 | **Body:** `{"content": "메모 내용"}`<br>**검증:** `201 Created`. |

---

## 7. 예약 (Reservations Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/reservations` | 예약 목록 조회 | **Query:** `?startDate=...&endDate=...`<br>**검증:** `200 OK`. |
| **POST** | `/shops/:shopId/reservations` | 예약 생성 | **Body:** `{"user_id": 1, "designer_id": 1, "start_date": "...", "items": [...]}`<br>**검증:** `201 Created`. |
| **PATCH** | `/shops/:shopId/reservations/:id` | 예약 수정 | **Body:** `{"status": "CONFIRMED"}`<br>**검증:** `200 OK`. |
| **POST** | `/shops/:shopId/reservations/:id/complete`| 예약 완료(직전 결제) | **Body:** `{"payment_method": "SITE_CARD", "amount": 30000}`<br>**검증:** `201 Created`, Payments 레코드 생성 확인. |
| **DELETE** | `/shops/:shopId/reservations/:id` | 예약 취소 | **검증:** `200 OK` (Soft Delete 여부 확인). |

---

## 8. 매출 (Sales Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/sales/daily` | 일별 매출 조회 | **Query:** `?date=YYYY-MM-DD`<br>**검증:** `200 OK`. |

---

## 9. 방문 로그 (VisitLogs Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **GET** | `/shops/:shopId/visit-logs/customer/:customerId` | 고객별 방문 기록 | **Query:** `?page=1&limit=5`<br>**검증:** `200 OK`. |

---

## 10. 선불권 (Prepaid Module) [NEW]
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **POST** | `/shops/:shopId/prepaid-tickets` | 선불권 상품 등록 | **Body:** `{"name": "10+1", "price": 100000, "credit_amount": 110000, "validity_days": 365}`<br>**검증:** `201 Created`, 생성된 티켓 확인. |
| **GET** | `/shops/:shopId/prepaid-tickets` | 선불권 상품 목록 | **검증:** `200 OK`. |
| **POST** | `/shops/:shopId/customers/:userId/prepaid/charge` | 선불권 충전 | **Body:** `{"ticketId": 1}` 또는 `{"amount": 50000, "bonusAmount": 0}`<br>**검증:** `201 Created`, 충전 후 잔액 반환 확인. |
| **GET** | `/shops/:shopId/customers/:userId/prepaid` | 고객 잔액 조회 | **검증:** `200 OK`, `balance` 필드 확인. |

---

## 11. 파일 업로드 (Uploads Module)
| Method | Endpoint | 설명 | 테스트 방법 및 검증 |
| :--- | :--- | :--- | :--- |
| **POST** | `/uploads/:category` | 이미지 업로드 | **Form-Data:** `file=@image.jpg`<br>**검증:** `201 Created`, URL 반환. |
