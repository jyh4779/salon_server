module.exports = {
    apps: [
        {
            name: 'salon-api',
            script: 'dist/main.js', // NestJS 빌드 결과물
            instances: 1, // CPU 코어 수에 맞춰 'max'로 변경 가능
            autorestart: true, // 프로세스 다운 시 자동 재시작
            watch: false, // 프로덕션에서는 파일 감시 비활성화
            max_memory_restart: '1G', // 메모리 누수 방지 (1GB 초과 시 재시작)
            env: {
                NODE_ENV: 'production',
                // .env 파일의 변수는 서버 실행 전 로드되거나, 여기에 직접 명시 가능
                // 하지만 보안상 서버의 .env 파일을 읽도록 하는 것이 일반적임
            },
        },
    ],
};
