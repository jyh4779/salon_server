-- ==========================================
-- Salon Manager - Complete Database Initialization Script
-- Created: 2025-12-18
-- Description: Recreates the entire database schema and populates it with test data (including Email/Password).
-- ==========================================

-- 1. Database Creation
CREATE DATABASE IF NOT EXISTS salon_db;
USE salon_db;

-- 2. Drop Existing Tables (Reverse Order of Dependencies)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS VISIT_LOGS;
DROP TABLE IF EXISTS PAYMENTS;
DROP TABLE IF EXISTS RESERVATION_ITEMS;
DROP TABLE IF EXISTS CUSTOMER_MEMOS;
DROP TABLE IF EXISTS SCHEDULE_BLOCKS;
DROP TABLE IF EXISTS RESERVATIONS;
DROP TABLE IF EXISTS MENUS;
DROP TABLE IF EXISTS DESIGNERS;
DROP TABLE IF EXISTS SHOPS;
DROP TABLE IF EXISTS USERS;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Table Creation (Based on schema.prisma)

-- USERS
CREATE TABLE USERS (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(50) NOT NULL,
    role ENUM('CUSTOMER', 'DESIGNER', 'OWNER', 'ADMIN') DEFAULT 'CUSTOMER' NOT NULL,
    gender ENUM('MALE', 'FEMALE'),
    birthdate VARCHAR(8),
    is_app_user BOOLEAN DEFAULT FALSE,
    grade ENUM('NEW', 'VIP', 'CAUTION') DEFAULT 'NEW',
    current_hashed_refresh_token VARCHAR(255),
    created_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP
);

