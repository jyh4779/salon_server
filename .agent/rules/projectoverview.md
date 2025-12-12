---
trigger: always_on
---

# 01. PROJECT OVERVIEW & TECH STACK

## 1. 프로젝트 개요 (Overview)
- **프로젝트명:** Salon Manager (Admin Web & API Server)
- **개발 주체:** 1인 개발자 (Jang)
- **목표:** 미용실 예약 관리 서비스를 위한 관리자용 웹 페이지와 백엔드 API 서버 구축.
- **핵심 가치:** 1인 개발 특성상 **생산성**과 **유지보수 용이성**을 최우선으로 함. 복잡한 추상화보다 직관적인 코드를 선호.

## 2. 기술 스택 (Tech Stack)

### 2.1. Backend (API Server)
- **Language:** TypeScript
- **Framework:** NestJS (Modules/Controller/Service 구조 준수)
- **Database:** MySQL 8.0
- **ORM:** Prisma
- **Auth:** Firebase Auth (Token Validation) + Custom Logic (DB User Mapping)

### 2.2. Frontend (Admin Web)
- **Language:** TypeScript
- **Framework:** React (Vite 기반)
- **UI Library:** **Ant Design 5.x** (적극 활용, 커스텀 CSS 최소화)
- **State Management:** TanStack Query (React Query)
- **Styling:** Styled-components 또는 Emotion (AntD Design Token 활용 권장)
- **Calendar:** FullCalendar React