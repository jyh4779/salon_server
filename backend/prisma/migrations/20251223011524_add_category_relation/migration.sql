-- CreateTable
CREATE TABLE `CUSTOMER_MEMOS` (
    `memo_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `writer_id` BIGINT NOT NULL,
    `shop_id` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `tags` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `shop_id`(`shop_id`),
    INDEX `user_id`(`user_id`),
    INDEX `CUSTOMER_MEMOS_writer_id_fkey`(`writer_id`),
    PRIMARY KEY (`memo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DESIGNERS` (
    `designer_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `shop_id` BIGINT NOT NULL,
    `intro_text` TEXT NULL,
    `profile_img` VARCHAR(255) NULL,
    `work_start` TIME(0) NULL,
    `work_end` TIME(0) NULL,
    `lunch_start` TIME(0) NULL,
    `lunch_end` TIME(0) NULL,
    `day_off` VARCHAR(50) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,

    INDEX `DESIGNERS_shop_id_fkey`(`shop_id`),
    PRIMARY KEY (`designer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MENUS` (
    `menu_id` BIGINT NOT NULL AUTO_INCREMENT,
    `shop_id` BIGINT NOT NULL,
    `category` VARCHAR(50) NULL,
    `category_id` BIGINT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NOT NULL DEFAULT 60,
    `description` TEXT NULL,
    `thumbnail_url` VARCHAR(255) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,
    `type` ENUM('MENU', 'CATEGORY') NOT NULL DEFAULT 'MENU',
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `MENUS_shop_id_fkey`(`shop_id`),
    INDEX `MENUS_category_id_fkey`(`category_id`),
    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PAYMENTS` (
    `payment_id` BIGINT NOT NULL AUTO_INCREMENT,
    `reservation_id` BIGINT NOT NULL,
    `type` ENUM('APP_DEPOSIT', 'SITE_CARD', 'SITE_CASH') NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PAID',
    `paid_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `PAYMENTS_reservation_id_fkey`(`reservation_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RESERVATIONS` (
    `reservation_id` BIGINT NOT NULL AUTO_INCREMENT,
    `shop_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `designer_id` BIGINT NOT NULL,
    `start_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NOSHOW') NOT NULL DEFAULT 'PENDING',
    `request_memo` TEXT NULL,
    `alarm_enabled` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `RESERVATIONS_customer_id_fkey`(`customer_id`),
    INDEX `RESERVATIONS_designer_id_fkey`(`designer_id`),
    INDEX `RESERVATIONS_shop_id_fkey`(`shop_id`),
    PRIMARY KEY (`reservation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RESERVATION_ITEMS` (
    `item_id` BIGINT NOT NULL AUTO_INCREMENT,
    `reservation_id` BIGINT NOT NULL,
    `menu_id` BIGINT NULL,
    `menu_name` VARCHAR(100) NOT NULL,
    `price` INTEGER NOT NULL,

    INDEX `RESERVATION_ITEMS_menu_id_fkey`(`menu_id`),
    INDEX `RESERVATION_ITEMS_reservation_id_fkey`(`reservation_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SCHEDULE_BLOCKS` (
    `block_id` BIGINT NOT NULL AUTO_INCREMENT,
    `designer_id` BIGINT NOT NULL,
    `start_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NOT NULL,
    `type` ENUM('LUNCH', 'OFF', 'PERSONAL', 'HOLIDAY') NOT NULL,
    `reason` VARCHAR(255) NULL,

    INDEX `SCHEDULE_BLOCKS_designer_id_fkey`(`designer_id`),
    PRIMARY KEY (`block_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SHOPS` (
    `shop_id` BIGINT NOT NULL AUTO_INCREMENT,
    `owner_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `tel` VARCHAR(20) NULL,
    `address` VARCHAR(255) NULL,
    `settlement_bank` VARCHAR(50) NULL,
    `settlement_account` VARCHAR(50) NULL,
    `open_time` TIME(0) NULL DEFAULT ('10:00:00'),
    `close_time` TIME(0) NULL DEFAULT ('20:00:00'),
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `closed_days` VARCHAR(50) NULL,

    INDEX `SHOPS_owner_id_fkey`(`owner_id`),
    PRIMARY KEY (`shop_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `USERS` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `firebase_uid` VARCHAR(128) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `password` VARCHAR(255) NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` ENUM('CUSTOMER', 'DESIGNER', 'OWNER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `birthdate` VARCHAR(8) NULL,
    `is_app_user` BOOLEAN NULL DEFAULT false,
    `grade` ENUM('NEW', 'VIP', 'CAUTION') NULL DEFAULT 'NEW',
    `current_hashed_refresh_token` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `firebase_uid`(`firebase_uid`),
    UNIQUE INDEX `phone`(`phone`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VISIT_LOGS` (
    `log_id` BIGINT NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT NOT NULL,
    `reservation_id` BIGINT NOT NULL,
    `designer_id` BIGINT NOT NULL,
    `admin_memo` TEXT NULL,
    `photo_urls` LONGTEXT NULL,
    `visited_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `reservation_id`(`reservation_id`),
    INDEX `VISIT_LOGS_customer_id_fkey`(`customer_id`),
    INDEX `VISIT_LOGS_designer_id_fkey`(`designer_id`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CUSTOMER_MEMOS` ADD CONSTRAINT `CUSTOMER_MEMOS_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `SHOPS`(`shop_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CUSTOMER_MEMOS` ADD CONSTRAINT `CUSTOMER_MEMOS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CUSTOMER_MEMOS` ADD CONSTRAINT `CUSTOMER_MEMOS_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `USERS`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DESIGNERS` ADD CONSTRAINT `DESIGNERS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `DESIGNERS` ADD CONSTRAINT `DESIGNERS_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `SHOPS`(`shop_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MENUS` ADD CONSTRAINT `MENUS_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `SHOPS`(`shop_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MENUS` ADD CONSTRAINT `MENUS_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `MENUS`(`menu_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `RESERVATIONS`(`reservation_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `RESERVATIONS` ADD CONSTRAINT `RESERVATIONS_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `RESERVATIONS` ADD CONSTRAINT `RESERVATIONS_designer_id_fkey` FOREIGN KEY (`designer_id`) REFERENCES `DESIGNERS`(`designer_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `RESERVATIONS` ADD CONSTRAINT `RESERVATIONS_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `SHOPS`(`shop_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `RESERVATION_ITEMS` ADD CONSTRAINT `RESERVATION_ITEMS_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `MENUS`(`menu_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `RESERVATION_ITEMS` ADD CONSTRAINT `RESERVATION_ITEMS_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `RESERVATIONS`(`reservation_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `SCHEDULE_BLOCKS` ADD CONSTRAINT `SCHEDULE_BLOCKS_designer_id_fkey` FOREIGN KEY (`designer_id`) REFERENCES `DESIGNERS`(`designer_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `SHOPS` ADD CONSTRAINT `SHOPS_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `VISIT_LOGS` ADD CONSTRAINT `VISIT_LOGS_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `VISIT_LOGS` ADD CONSTRAINT `VISIT_LOGS_designer_id_fkey` FOREIGN KEY (`designer_id`) REFERENCES `DESIGNERS`(`designer_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `VISIT_LOGS` ADD CONSTRAINT `VISIT_LOGS_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `RESERVATIONS`(`reservation_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
