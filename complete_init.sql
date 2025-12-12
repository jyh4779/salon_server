-- Database Creation
CREATE DATABASE IF NOT EXISTS salon_db;
USE salon_db;

-- Table Creation

-- USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(50) NOT NULL,
    role ENUM('CUSTOMER', 'DESIGNER', 'OWNER', 'ADMIN') DEFAULT 'CUSTOMER',
    gender ENUM('MALE', 'FEMALE'),
    birthdate VARCHAR(8),
    is_app_user BOOLEAN DEFAULT FALSE,
    grade ENUM('NEW', 'VIP', 'CAUTION') DEFAULT 'NEW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SHOPS
CREATE TABLE IF NOT EXISTS SHOPS (
    shop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    tel VARCHAR(20),
    address VARCHAR(255),
    settlement_bank VARCHAR(50),
    settlement_account VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- DESIGNERS
CREATE TABLE IF NOT EXISTS DESIGNERS (
    designer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    shop_id BIGINT NOT NULL,
    intro_text TEXT,
    profile_img VARCHAR(255),
    work_start TIME,
    work_end TIME,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id)
);

-- MENUS
CREATE TABLE IF NOT EXISTS MENUS (
    menu_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT DEFAULT 0,
    duration INT DEFAULT 60,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE
);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS RESERVATIONS (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    designer_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NOSHOW') DEFAULT 'PENDING',
    request_memo TEXT,
    alarm_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE
);

-- RESERVATION_ITEMS
CREATE TABLE IF NOT EXISTS RESERVATION_ITEMS (
    item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    menu_id BIGINT,
    menu_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES MENUS(menu_id) ON DELETE SET NULL
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS PAYMENTS (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    type ENUM('APP_DEPOSIT', 'SITE_CARD', 'SITE_CASH') NOT NULL,
    amount INT NOT NULL,
    status ENUM('PAID', 'REFUNDED', 'FAILED') DEFAULT 'PAID',
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE
);

-- CUSTOMER_MEMOS
CREATE TABLE IF NOT EXISTS CUSTOMER_MEMOS (
    memo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    writer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (writer_id) REFERENCES USERS(user_id),
    FOREIGN KEY (shop_id) REFERENCES SHOPS(shop_id) ON DELETE CASCADE
);

-- SCHEDULE_BLOCKS
CREATE TABLE IF NOT EXISTS SCHEDULE_BLOCKS (
    block_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    designer_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    type ENUM('LUNCH', 'OFF', 'PERSONAL', 'HOLIDAY') NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE
);

-- VISIT_LOGS
CREATE TABLE IF NOT EXISTS VISIT_LOGS (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL UNIQUE,
    designer_id BIGINT NOT NULL,
    admin_memo TEXT,
    photo_urls LONGTEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (designer_id) REFERENCES DESIGNERS(designer_id) ON DELETE CASCADE
);

-- Data Insertion

-- 1. USERS
INSERT INTO USERS (user_id, name, phone, email, password, role) VALUES
(1, '장원장', '010-1111-1111', 'owner@salon.com', 'password123', 'OWNER'),
(2, '김스타 수석', '010-2222-2222', 'designer1@salon.com', 'password123', 'DESIGNER'),
(3, '이초보', '010-3333-3333', 'designer2@salon.com', 'password123', 'DESIGNER'),
(4, '박철수', '010-4444-4444', 'customer1@test.com', 'password123', 'CUSTOMER'),
(5, '최영희', '010-5555-5555', 'customer2@test.com', 'password123', 'CUSTOMER');

-- 2. SHOPS
INSERT INTO SHOPS (shop_id, owner_id, name, tel, address) VALUES
(1, 1, '살롱 드 강남', '02-1234-5678', '서울시 강남구 테헤란로 123');

-- 3. DESIGNERS
INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end) VALUES
(1, 2, 1, '10년 경력의 베테랑 디자이너 김스타입니다.', '10:00:00', '20:00:00'),
(2, 3, 1, '친절하게 모시겠습니다.', '11:00:00', '21:00:00');

-- 4. MENUS
INSERT INTO MENUS (menu_id, shop_id, name, price, duration, description) VALUES
(1, 1, '베이직 커트', 25000, 30, '기본 남성/여성 커트'),
(2, 1, '프리미엄 펌', 120000, 120, '손상 없는 프리미엄 펌'),
(3, 1, '뿌리 염색', 50000, 60, '뿌리 2cm 기준 염색');

-- 5. RESERVATIONS (UTC Times for Standard Compliance)
-- 2025-12-10 10:00 EST -> 2025-12-10 01:00 UTC
-- 2025-12-11 14:00 EST -> 2025-12-11 05:00 UTC
-- 2025-12-11 16:00 EST -> 2025-12-11 07:00 UTC
-- 2025-12-12 11:00 EST -> 2025-12-12 02:00 UTC

INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, created_at) VALUES
(1, 1, 4, 1, '2025-12-11 05:00:00', '2025-12-11 05:30:00', 'CONFIRMED', '짧게 잘라주세요', '2025-12-11 16:52:25'),
(2, 1, 5, 1, '2025-12-11 07:00:00', '2025-12-11 09:00:00', 'PENDING', '처음 방문입니다.', '2025-12-11 16:52:25'),
(3, 1, 4, 2, '2025-12-12 02:00:00', '2025-12-12 03:30:00', 'CONFIRMED', NULL, '2025-12-11 16:52:25'),
(4, 1, 5, 1, '2025-12-10 01:00:00', '2025-12-10 01:30:00', 'COMPLETED', NULL, '2025-12-11 16:52:25');

-- 6. RESERVATION_ITEMS
INSERT INTO RESERVATION_ITEMS (reservation_id, menu_id, menu_name, price) VALUES
(1, 1, '베이직 커트', 25000),
(2, 2, '프리미엄 펌', 120000),
(3, 2, '프리미엄 펌', 120000),
(4, 1, '베이직 커트', 25000);
