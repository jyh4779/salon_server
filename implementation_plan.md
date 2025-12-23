# Implementation Plan - Sales Dashboard & Schema Refactor

## Goal Description
1.  **매출 관리 고도화**: 신규/재방문, 객단가, 노쇼율, 시술 카테고리별 차트 추가.
2.  **MENUS 스키마 개선**: `category` 컬럼(String)을 제거하고, `category_id`(BigInt)를 추가하여 **Self-Relation**으로 구조를 변경합니다. (매장별 카테고리 관리 최적화)

## Proposed Changes

### Database (Prisma Schema)

#### [MODIFY] `backend/prisma/schema.prisma`
- `MENUS` 모델 수정:
  - `category` String 필드 삭제 (Migration 시 주의).
  - `category_id` BigInt 필드 추가 (Self-Relation: `ParentMenu`).
  - `parent` / `children` 관계 정의.

### Backend (NestJS)

#### [MODIFY] `src/sales/sales.service.ts`
- **통계 계산 로직 변경**:
  - `RESERVATION_ITEMS` -> `MENUS` -> `ParentMenu` (Category) 순으로 조회하여 카테고리명을 가져옵니다.
  - 신규/재방문, 객단가, 노쇼율 계산 로직 추가.

#### [MODIFY] `src/menus/menus.service.ts` (If exists) or Logic
- 메뉴 생성/수정 시 `category_id`를 처리하도록 수정.

### Frontend (React)

#### [MODIFY] `package.json`
- `recharts` 추가.

#### [MODIFY] `src/pages/sales/SalesPage.tsx`
- **Summary Cards**: 객단가, 신규/재방문 추가.
- **Charts**: 시술 카테고리별 Pie Chart 구현.
- **Table**: 디자이너별 객단가 컬럼 추가.

## Migration Strategy (Critical)
이미 운영 중인 데이터가 있다면, 스키마 변경 전 데이터를 보존해야 합니다.
1. `category_id` 컬럼 추가 (Nullable).
2. 기존 `category` (String) 값을 기반으로 `category_id` 매핑 업데이트 (SQL 실행).
3. `category` (String) 컬럼 삭제 (선택 사항, 혹은 유지하며 Deprecated).

**[Safe Migration Steps in Code]**
- 이번 작업에서는 `category_id`를 추가하고, 조회 로직을 변경하는 것에 집중합니다.
- 기존 String 데이터 마이그레이션이 필요하다면 별도 스크립트를 제공합니다.

## Verification Plan
- **Schema**: `npx prisma db push` 후 DB 테이블 구조 확인.
- **Sales API**: `GET /sales/daily` 호출 시 `categoryStats`에 카테고리 이름이 정상적으로 집계되는지 확인.
- **Frontend**: 차트 및 요약 카드가 정상 렌더링되는지 확인.
