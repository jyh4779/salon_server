# 05. WINDOWS DEVELOPMENT GUIDE

본 가이드는 Windows 환경에서 **Salon Manager** 프로젝트를 로컬 개발(실행 및 테스트)하는 방법을 설명합니다.

## 1. 개발 환경 설정 (Prerequisites)

### 1.1. Node.js & Yarn 설치
1. **Node.js**: [공식 홈페이지](https://nodejs.org/)에서 LTS 버전(v20 권장)을 다운로드하여 설치합니다.
2. **Yarn**: 터미널(PowerShell 또는 CMD)을 열고 다음 명령어로 설치합니다.
   ```powershell
   npm install -g yarn
   ```
3. **설치 확인**:
   ```powershell
   node -v
   yarn -v
   ```

### 1.2. 프로젝트 코드 가져오기
GitHub 저장소를 클론하거나 코드를 다운로드합니다.
```powershell
git clone <YOUR_REPOSITORY_URL> salon-manager
cd salon-manager
```

---

## 2. 프로젝트 실행 (Running Locally)

본 프로젝트는 **Yarn Workspace**로 구성되어 있어 루트에서 한 번에 의존성을 관리합니다.

### 2.1. 의존성 설치 (Install Dependencies)
프로젝트 루트 폴더에서 다음 명령어를 실행하면 백엔드와 프론트엔드의 라이브러리가 모두 설치됩니다.
```powershell
yarn install
```

### 2.2. 로컬 실행 (Development Mode)
터미널을 **두 개** 열어서 각각 실행해야 합니다.

**터미널 1: 백엔드 (API Server)**
```powershell
# API 서버 실행 (포트 3000)
yarn dev:backend
```

**터미널 2: 프론트엔드 (Admin Web)**
```powershell
# 웹 서버 실행 (포트 5173 - Vite 기본값)
yarn dev:frontend
```

---

## 3. 기능 테스트 (Testing)
브라우저를 열고 `http://localhost:5173`으로 접속합니다.
- **API 동작 확인:** 로그인, 예약 조회 등의 기능이 정상 동작하는지 확인합니다.
- **백엔드 문서(Swagger):** 백엔드가 실행 중이라면 `http://localhost:3000/api` (설정된 경우) 등으로 접근 가능합니다.

---

## 4. 문제 해결 (Troubleshooting)
- **포트 충돌:** 3000번이나 5173번 포트가 이미 사용 중이라면 해당 프로세스를 종료하거나 설정을 변경해야 합니다.
- **환경 변수(.env):** 백엔드 폴더(`backend/.env`) 설정이 올바른지 확인하세요. (DB 접속 정보 등)