-- SHOPS
CREATE TABLE SHOPS (
    shop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    tel VARCHAR(20),
    address VARCHAR(255),
    settlement_bank VARCHAR(50),
    settlement_account VARCHAR(50),
    open_time TIME DEFAULT '10:00:00',
    close_time TIME DEFAULT '20:00:00',
    created_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
    closed_days VARCHAR(50),
    FOREIGN KEY (owner_id) REFERENCES USERS(user_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- DESIGNERS
CREATE TABLE DESIGNERS (
    designer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    intro_text TEXT,
    profile_img VARCHAR(255),
    work_start TIME,
    work_end TIME,
    lunch_start TIME,
    lunch_end TIME,
    day_off VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON UPDATE RESTRICT
);

-- MENUS
CREATE TABLE MENUS (
    menu_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    category VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    price INT DEFAULT 0 NOT NULL,
    duration INT DEFAULT 60 NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    type ENUM('MENU', 'CATEGORY') DEFAULT 'MENU',
    sort_order INT DEFAULT 0,
    thumbnail_url VARCHAR(255),
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- RESERVATIONS
CREATE TABLE RESERVATIONS (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    designer_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NOSHOW') DEFAULT 'PENDING' NOT NULL,
    request_memo TEXT,
    alarm_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES USERS(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- RESERVATION_ITEMS
CREATE TABLE RESERVATION_ITEMS (
    item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    menu_id BIGINT,
    menu_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (menu_id) REFERENCES MENUS(menu_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- PAYMENTS
CREATE TABLE PAYMENTS (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    type ENUM('APP_DEPOSIT', 'SITE_CARD', 'SITE_CASH') NOT NULL,
    amount INT NOT NULL,
    status ENUM('PAID', 'REFUNDED', 'FAILED') DEFAULT 'PAID' NOT NULL,
    paid_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- CUSTOMER_MEMOS
CREATE TABLE CUSTOMER_MEMOS (
    memo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    writer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(255),
    created_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (writer_id) REFERENCES USERS(user_id) ON UPDATE RESTRICT,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- SCHEDULE_BLOCKS
CREATE TABLE SCHEDULE_BLOCKS (
    block_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    designer_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    type ENUM('LUNCH', 'OFF', 'PERSONAL', 'HOLIDAY') NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- VISIT_LOGS
CREATE TABLE VISIT_LOGS (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL UNIQUE,
    designer_id BIGINT NOT NULL,
    admin_memo TEXT,
    photo_urls LONGTEXT,
    visited_at DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES USERS(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE ON UPDATE RESTRICT
);


-- 4. Data Injection (Based on backend/sql/01_test_data.sql)

-- 4-1. USERS (최상위 부모)
-- Owner (원장)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (1, '010-1111-1111', 'owner@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '홍길동 원장', 'OWNER', 'MALE', '19800101', TRUE, 'VIP', NOW());

-- Designer 1 (수석)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (2, '010-2222-2222', 'designer1@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '김스타 수석', 'DESIGNER', 'FEMALE', '19900505', TRUE, 'VIP', NOW());

-- Designer 2 (신입)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (3, '010-3333-3333', 'designer2@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '이초보', 'DESIGNER', 'MALE', '19951225', TRUE, 'VIP', NOW());

-- Customer 1 (단골)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (4, '010-4444-4444', 'customer1@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '박철수', 'CUSTOMER', 'MALE', '19850303', TRUE, 'VIP', NOW());

-- Customer 2 (신규)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (5, '010-5555-5555', 'customer2@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '최영희', 'CUSTOMER', 'FEMALE', '19920815', FALSE, 'NEW', NOW());

-- Customer 3 (노쇼 주의)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (6, '010-6666-6666', 'customer3@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '진상우', 'CUSTOMER', 'MALE', '19880101', TRUE, 'CAUTION', NOW());

-- Customer 4 (VIP)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (7, '010-7777-7777', 'customer4@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '한소희', 'CUSTOMER', 'FEMALE', '19951111', TRUE, 'VIP', NOW());

-- Customer 5 (일반)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (8, '010-8888-8888', 'customer5@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '이민수', 'CUSTOMER', 'MALE', '19900222', TRUE, 'NEW', NOW());


-- 4-2. SHOPS (USERS 참조)
INSERT INTO SHOPS (shop_id, owner_id, name, tel, address, settlement_bank, settlement_account)
VALUES (1, 1, '살롱 매니저 강남점', '02-123-4567', '서울시 강남구 테헤란로 123', 'KB국민은행', '123-456-789012');


-- 4-3. DESIGNERS (USERS, SHOPS 참조)
-- 김스타 수석
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
VALUES (1, 2, 1, '10년 경력의 베테랑 디자이너 김스타입니다.', '10:00:00', '20:00:00', TRUE);

-- 이초보
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
VALUES (2, 3, 1, '친절하게 모시겠습니다.', '11:00:00', '21:00:00', TRUE);


-- 4-4. MENUS (SHOPS 참조)
-- Categories (1~5)
INSERT INTO MENUS (menu_id, shop_id, name, type, sort_order)
VALUES 
(1, 1, '컷', 'CATEGORY', 1),
(2, 1, '펌', 'CATEGORY', 2),
(3, 1, '컬러', 'CATEGORY', 3),
(4, 1, '클리닉', 'CATEGORY', 4),
(5, 1, '기타', 'CATEGORY', 5);

-- Menus (6~)
INSERT INTO MENUS (menu_id, shop_id, category, name, price, duration, description, type)
VALUES 
(6, 1, '컷', '남성 디자인 커트', 25000, 30, '두상에 맞춘 세련된 커트', 'MENU'),
(7, 1, '펌', '여성 셋팅펌', 120000, 120, '손상 없는 프리미엄 펌', 'MENU'),
(8, 1, '컬러', '전체 염색', 80000, 90, '퍼스널 컬러 맞춤 염색', 'MENU'),
(9, 1, '클리닉', '두피 케어', 50000, 60, '시원한 쿨링 스파', 'MENU');


-- 4-5. RESERVATIONS (SHOPS, USERS, DESIGNERS 참조)
-- 예약 1: 김스타 - 박철수 (오늘 14:00 KST -> 05:00 UTC, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (1, 1, 4, 1, CONCAT(CURDATE(), ' 05:00:00'), CONCAT(CURDATE(), ' 05:30:00'), 'CONFIRMED', '짧게 잘라주세요', TRUE, NOW());

-- 예약 2: 김스타 - 최영희 (오늘 16:00 KST -> 07:00 UTC, 펌)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (2, 1, 5, 1, CONCAT(CURDATE(), ' 07:00:00'), CONCAT(CURDATE(), ' 09:00:00'), 'PENDING', '처음 방문입니다.', TRUE, NOW());

-- 예약 3: 이초보 - 박철수 (내일 11:00 KST -> 02:00 UTC, 염색)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (3, 1, 4, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 02:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 03:30:00'), 'CONFIRMED', NULL, TRUE, NOW());

-- 예약 4: 김스타 - 최영희 (어제 10:00 KST -> 01:00 UTC, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (4, 1, 5, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'), 'COMPLETED', NULL, TRUE, NOW());


-- 4-6. RESERVATION_ITEMS (RESERVATIONS, MENUS 참조)
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


-- 4-7. PAYMENTS (RESERVATIONS 참조)
INSERT INTO PAYMENTS (payment_id, reservation_id, type, amount, status, paid_at)
VALUES (1, 4, 'SITE_CARD', 25000, 'PAID', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'));

-- 예약 5: 김스타 - 진상우 (오늘 11:00 KST -> 02:00 UTC, 두피 케어)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (5, 1, 6, 1, CONCAT(CURDATE(), ' 02:00:00'), CONCAT(CURDATE(), ' 03:00:00'), 'PENDING', '조용히 받고 싶습니다.', TRUE, NOW());

-- 예약 6: 김스타 - 한소희 (오늘 13:00 KST -> 04:00 UTC, 염색) - 점심 후 바로
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (6, 1, 7, 1, CONCAT(CURDATE(), ' 04:00:00'), CONCAT(CURDATE(), ' 05:30:00'), 'CONFIRMED', '애쉬 브라운으로 부탁해요', TRUE, NOW());

-- 예약 7: 이초보 - 이민수 (오늘 15:00 KST -> 06:00 UTC, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (7, 1, 8, 2, CONCAT(CURDATE(), ' 06:00:00'), CONCAT(CURDATE(), ' 06:30:00'), 'COMPLETED', NULL, TRUE, NOW());

-- 예약 8: 이초보 - 최영희 (오늘 19:00 KST -> 10:00 UTC, 펌) - 퇴근 직전
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (8, 1, 5, 2, CONCAT(CURDATE(), ' 10:00:00'), CONCAT(CURDATE(), ' 12:00:00'), 'CONFIRMED', '늦지 않게 갈게요', TRUE, NOW());

-- 예약 9: 김스타 - 박철수 (내일 14:00 KST -> 05:00 UTC, 두피 케어)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (9, 1, 4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 05:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:00:00'), 'PENDING', NULL, TRUE, NOW());

-- 예약 10: 이초보 - 한소희 (내일 10:00 KST -> 01:00 UTC, 커트)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (10, 1, 7, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 01:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'), 'CONFIRMED', '앞머리만 다듬어주세요', TRUE, NOW());


-- 4-X. Additional Items & Payments
-- 예약 5 (두피 케어)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (5, 5, 9, '두피 케어', 50000);

-- 예약 6 (염색)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (6, 6, 8, '전체 염색', 80000);

-- 예약 7 (커트)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (7, 7, 6, '남성 디자인 커트', 25000);
INSERT INTO PAYMENTS (payment_id, reservation_id, type, amount, status, paid_at)
VALUES (2, 7, 'SITE_CASH', 25000, 'PAID', CONCAT(CURDATE(), ' 06:30:00'));

-- 예약 8 (펌)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (8, 8, 7, '여성 셋팅펌', 120000);

-- 예약 9 (두피 케어)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (9, 9, 9, '두피 케어', 50000);

-- 예약 10 (커트)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (10, 10, 6, '남성 디자인 커트', 25000);


-- 4-8. SCHEDULE_BLOCKS (DESIGNERS 참조)
INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
VALUES (1, 1, CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 14:00:00'), 'LUNCH');

INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
VALUES (2, 2, CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 'PERSONAL');


-- ==========================================
-- 5. Shop 2 Data (Multi-tenancy Test)
-- ==========================================

-- 5-1. USERS for Shop 2
-- Owner 2 (홍대점 원장)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (11, '010-9999-9999', 'owner2@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '김철수 원장', 'OWNER', 'MALE', '19820202', TRUE, 'VIP', NOW());

-- Designer 3 (홍대점 디자이너)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (12, '010-9898-9898', 'designer3@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '박감각', 'DESIGNER', 'FEMALE', '19930303', TRUE, 'VIP', NOW());

-- Customer 6 (홍대점 고객)
INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
VALUES (13, '010-8787-8787', 'customer6@example.com', '$2b$10$VoClC0.zB6kvBc8e/0Vrz.ELNzQTayuhDWYvF2MUP73XGhkJnUpjK', '정고객', 'CUSTOMER', 'FEMALE', '19901010', TRUE, 'NEW', NOW());


-- 5-2. SHOPS (Shop 2)
INSERT INTO SHOPS (shop_id, owner_id, name, tel, address, settlement_bank, settlement_account)
VALUES (2, 11, '살롱 매니저 홍대점', '02-987-6543', '서울시 마포구 양화로 123', '신한은행', '987-654-321098');


-- 5-3. DESIGNERS (Shop 2)
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
VALUES (3, 12, 2, '홍대 스타일 전문 박감각입니다.', '11:00:00', '21:00:00', TRUE);


-- 5-4. MENUS (Shop 2)
INSERT INTO MENUS (menu_id, shop_id, name, type, sort_order)
VALUES 
(11, 2, '컷', 'CATEGORY', 1),
(12, 2, '컬러', 'CATEGORY', 2);

INSERT INTO MENUS (menu_id, shop_id, category, name, price, duration, description, type)
VALUES 
(13, 2, '컷', '홍대 스타일 컷', 30000, 40, '트렌디한 스타일', 'MENU'),
(14, 2, '컬러', '애쉬 그레이', 90000, 100, '탈색 1회 포함', 'MENU');


-- 5-5. RESERVATIONS (Shop 2)
-- 예약 11: 박감각 - 정고객 (오늘 14:00 KST -> 05:00 UTC)
INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
VALUES (11, 2, 13, 3, CONCAT(CURDATE(), ' 05:00:00'), CONCAT(CURDATE(), ' 06:40:00'), 'CONFIRMED', '홍대점 첫 방문입니다', TRUE, NOW());


-- 5-6. RESERVATION_ITEMS (Shop 2)
INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
VALUES (11, 11, 14, '애쉬 그레이', 90000);

-- Done
SELECT 'Database initialized successfully!' as result;
