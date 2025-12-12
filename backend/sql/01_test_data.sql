-- ==========================================
-- Test Data Injection Script for Salon Manager
-- Based on docs/02_DATABASE_ERD.md
-- ==========================================

-- 제약 조건을 끄지 않고, 올바른 순서로 데이터 삭제 및 삽입

-- 1. 기존 데이터 삭제 (자식 테이블 -> 부모 테이블 순서)
DELETE FROM VISIT_LOGS;
DELETE FROM PAYMENTS;
DELETE FROM RESERVATION_ITEMS;
DELETE FROM CUSTOMER_MEMOS;
DELETE FROM SCHEDULE_BLOCKS;
DELETE FROM RESERVATIONS;
DELETE FROM MENUS;
DELETE FROM DESIGNERS;
DELETE FROM SHOPS;
DELETE FROM USERS;


-- 2. 데이터 삽입 (부모 테이블 -> 자식 테이블 순서)

-- 2-1. USERS (최상위 부모)
-- Owner (원장)
INSERT INTO USERS (user_id, phone, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (1, '010-1111-1111', '홍길동 원장', 'OWNER', 'MALE', '19800101', TRUE, 'VIP', NOW());

-- Designer 1 (수석)
INSERT INTO USERS (user_id, phone, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (2, '010-2222-2222', '김스타 수석', 'DESIGNER', 'FEMALE', '19900505', TRUE, 'VIP', NOW());

-- Designer 2 (신입)
INSERT INTO USERS (user_id, phone, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (3, '010-3333-3333', '이초보', 'DESIGNER', 'MALE', '19951225', TRUE, 'VIP', NOW());

-- Customer 1 (단골)
INSERT INTO USERS (user_id, phone, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (4, '010-4444-4444', '박철수', 'CUSTOMER', 'MALE', '19850303', TRUE, 'VIP', NOW());

-- Customer 2 (신규)
INSERT INTO USERS (user_id, phone, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (5, '010-5555-5555', '최영희', 'CUSTOMER', 'FEMALE', '19920815', FALSE, 'NEW', NOW());


-- 2-2. SHOPS (USERS 참조)
INSERT INTO SHOPS (shop_id, owner_id, name, tel, address, settlement_bank, settlement_account)
VALUES (1, 1, '살롱 매니저 강남점', '02-123-4567', '서울시 강남구 테헤란로 123', 'KB국민은행', '123-456-789012');


-- 2-3. DESIGNERS (USERS, SHOPS 참조)
-- 김스타 수석
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
VALUES (1, 2, 1, '10년 경력의 베테랑 디자이너 김스타입니다.', '10:00:00', '20:00:00', TRUE);

-- 이초보
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
VALUES (2, 3, 1, '친절하게 모시겠습니다.', '11:00:00', '21:00:00', TRUE);


-- 2-4. MENUS (SHOPS 참조)
INSERT INTO MENUS (menu_id, shop_id, name, price, duration, description)
VALUES 
(1, 1, '남성 디자인 커트', 25000, 30, '두상에 맞춘 세련된 커트'),
(2, 1, '여성 셋팅펌', 120000, 120, '손상 없는 프리미엄 펌'),
(3, 1, '전체 염색', 80000, 90, '퍼스널 컬러 맞춤 염색'),
(4, 1, '두피 케어', 50000, 60, '시원한 쿨링 스파');


-- 2-5. RESERVATIONS (SHOPS, USERS, DESIGNERS 참조)
-- 예약 1: 김스타 - 박철수 (오늘 14:00, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (1, 1, 4, 1, CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 14:30:00'), 'CONFIRMED', '짧게 잘라주세요', TRUE, NOW());

-- 예약 2: 김스타 - 최영희 (오늘 16:00, 펌)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (2, 1, 5, 1, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 18:00:00'), 'PENDING', '처음 방문입니다.', TRUE, NOW());

-- 예약 3: 이초보 - 박철수 (내일 11:00, 염색)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (3, 1, 4, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:30:00'), 'CONFIRMED', NULL, TRUE, NOW());

-- 예약 4: 김스타 - 최영희 (어제 10:00, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (4, 1, 5, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 'COMPLETED', NULL, TRUE, NOW());


-- 2-6. RESERVATION_ITEMS (RESERVATIONS, MENUS 참조)
-- 예약 1 (커트)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (1, 1, 1, '남성 디자인 커트', 25000);

-- 예약 2 (펌)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (2, 2, 2, '여성 셋팅펌', 120000);

-- 예약 3 (염색)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (3, 3, 3, '전체 염색', 80000);

-- 예약 4 (커트)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (4, 4, 1, '남성 디자인 커트', 25000);


-- 2-7. PAYMENTS (RESERVATIONS 참조)
INSERT INTO PAYMENTS (payment_id, reservation_id, type, amount, status, paid_at)
VALUES (1, 4, 'SITE_CARD', 25000, 'PAID', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'));


-- 2-8. SCHEDULE_BLOCKS (DESIGNERS 참조)
INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
VALUES (1, 1, CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 14:00:00'), 'LUNCH');

INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
VALUES (2, 2, CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 'PERSONAL');
