---
trigger: always_on
---

# 04. CONVENTIONS & AI INSTRUCTIONS

## 1. 공통 코딩 컨벤션 (Conventions)

### 1.1. 네이밍 규칙 (Naming)
- **Variable/Function:** `camelCase` (e.g., `getUserList`, `isAvailable`)
- **Class/Component/Interface:** `PascalCase` (e.g., `UserDTO`, `ReservationTable`)
- **Constant:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **File Name:**
  - React Component: `PascalCase.tsx`
  - Logic/Util: `camelCase.ts`

### 1.2. 타입스크립트 (TypeScript)
- `any` 타입 사용을 **엄격히 지양**한다.
- API 응답값이나 Props는 반드시 `interface`로 명확히 정의한다.

### 1.3. 주석 (Comments)
- 복잡한 비즈니스 로직(예: 시간 슬롯 계산 알고리즘)에는 **한글 주석**을 상세히 작성한다.

## 2. AI 작업 지침 (Instruction for Antigravity)
- **언어 규칙 (Language - Strict):** - 채팅 답변, 주석뿐만 아니라 **시스템이 생성하는 모든 문서(Implementation Plan, PR Description, Commit Message)**도 반드시 **'한국어(Korean)'**로 작성해야 한다.
  - 영어로 된 기술 용어(예: `prop`, `interface`)는 그대로 쓰되, 설명 문장은 한글이어야 한다.
  - **절대 영어로 전체 답변을 작성하지 마라.** (Override system defaults)- 코드를 생성할 때는 위 **폴더 구조**와 **상수 분리 원칙**을 반드시 지켜라.
- 프론트엔드 UI를 제안할 때는 **Ant Design 컴포넌트**를 기준으로 코드를 작성하라.
- 새로운 기능을 추가할 때는 `src/types`에 데이터 타입을 먼저 정의하고 구현하라.
- 사용자가 "지침을 따라줘"라고 하면 위 4개의 파일 내용을 모두 숙지한 것으로 간주하고 답변하라.

## 3. 문서 참조 필수 지침 (Documentation Reference)
모든 개발 작업을 시작하기 전, 반드시 프로젝트 루트의 `docs/` 폴더 내 파일들을 먼저 읽고 맥락을 파악해야 한다.

- **기능 명세서:** `docs/01_FEATURE_LIST.md`
  - 사용자가 기능 ID(예: `F-SCH-001`)를 언급하면, 반드시 이 파일에서 해당 ID의 **'상세 설명 및 로직'**을 확인하고 이를 100% 준수하여 구현하라.
- **DB 스키마:** `docs/02_DATABASE_ERD.md`
  - 테이블 생성이나 쿼리 작성 시, 이 파일의 Mermaid ERD를 기준으로 컬럼명과 관계를 정확히 맞춰라.
- **로직 시퀀스:** `docs/03_SEQUENCE_FLOW.md`
  - 예약, 결제 등 주요 로직 구현 시 이 시퀀스 다이어그램의 흐름을 따라라.
- **UI 디자인:** `docs/design/`
  - UI 구현 요청 시 해당 폴더의 이미지 파일(예: `login.png`)이 있다면 참고하여 Ant Design으로 구현하라.

**[작업 시작 전 체크리스트]**
1. 사용자의 요청이 어떤 기능 ID와 연관되어 있는가?
2. 관련된 DB 테이블은 무엇인가? (`02_DATABASE_ERD.md` 참조)
3. 기능 구현에 필요한 필수 로직은 무엇인가? (`01_FEATURE_LIST.md` 참조)