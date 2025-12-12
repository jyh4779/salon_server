# 02. Database ERD

이 프로젝트의 데이터베이스 스키마는 아래 Mermaid 다이어그램을 따른다.

```mermaid
erDiagram
    
		%% ==========================================
    %% 1. 사용자 및 권한 관리 (Core)
    %% ==========================================
    USERS {
        bigint user_id PK "내부 관리용 PK"
        string firebase_uid UK "Firebase UID (NULL 허용: 오프라인 손님)"
        string phone UK "휴대폰번호 (★식별키, NOT NULL)"
        string email UK "이메일 (NULL 허용: 소셜/오프라인)"
        string password "NULL 허용 (Firebase 관리)"
        string name "이름"
        enum role "CUSTOMER, DESIGNER, OWNER, ADMIN" 
        enum gender "MALE, FEMALE" 
        string birthdate "YYYYMMDD"
        boolean is_app_user "앱 가입 여부 (TRUE/FALSE)"
        enum grade "NEW, VIP, CAUTION"
        datetime created_at
    }
    
		%% 디자이너 상세 정보 (Users 확장, 1:1)
    DESIGNERS {
        bigint designer_id PK
        bigint user_id FK "Users 참조 (1:1)"
        bigint shop_id FK "Shops 참조"
        text intro_text "디자이너 소개"
        string profile_img "프로필 이미지 URL"
        time work_start "근무 시작"
        time work_end "근무 종료"
        boolean is_active "재직 여부"
    }
    
    %% ==========================================
    %% 2. 매장 및 메뉴 (Shop Info)
    %% ==========================================
    SHOPS {
        bigint shop_id PK
        bigint owner_id FK "Users(Role=OWNER) 참조"
        string name "매장명"
        string tel "매장 전화번호"
        string address "매장 주소"
        string settlement_bank "정산 은행"
        string settlement_account "정산 계좌"
    }
    
    MENUS {
        bigint menu_id PK
        bigint shop_id FK
        string name "시술명"
        int price "기본 가격"
        int duration "소요시간(분)"
        text description "시술 설명"
    }
    
    %% ==========================================
    %% 3. 예약 및 스케줄 (Core Logic)
    %% ==========================================
    RESERVATIONS {
        bigint reservation_id PK
        bigint shop_id FK
        bigint customer_id FK "Users(손님) 참조"
        bigint designer_id FK "Designers(디자이너) 참조"   
             
        datetime start_time "예약 시작"
        datetime end_time "예약 종료"
        enum status "PENDING, CONFIRMED, COMPLETED, CANCELED, NOSHOW"
        
        text request_memo "고객 요청사항"
        boolean alarm_enabled "알림톡 발송 여부"
        datetime created_at
    }
    
    %% 예약 상세 품목 (가격 변동 기록용 스냅샷)
    RESERVATION_ITEMS {
        bigint item_id PK
        bigint reservation_id FK
        bigint menu_id FK "원본 메뉴 참조"
        string menu_name "시술명(스냅샷)"
        int price "결제 금액(스냅샷)"
    }
    
    %% 디자이너 스케줄 차단 (휴무, 점심 등)
    SCHEDULE_BLOCKS {
        bigint block_id PK
        bigint designer_id FK
        datetime start_time
        datetime end_time
        enum type "LUNCH, OFF, PERSONAL, HOLIDAY"
    }
    
    %% ==========================================
    %% 4. 결제 및 정산 (Finance)
    %% ==========================================
    PAYMENTS {
        bigint payment_id PK
        bigint reservation_id FK
        enum type "APP_DEPOSIT, SITE_CARD, SITE_CASH"
        int amount "결제 금액"
        enum status "PAID, REFUNDED, FAILED"
        datetime paid_at "결제 일시"
    }
    
    %% ==========================================
    %% 5. 기록 및 CRM (History)
    %% ==========================================
    %% 시술 완료 후 기록
    VISIT_LOGS {
        bigint log_id PK
        bigint customer_id FK "Users 참조"
        bigint reservation_id FK
        bigint designer_id FK "시술한 디자이너"
        text admin_memo "시술 상세 메모"
        json photo_urls "시술 사진(JSON 배열)"
        datetime visited_at
    }
    
    %% 고객 특이사항 메모 (원장/디자이너 공유)
    CUSTOMER_MEMOS {
        bigint memo_id PK
        bigint user_id FK "대상 고객"
        bigint writer_id FK "작성자(디자이너/원장)"
        bigint shop_id FK
        text content "메모 내용"
        string tags "태그(#진상 #지인)"
    }
    
    %% ==========================================
    %% 관계 정의 (Relationships)
    %% ==========================================
    
    %% User & Role Relationships
    USERS ||--o| DESIGNERS : "has_profile (if role=DESIGNER)"
    USERS ||--o{ SHOPS : "owns (if role=OWNER)"
    
    %% Shop Ownership & Staff
    SHOPS ||--o{ DESIGNERS : employs
    SHOPS ||--o{ MENUS : offers
    
    %% Reservation Flow
    USERS ||--o{ RESERVATIONS : "makes (Customer)"
    DESIGNERS ||--o{ RESERVATIONS : "receives"
    SHOPS ||--o{ RESERVATIONS : "has"
    
    %% Reservation Details
    RESERVATIONS ||--|{ RESERVATION_ITEMS : includes
    RESERVATIONS ||--o{ PAYMENTS : paid_via
    MENUS ||--o{ RESERVATION_ITEMS : "snapshot_of"
    
    %% Schedule Management
    DESIGNERS ||--o{ SCHEDULE_BLOCKS : "has_blocked_time"
    
    %% CRM & History
    USERS ||--o{ VISIT_LOGS : "has_history"
    RESERVATIONS ||--o| VISIT_LOGS : "generates"
    USERS ||--o{ CUSTOMER_MEMOS : "is_about"
    ```