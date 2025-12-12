# 03. Sequence Diagrams

## 1. 회원가입 및 계정 통합 (Auth & Merge)
앱 가입 시 휴대폰 번호를 이용해 기존 오프라인 고객 데이터와 매칭하는 로직.
- 앱에서 Firebase 소셜 로그인을 완료한 후, 서버에 저장된 Users 테이블을 조회합니다.
- firebase_uid 가 없으면 신규 가입 절차로 넘어가며, 이때 phone 번호를 입력받아 기존 오프라인 고객 데이터와 매칭(DB Update) 하거나 신규 생성(DB Insert) 합니다.

```mermaid
sequenceDiagram
    actor User
    participant App as App (Client)
    participant Firebase
    participant Server as API Server
    participant DB as Database

    User->>App: 소셜 로그인 버튼 클릭 (카카오/구글)
    App->>Firebase: 인증 요청
    Firebase-->>App: idToken (JWT) & UID 발급
    
    Note right of App: 1차: 가입 여부 확인
    App->>Server: [GET] /api/auth/check (Header: idToken)
    Server->>DB: SELECT * FROM Users WHERE firebase_uid = ?
    
    alt 이미 가입된 앱 유저 (firebase_uid 존재)
        DB-->>Server: User Data
        Server-->>App: 200 OK (로그인 성공, 홈으로 이동)
    else 미가입 유저 (firebase_uid 없음)
        Server-->>App: 404 Not Found (회원가입 필요)
        
        Note right of App: 2차: 추가 정보 입력 및 가입
        App->>User: 휴대폰 번호 인증 & 이름 입력 요청
        User->>App: 정보 입력 완료
        App->>Server: [POST] /api/auth/register (UID, Phone, Name...)
        
        Server->>DB: SELECT * FROM Users WHERE phone = ?
        
        alt 기존 오프라인 고객 존재 (Phone 일치)
            DB-->>Server: Existing User (UID=NULL)
            Server->>DB: UPDATE Users SET firebase_uid=?, is_app_user=TRUE WHERE user_id=?
            DB-->>Server: Success
            Server-->>App: 200 OK (계정 통합 완료)
        else 완전 신규 유저
            DB-->>Server: Empty
            Server->>DB: INSERT INTO Users (...)
            DB-->>Server: Success
            Server-->>App: 201 Created (신규 가입 완료)
        end
    end
```

## 2. 예약 가능 시간 조회 (Time Slot Calculation)
선택한 메뉴의 소요시간(Duration)을 고려하여 빈 시간을 찾는 로직.
- 사용자가 날짜와 디자이너를 선택하면, 서버는 **(1) 디자이너 근무시간 (2) 기존 예약 (3) 스케줄 블록(휴무)** 3가지를 고려하여 '예약 가능한 시간 슬롯'만 필터링해 줍니다.
- 이후 사용자가 슬롯을 선택하면 최종 예약을 생성합니다.

```mermaid
sequenceDiagram
    actor User
    participant App
    participant Server
    participant DB

    Note over User, App: Step 1: 조건 선택
    User->>App: 디자이너(A) + 시술(펌, 120분) + 날짜 선택
    
    Note over App, Server: 소요시간(Duration)을 파라미터로 전달
    App->>Server: [GET] /api/slots?date=2025-05-20&designer_id=A&menu_id=101
    
    Server->>DB: SELECT duration FROM Menus WHERE menu_id=101
    DB-->>Server: Duration = 120 (분)
    
    Server->>DB: 1. 근무시간 조회 (Work Hours)
    Server->>DB: 2. 기존 예약 & 휴무 조회 (Busy Times)
    
    Note right of Server: ★ 핵심 알고리즘 수행 (Time Slicing)
    loop 09:00부터 20:00까지 30분 단위로 체크
        Server->>Server: (후보 시간 + 120분)이 근무시간 내인가?
        Server->>Server: (후보 시간 ~ 후보 시간 + 120분) 사이에<br/>기존 예약(Busy)이 겹치는가?
        alt 겹치지 않음 (충분한 공간 확보)
            Server->>Server: 결과 리스트에 추가 (Available)
        else 겹침 (공간 부족)
            Server->>Server: 패스 (Unavailable)
        end
    end
    
    Server-->>App: Available Slots: ["10:00", "10:30", "16:00"...]
    App->>User: 예약 가능한 시간 버튼만 활성화
```

## 2. 디자이너 스케줄 관리 (Schedule Blocking)
디자이너나 원장이 점심시간, 개인 사정 등으로 특정 시간을 막으려 할 때(SCHEDULE_BLOCKS), 해당 시간에 이미 **확정된 예약(RESERVATIONS)**이 있는지 먼저 검증해야 합니다.

```mermaid
sequenceDiagram
    actor Designer as 디자이너(App/Web)
    participant Server
    participant DB

    Designer->>Server: [POST] /api/schedule/block (날짜, 12:00~13:00, 타입=LUNCH)
    
    Server->>DB: SELECT count(*) FROM Reservations WHERE designer_id=? AND time overlap (12:00~13:00) AND status != 'CANCELED'
    
    alt 겹치는 예약이 있음
        DB-->>Server: Count > 0
        Server-->>Designer: 400 Bad Request ("해당 시간에 예약이 존재하여 막을 수 없습니다.")
    else 예약 없음 (깨끗함)
        DB-->>Server: Count = 0
        Server->>DB: INSERT INTO Schedule_Blocks (...)
        DB-->>Server: Success
        Server-->>Designer: 200 OK (스케줄 차단 완료)
        
        Note right of Designer: 이제 고객들은 이 시간에 예약 불가
    end
```