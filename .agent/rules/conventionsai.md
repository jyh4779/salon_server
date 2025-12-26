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
  - Logic/Util/Test: `camelCase.ts` / `camelCase.spec.ts`

### 1.2. 타입스크립트 (TypeScript)
- `any` 타입 사용을 **엄격히 금지**한다.
- API 응답값이나 Props는 반드시 `interface`로 명확히 정의한다.

### 1.3. 주석 (Comments)
- 복잡한 비즈니스 로직(예: 시간 슬롯 계산, 토큰 검증 등)에는 **한글 주석**을 상세히 작성한다.

## 2. 개발 워크플로우 (TDD & Clean Architecture)

### 2.1. 작업 시작 전 필수: Implementation Plan
코드를 작성하기 전, 반드시 아래의 **Implementation Plan** 형식을 `IMPLEMENTATION_PLAN.md` 파일로 생성하고 사용자 승인을 받아야 한다.

---
# [Feature Name] Implementation Plan

## 1. Context & Goal
- **목표:** (구현하려는 기능 요약)
- **아키텍처 영향:** (Domain, UseCase, UI 변경점)

## 2. Proposed Changes
- [ ] Backend: `src/domain/...` (엔티티)
- [ ] Backend: `src/application/...` (서비스)
- [ ] Frontend: `src/hooks/...` (비즈니스 로직)

## 3. TDD Phases (Red -> Green -> Refactor)
- [ ] **Step 1 (Red):** 실패하는 테스트 코드 작성 (Spec/Test 파일)
- [ ] **Step 2 (Green):** 테스트를 통과하는 최소한의 구현
- [ ] **Step 3 (Refactor):** 코드 품질 개선 및 중복 제거

## 4. Quality Gate
- [ ] 모든 테스트 통과 확인
- [ ] 린트(Lint) 에러 없음 확인
---

### 2.2. TDD 원칙 (Test Driven Development)
1. **RED:** 구현 코드를 작성하기 전에 반드시 **테스트 코드(`*.spec.ts`)**를 먼저 작성하라.
2. **GREEN:** 테스트를 통과하기 위한 최소한의 코드만 작성하라.
3. **REFACTOR:** 기능이 동작하면 코드를 클린 아키텍처 구조에 맞게 정리하라.

## 3. Gemini 3 Pro 전용 지침 (Instruction for Gemini)

### 3.1. Reasoning Process (Chain of Thought)
사용자의 요청에 답하기 전, **반드시 아래 과정을 거쳐 생각한 뒤** 답변을 생성하라. (내부적으로 사고하되, 최종 답변에는 결과만 출력해도 좋다.)

1.  **Analyze:** 사용자의 요청이 `docs/`의 어떤 기능 ID와 연관되어 있는가?
2.  **Plan:** TDD 절차(Red-Green-Refactor)를 어떻게 적용할 것인가?
3.  **Check:** 클린 아키텍처 원칙(의존성 규칙)을 위반하지 않는가?

### 3.2. 언어 및 태도 (Language & Attitude)
- **Main Language:** 모든 설명, 주석, 문서는 **'한국어(Korean)'**로 작성한다.
- **Tech Terms:** 기술 용어(e.g., `Dependency Injection`, `Repository Pattern`)는 영어 원문을 유지한다.
- **Tone:** 명확하고 전문적인 어조를 유지하되, 불필요한 서론을 줄이고 핵심만 전달한다.

## 4. 문서 참조 필수 지침 (Documentation Reference)
작업 전 반드시 아래 파일들을 읽고 맥락을 파악하라.

- **기능 명세서:** `docs/01_FEATURE_LIST.md` (로직 기준)
- **DB 스키마:** `docs/02_DATABASE_ERD.md` (데이터 구조 기준)
- **UI 디자인:** `docs/design/` (Ant Design 기준)

**[Gemini Strict Rule]**
사용자가 "구현해줘"라고 요청하면 바로 코드를 짜지 말고, **"먼저 Implementation Plan을 작성하겠습니다."**라고 응답하고 계획을 제시하라.