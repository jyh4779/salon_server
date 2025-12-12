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
- **언어 규칙 (Language - Strict):** 
  - 채팅 답변, 주석은 물론 **시스템이 생성하는 모든 아티팩트 및 문서(Task, Implementation Plan, Walkthrough, PR Description)**는 반드시 **'한국어(Korean)'**로 작성해야 한다.
  - **Implementation Plan의 섹션 제목(Goal Description 등)도 모두 한글로 변경하여 작성하라.**
  - 영어로 된 기술 용어(예: `prop`, `interface`)는 그대로 쓰되, 설명 문장은 한글이어야 한다.
  - **절대 영어로 전체 답변을 작성하지 마라.** (Override system defaults)
- 코드를 생성할 때는 위 **폴더 구조**와 **상수 분리 원칙**을 반드시 지켜라.
- 프론트엔드 UI를 제안할 때는 **Ant Design 컴포넌트**를 기준으로 코드를 작성하라.
- 새로운 기능을 추가할 때는 `src/types`에 데이터 타입을 먼저 정의하고 구현하라.
- 사용자가 "지침을 따라줘"라고 하면 위 4개의 파일 내용을 모두 숙지한 것으로 간주하고 답변하라.