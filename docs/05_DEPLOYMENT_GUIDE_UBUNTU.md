# 05. UBUNTU SERVER DEPLOYMENT GUIDE (with PM2)

본 가이드는 Ubuntu Linux 서버에 **NestJS 백엔드**를 배포하고 **PM2**로 무중단 운영하는 방법을 설명합니다.

## 1. Node.js 및 Yarn 설치 (Server Setup)
서버에 접속하여 최신 Node.js (LTS 버전)와 패키지 매니저를 설치합니다.

```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Node.js 설치 (NodeSource PPA 사용 - v20 LTS 권장)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 설치 확인
node -v
npm -v

# 4. Yarn 및 PM2 전역 설치
sudo npm install -g yarn pm2
```

## 2. 프로젝트 코드 가져오기 (Close/Upload)
GitHub 등을 통해 코드를 클론하거나, FTP로 `backend` 폴더를 업로드합니다.

```bash
# 예시: 홈 디렉토리에 프로젝트 생성
mkdir -p ~/salon-manager
cd ~/salon-manager

# (Git을 사용하는 경우)
git clone <YOUR_REPOSITORY_URL> .
```

## 3. 백엔드 설정 및 빌드 (Build)
백엔드 폴더로 이동하여 의존성을 설치하고 빌드합니다.

```bash
cd backend

# 1. 의존성 설치
yarn install

# 2. 환경 변수 파일 생성 (.env)
# 로컬의 .env 내용을 복사하여 서버에 생성합니다.
nano .env
# (내용 붙여넣기 후 Ctrl+O -> Enter -> Ctrl+X 로 저장 및 종료)

# 3. Prisma 클라이언트 생성 (DB 연결 확인 후)
npx prisma generate

# 4. 프로덕션 빌드
yarn build
```

## 4. PM2로 서버 실행 (Run)
작성해둔 `ecosystem.config.js` 파일을 이용하여 서버를 실행합니다.

```bash
# PM2로 서버 시작
pm2 start ecosystem.config.js

# 실행 상태 확인
pm2 status

# 실시간 로그 확인 (나가려면 Ctrl+C)
pm2 logs salon-api
```

## 5. 서버 재부팅 시 자동 실행 설정 (Startup Hook)
서버가 재부팅되어도 백엔드가 자동으로 켜지도록 설정합니다.

```bash
# 1. 현재 실행 중인 프로세스 리스트 저장
pm2 save

# 2. 시작 스크립트 생성 (명령어 실행 후 나오는 문구를 복사해서 실행해야 함)
pm2 startup

# (출력되는 sudo env PATH... 명령어를 복사하여 터미널에 붙여넣고 실행)
```

## 6. 주요 관리 명령어 (Cheatsheet)
- **서버 중지:** `pm2 stop salon-api`
- **서버 재시작:** `pm2 restart salon-api` (코드 업데이트 후 필수)
- **서버 삭제:** `pm2 delete salon-api`
- **모니터링:** `pm2 monit`
