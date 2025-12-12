# 06. UBUNTU SERVER DEPLOYMENT GUIDE (with PM2)

본 가이드는 Ubuntu Linux 서버에 **Salon Manager** 서비스를 배포하고 **무중단 운영(PM2)** 및 **Nginx**를 설정하는 방법을 설명합니다.

## 1. 사전 준비 (Server Setup)
서버에 접속하여 필수 패키지를 설치합니다.

```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Node.js (v20 LTS), Yarn, PM2 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g yarn pm2

# 3. 설치 확인
node -v
yarn -v
pm2 -v
nginx -v
```

## 2. 프로젝트 코드 배포 (Deploy Code)
Git을 이용해 코드를 서버로 내려받습니다.

```bash
# 예시 경로: 홈 디렉토리
mkdir -p ~/salon-manager
cd ~/salon-manager

# 코드 클론 (이미 있다면 git pull)
git clone <YOUR_REPOSITORY_URL> .
```

## 3. 의존성 설치 및 백엔드 빌드 (Backend)
루트에서 의존성을 통합 설치한 후 백엔드를 준비합니다.

```bash
# 1. 전체 의존성 설치 (루트)
yarn install

# 2. 백엔드 설정
cd backend
nano .env  # (환경변수 파일 생성 및 내용 붙여넣기)

# 3. Prisma 설정 및 빌드
npx prisma generate
yarn build
```

## 4. 백엔드 실행 (Run Backend with PM2)
PM2를 사용하여 백엔드 서버를 백그라운드에서 실행합니다.

```bash
# 백엔드 폴더에서 실행
pm2 start ecosystem.config.js
# 또는: pm2 start dist/main.js --name salon-api

# 실행 확인
pm2 status
pm2 logs salon-api
```

## 5. 프론트엔드 빌드 (Build Frontend)
서버에서 프론트엔드 코드를 직접 빌드합니다.

```bash
# 프로젝트 루트로 이동
cd ~/salon-manager

# (중요) API 주소 환경변수 설정 후 빌드
export VITE_API_BASE_URL=/api
yarn build:frontend

# 생성된 폴더 확인
ls -l frontend/dist
```

## 6. Nginx 설정 (Web Server Config)
프론트엔드 정적 파일 서빙 및 백엔드 API 프록시를 설정합니다.

```bash
# 1. 설정 파일 생성
sudo nano /etc/nginx/sites-available/salon-manager

# 2. 내용 입력
server {
    listen 80;
    server_name _;  # 도메인이 있다면 입력

    # 프론트엔드 (frontend/dist 폴더 연결)
    location / {
        root /home/ubuntu/salon-manager/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시 (포트 3000)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 3. 설정 적용 및 재시작
sudo ln -s /etc/nginx/sites-available/salon-manager /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 7. 방화벽 설정 (Firewall)
외부 접속을 위해 HTTP 포트(80)를 허용합니다.

```bash
sudo ufw allow 80/tcp
# (Oracle Cloud 사용 시 iptables 설정 추가 필요)
```
