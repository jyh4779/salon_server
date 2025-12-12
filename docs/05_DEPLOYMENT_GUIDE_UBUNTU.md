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

## 7. 방화벽 설정 (Firewall)
서버 외부에서 포트 3000번에 접근할 수 있도록 방화벽을 열어주어야 합니다.

### Case A: UFW 사용 시 (일반적인 Ubuntu)
```bash
# 3000번 포트 허용
sudo ufw allow 3000/tcp

# 설정 확인
sudo ufw status
```

### Case B: iptables 사용 시 (Oracle Cloud 등)
Oracle Cloud의 Ubuntu 이미지는 기본적으로 iptables가 엄격하게 설정되어 있습니다.

```bash
# iptables 규칙 추가 (재부팅 시 초기화될 수 있음)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# 규칙 영구 저장 (netfilter-persistent 사용 시)
sudo netfilter-persistent save
```

### Case C: 클라우드 보안 그룹 (Security Group)
- AWS, Azure, Oracle Cloud 등을 사용하는 경우, **클라우드 콘솔 웹사이트**에서도 3000번 포트(Ingress Rule)를 열어주어야 합니다.


## 8. 프론트엔드 배포 (Nginx 설치 및 설정)
프론트엔드와 백엔드가 한 서버에 있다면, **Nginx**를 사용하여 프론트엔드 정적 파일을 제공하고 백엔드 API를 연결하는 것이 정석입니다.

### 8.1. Nginx 설치
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 8.2. 프론트엔드 빌드 및 업로드
로컬 개발 환경(Windows)에서 프론트엔드를 빌드하여 결과물을 만듭니다.

1. **로컬**에서 빌드 실행:
    ```bash
    # 프로젝트 루트에서 실행
    yarn build
    ```
2. 생성된 `dist` 폴더를 서버로 업로드:
    ```bash
    # (예시: SCP 사용 시)
    scp -r dist ubuntu@<SERVER_IP>:~/salon-manager/frontend-dist
    ```
    *또는 FTP(FileZilla 등)를 사용하여 `~/salon-manager/frontend-dist` 경로에 업로드하세요.*

### 8.3. Nginx 설정 파일 작성
기본 설정을 덮어쓰거나 새로운 설정 파일을 만듭니다.

```bash
# 1. 설정 파일 생성
sudo nano /etc/nginx/sites-available/salon-manager

# 2. 아래 내용 붙여넣기
server {
    listen 80;
    server_name _;  # 도메인이 있다면 도메인 입력 (예: example.com)

    # 1) 프론트엔드 (정적 파일)
    location / {
        root /home/ubuntu/salon-manager/frontend-dist;
        index index.html;
        try_files $uri $uri/ /index.html;  # React Router 새로고침 문제 해결
    }

    # 2) 백엔드 API (Reverse Proxy)
    # /api 로 시작하는 요청을 3000번 포트로 전달
    location /api/ {
        proxy_pass http://localhost:3000/; # 중요: 끝에 / 붙임
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*주의: `root` 경로는 실제 `frontend-dist` 폴더가 있는 절대 경로여야 합니다. (`pwd` 명령어로 확인)*

### 8.4. 설정 적용 및 방화벽 해제
```bash
# 1. 사이트 활성화 (심볼릭 링크)
sudo ln -s /etc/nginx/sites-available/salon-manager /etc/nginx/sites-enabled/

# 2. 기본 설정 비활성화 (충돌 방지)
sudo rm /etc/nginx/sites-enabled/default

# 3. 설정 문법 검사
sudo nginx -t

# 4. Nginx 재시작
sudo systemctl restart nginx

# 5. 방화벽 80번 포트(HTTP) 허용
sudo ufw allow 80/tcp
# Oracle Cloud 사용 시 iptables 규칙 추가 필요 (3000번과 동일한 방식)
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

이제 브라우저 주소창에 `http://<SERVER_IP>`를 입력하면 프론트엔드 화면이 나와야 합니다.
