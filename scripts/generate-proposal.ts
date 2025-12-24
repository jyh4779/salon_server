
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

// 설정
const BASE_URL = 'http://168.107.15.242';
const CREDENTIALS = {
    email: 'owner@example.com',
    password: 'password123',
};
const VIEWPORT = { width: 1920, height: 1080 };
const OUTPUT_FILE = 'proposal.pdf';

async function main() {
    console.log('🚀 제안서용 PDF 생성 스크립트 시작');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    const pdfDoc = await PDFDocument.create();

    try {
        // 1. 로그인
        console.log(`🔐 로그인 시도: ${BASE_URL}/login`);
        await page.goto(`${BASE_URL}/login`);

        // Ant Design Form input selectors
        await page.fill('input[placeholder="이메일"]', CREDENTIALS.email);
        await page.fill('input[placeholder="비밀번호"]', CREDENTIALS.password);

        // 로그인 버튼 클릭
        await page.click('button[type="submit"]');

        // 로그인 후 리다이렉트 대기 (URL에 /shops/ 포함될 때까지)
        console.log('⏳ 로그인 완료 대기 중...');
        await page.waitForURL(/\/shops\/\d+/);

        const currentUrl = page.url();
        console.log(`✅ 로그인 성공! 현재 URL: ${currentUrl}`);

        // shopId 추출
        const shopIdMatch = currentUrl.match(/\/shops\/(\d+)/);
        if (!shopIdMatch) throw new Error('Shop ID를 찾을 수 없습니다.');
        const shopId = shopIdMatch[1];
        console.log(`🏷️ Shop ID: ${shopId}`);

        // 2. 캡처할 페이지 목록 정의
        const pagesToCapture = [
            { name: '스케줄 (메인)', path: `/shops/${shopId}/schedule` },
            { name: '고객 관리', path: `/shops/${shopId}/client` },
            { name: '일간 매출', path: `/shops/${shopId}/sales/daily` },
            { name: '주간 매출', path: `/shops/${shopId}/sales/weekly` },
            { name: '매장 설정', path: `/shops/${shopId}/settings` },
        ];

        // 3. 페이지 순회 및 캡처
        for (const item of pagesToCapture) {
            console.log(`📸 캡처 중: ${item.name} (${item.path})`);
            await page.goto(`${BASE_URL}${item.path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // 설정 페이지 특수 처리
            if (item.path.includes('/settings')) {
                console.log('🔒 설정 페이지 보안 확인 중...');

                // 패스워드 모달 대기 및 처리
                // PasswordConfirmModal.tsx: placeholder="비밀번호", okText="확인"
                try {
                    await page.waitForSelector('input[placeholder="비밀번호"]', { timeout: 5000 });
                    await page.fill('input[placeholder="비밀번호"]', CREDENTIALS.password);

                    // 모달의 "확인" 버튼 클릭 (AntD Modal footer button)
                    await page.click('.ant-modal-footer button.ant-btn-primary');

                    // 모달이 사라지고 탭이 나타날 때까지 대기
                    await page.waitForSelector('.ant-tabs-nav', { timeout: 5000 });
                    console.log('🔓 설정 페이지 권한 획득 완료');

                    // 탭 목록 순회 및 캡처
                    // SettingsPage.tsx items: 매장 운영, 디자이너 관리, 메뉴 카테고리, 시술 메뉴, 선불권 관리
                    const tabs = ['매장 운영', '디자이너 관리', '메뉴 카테고리', '시술 메뉴', '선불권 관리'];

                    for (const tabName of tabs) {
                        console.log(`📑 탭 캡처 중: ${tabName}`);

                        // 탭 클릭 (AntD Tabs selector)
                        await page.click(`.ant-tabs-tab:has-text("${tabName}")`);
                        await page.waitForTimeout(1000); // 탭 전환 대기

                        const screenshotBuffer = await page.screenshot({ fullPage: true });
                        await addImageToPdf(pdfDoc, screenshotBuffer);
                    }
                    continue; // 메인 캡처 루프 건너뛰기 (이미 탭별로 다 찍음)

                } catch (e) {
                    console.warn('⚠️ 설정 페이지 패스워드 처리에 실패했거나 이미 인증됨:', e);
                    // 실패해도 기본 스크린샷은 찍도록 진행
                }
            }

            const screenshotBuffer = await page.screenshot({ fullPage: true });
            await addImageToPdf(pdfDoc, screenshotBuffer);
        }

        // 4. PDF 저장
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(OUTPUT_FILE, pdfBytes);
        console.log(`🎉 PDF 생성 완료: ${path.resolve(OUTPUT_FILE)}`);

    } catch (error) {
        console.error('❌ 오류 발생:', error);
    } finally {
        await browser.close();
    }
}

// 헬퍼 함수: 이미지 PDF 추가
async function addImageToPdf(pdfDoc: PDFDocument, imageBuffer: Buffer) {
    const image = await pdfDoc.embedPng(imageBuffer);
    const pdfPage = pdfDoc.addPage([image.width, image.height]);
    pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
    });
}

main();
