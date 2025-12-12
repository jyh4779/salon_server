# 02. FRONTEND RULES (Admin Web)

## 1. 폴더 구조 (Directory Structure)
기능 단위가 아닌 **레이어(Layer) 중심** 구조를 따른다.


/frontend/src
  /api          # Axios 인스턴스, Endpoint별 API 호출 함수
  /assets       # 이미지, 아이콘 등 정적 리소스
  /components   # 재사용 가능한 공통 컴포넌트 (Button, Modal 등)
  /constants    # ★ [중요] 색상, 문자열, 환경변수 상수 정의
  /hooks        # Custom Hooks (useReservation, useAuth 등)
  /layouts      # 페이지 레이아웃 (Sidebar, Header)
  /pages        # 라우트별 페이지 컴포넌트 (비즈니스 로직 결합)
  /types        # 전역 인터페이스 및 DTO 타입 정의
  /utils        # 날짜 포맷팅 등 유틸리티 함수
  App.tsx
  main.tsx

## 2. 텍스트 및 상수 관리 (String & Constants)
- **하드코딩 금지:** UI에 노출되는 모든 한글 텍스트는 컴포넌트 내부에 직접 작성하지 않는다. (추후 다국어 및 유지보수 용이성을 위함)
- **파일 위치:** `src/constants/strings.ts`
- **작성 규칙:** 도메인(기능)별로 객체를 나누어 관리한다.
  ```typescript
  // src/constants/strings.ts
  export const STRINGS = {
    COMMON: { 
      SAVE: '저장', 
      CANCEL: '취소', 
      DELETE: '삭제' 
    },
    LOGIN: { 
      TITLE: '관리자 로그인', 
      ERROR_MSG: '정보를 확인해주세요.' 
    },
    RESERVATION: { 
      TABLE_TITLE: '예약 현황',
      STATUS_PENDING: '예약 대기', 
      STATUS_CONFIRMED: '예약 확정' 
    }
  };

## 3. 디자인 및 컬러 시스템 (Design System)
- **Hex 코드 직접 사용 금지:** `src/constants/colors.ts` 또는 Ant Design의 `theme token`을 사용한다.
- **스타일링:** 레이아웃 배치는 AntD의 `<Flex>`, `<Space>`, `<Row/Col>`을 우선 사용하고, 불가피할 때만 CSS-in-JS를 사용한다.