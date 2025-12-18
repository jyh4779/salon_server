
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  try {
    // 0. Clear existing data
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE VISIT_LOGS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE PAYMENTS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE RESERVATION_ITEMS;');
    // await prisma.$executeRawUnsafe('TRUNCATE TABLE INQUIRIES;'); // If exists
    await prisma.$executeRawUnsafe('TRUNCATE TABLE CUSTOMER_MEMOS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE SCHEDULE_BLOCKS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE RESERVATIONS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE MENUS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE DESIGNERS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE SHOPS;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE USERS;');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Data Injection (Based on backend/sql/01_test_data.sql)

    // 4-1. USERS (최상위 부모)
    // Owner (원장)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (1, '010-1111-1111', 'owner@example.com', '${hashedPassword}', '홍길동 원장', 'OWNER', 'MALE', '19800101', TRUE, 'VIP', NOW());
    `);

    // Designer 1 (수석)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (2, '010-2222-2222', 'designer1@example.com', '${hashedPassword}', '김스타 수석', 'DESIGNER', 'FEMALE', '19900505', TRUE, 'VIP', NOW());
    `);

    // Designer 2 (신입)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (3, '010-3333-3333', 'designer2@example.com', '${hashedPassword}', '이초보', 'DESIGNER', 'MALE', '19951225', TRUE, 'VIP', NOW());
    `);

    // Customer 1 (단골)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (4, '010-4444-4444', 'customer1@example.com', '${hashedPassword}', '박철수', 'CUSTOMER', 'MALE', '19850303', TRUE, 'VIP', NOW());
    `);

    // Customer 2 (신규)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (5, '010-5555-5555', 'customer2@example.com', '${hashedPassword}', '최영희', 'CUSTOMER', 'FEMALE', '19920815', FALSE, 'NEW', NOW());
    `);

    // Customer 3 (노쇼 주의)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (6, '010-6666-6666', 'customer3@example.com', '${hashedPassword}', '진상우', 'CUSTOMER', 'MALE', '19880101', TRUE, 'CAUTION', NOW());
    `);

    // Customer 4 (VIP)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (7, '010-7777-7777', 'customer4@example.com', '${hashedPassword}', '한소희', 'CUSTOMER', 'FEMALE', '19951111', TRUE, 'VIP', NOW());
    `);

    // Customer 5 (일반)
    await prisma.$executeRawUnsafe(`
      INSERT INTO USERS (user_id, phone, email, password, name, role, gender, birthdate, is_app_user, grade, created_at)
      VALUES (8, '010-8888-8888', 'customer5@example.com', '${hashedPassword}', '이민수', 'CUSTOMER', 'MALE', '19900222', TRUE, 'NEW', NOW());
    `);


    // 4-2. SHOPS (USERS 참조)
    await prisma.$executeRawUnsafe(`
      INSERT INTO SHOPS (shop_id, owner_id, name, tel, address, settlement_bank, settlement_account)
      VALUES (1, 1, '살롱 매니저 강남점', '02-123-4567', '서울시 강남구 테헤란로 123', 'KB국민은행', '123-456-789012');
    `);


    // 4-3. DESIGNERS (USERS, SHOPS 참조)
    // 김스타 수석
    await prisma.$executeRawUnsafe(`
      INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
      VALUES (1, 2, 1, '10년 경력의 베테랑 디자이너 김스타입니다.', '10:00:00', '20:00:00', TRUE);
    `);

    // 이초보
    await prisma.$executeRawUnsafe(`
      INSERT INTO DESIGNERS (designer_id, user_id, shop_id, intro_text, work_start, work_end, is_active)
      VALUES (2, 3, 1, '친절하게 모시겠습니다.', '11:00:00', '21:00:00', TRUE);
    `);


    // 4-4. MENUS (SHOPS 참조)
    await prisma.$executeRawUnsafe(`
      INSERT INTO MENUS (menu_id, shop_id, name, price, duration, description)
      VALUES 
      (1, 1, '남성 디자인 커트', 25000, 30, '두상에 맞춘 세련된 커트'),
      (2, 1, '여성 셋팅펌', 120000, 120, '손상 없는 프리미엄 펌'),
      (3, 1, '전체 염색', 80000, 90, '퍼스널 컬러 맞춤 염색'),
      (4, 1, '두피 케어', 50000, 60, '시원한 쿨링 스파');
    `);


    // 4-5. RESERVATIONS (SHOPS, USERS, DESIGNERS 참조)
    // 예약 1: 김스타 - 박철수 (오늘 14:00 KST -> 05:00 UTC, 커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (1, 1, 4, 1, CONCAT(CURDATE(), ' 05:00:00'), CONCAT(CURDATE(), ' 05:30:00'), 'CONFIRMED', '짧게 잘라주세요', TRUE, NOW());
    `);

    // 예약 2: 김스타 - 최영희 (오늘 16:00 KST -> 07:00 UTC, 펌)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (2, 1, 5, 1, CONCAT(CURDATE(), ' 07:00:00'), CONCAT(CURDATE(), ' 09:00:00'), 'PENDING', '처음 방문입니다.', TRUE, NOW());
    `);

    // 예약 3: 이초보 - 박철수 (내일 11:00 KST -> 02:00 UTC, 염색)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (3, 1, 4, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 02:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 03:30:00'), 'CONFIRMED', NULL, TRUE, NOW());
    `);

    // 예약 4: 김스타 - 최영희 (어제 10:00 KST -> 01:00 UTC, 커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (4, 1, 5, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'), 'COMPLETED', NULL, TRUE, NOW());
    `);


    // 4-6. RESERVATION_ITEMS (RESERVATIONS, MENUS 참조)
    // 예약 1 (커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (1, 1, 1, '남성 디자인 커트', 25000);
    `);

    // 예약 2 (펌)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (2, 2, 2, '여성 셋팅펌', 120000);
    `);

    // 예약 3 (염색)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (3, 3, 3, '전체 염색', 80000);
    `);

    // 예약 4 (커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (4, 4, 1, '남성 디자인 커트', 25000);
    `);


    // 4-7. PAYMENTS (RESERVATIONS 참조)
    await prisma.$executeRawUnsafe(`
      INSERT INTO PAYMENTS (payment_id, reservation_id, type, amount, status, paid_at)
      VALUES (1, 4, 'SITE_CARD', 25000, 'PAID', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'));
    `);

    // 예약 5: 김스타 - 진상우 (오늘 11:00 KST -> 02:00 UTC, 두피 케어)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (5, 1, 6, 1, CONCAT(CURDATE(), ' 02:00:00'), CONCAT(CURDATE(), ' 03:00:00'), 'PENDING', '조용히 받고 싶습니다.', TRUE, NOW());
    `);

    // 예약 6: 김스타 - 한소희 (오늘 13:00 KST -> 04:00 UTC, 염색) - 점심 후 바로
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (6, 1, 7, 1, CONCAT(CURDATE(), ' 04:00:00'), CONCAT(CURDATE(), ' 05:30:00'), 'CONFIRMED', '애쉬 브라운으로 부탁해요', TRUE, NOW());
    `);

    // 예약 7: 이초보 - 이민수 (오늘 15:00 KST -> 06:00 UTC, 커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (7, 1, 8, 2, CONCAT(CURDATE(), ' 06:00:00'), CONCAT(CURDATE(), ' 06:30:00'), 'COMPLETED', NULL, TRUE, NOW());
    `);

    // 예약 8: 이초보 - 최영희 (오늘 19:00 KST -> 10:00 UTC, 펌) - 퇴근 직전
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (8, 1, 5, 2, CONCAT(CURDATE(), ' 10:00:00'), CONCAT(CURDATE(), ' 12:00:00'), 'CONFIRMED', '늦지 않게 갈게요', TRUE, NOW());
    `);

    // 예약 9: 김스타 - 박철수 (내일 14:00 KST -> 05:00 UTC, 두피 케어)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (9, 1, 4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 05:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:00:00'), 'PENDING', NULL, TRUE, NOW());
    `);

    // 예약 10: 이초보 - 한소희 (내일 10:00 KST -> 01:00 UTC, 커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATIONS (reservation_id, shop_id, customer_id, designer_id, start_time, end_time, status, request_memo, alarm_enabled, created_at)
      VALUES (10, 1, 7, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 01:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 01:30:00'), 'CONFIRMED', '앞머리만 다듬어주세요', TRUE, NOW());
    `);


    // 4-X. Additional Items & Payments
    // 예약 5 (두피 케어)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (5, 5, 4, '두피 케어', 50000);
    `);

    // 예약 6 (염색)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (6, 6, 3, '전체 염색', 80000);
    `);

    // 예약 7 (커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (7, 7, 1, '남성 디자인 커트', 25000);
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO PAYMENTS (payment_id, reservation_id, type, amount, status, paid_at)
      VALUES (2, 7, 'SITE_CASH', 25000, 'PAID', CONCAT(CURDATE(), ' 06:30:00'));
    `);

    // 예약 8 (펌)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (8, 8, 2, '여성 셋팅펌', 120000);
    `);

    // 예약 9 (두피 케어)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (9, 9, 4, '두피 케어', 50000);
    `);

    // 예약 10 (커트)
    await prisma.$executeRawUnsafe(`
      INSERT INTO RESERVATION_ITEMS (item_id, reservation_id, menu_id, menu_name, price)
      VALUES (10, 10, 1, '남성 디자인 커트', 25000);
    `);


    // 4-8. SCHEDULE_BLOCKS (DESIGNERS 참조)
    await prisma.$executeRawUnsafe(`
      INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
      VALUES (1, 1, CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 14:00:00'), 'LUNCH');
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO SCHEDULE_BLOCKS (block_id, designer_id, start_time, end_time, type)
      VALUES (2, 2, CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 'PERSONAL');
    `);

    console.log('Seeding finished.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
