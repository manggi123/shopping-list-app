const { chromium } = require('playwright');
const path = require('path');

async function testShoppingList() {
    console.log('🚀 쇼핑 리스트 앱 테스트 시작...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // HTML 파일 경로
        const filePath = path.join(__dirname, 'shopping-list.html');
        const fileUrl = `file://${filePath}`;

        console.log('✓ 브라우저 실행');
        console.log(`✓ 페이지 로드: ${fileUrl}\n`);

        // 페이지 로드
        await page.goto(fileUrl);
        await page.waitForTimeout(500);

        // ===== 테스트 1: 초기 상태 확인 =====
        console.log('📝 테스트 1: 초기 상태 확인');

        const totalCount = await page.textContent('#totalCount');
        const checkedCount = await page.textContent('#checkedCount');
        const remainingCount = await page.textContent('#remainingCount');

        console.log(`  전체: ${totalCount}, 완료: ${checkedCount}, 남은 항목: ${remainingCount}`);

        if (totalCount === '0' && checkedCount === '0' && remainingCount === '0') {
            console.log('  ✅ 초기 상태 정상\n');
        } else {
            console.log('  ❌ 초기 상태 오류\n');
        }

        // ===== 테스트 2: 아이템 추가 =====
        console.log('📝 테스트 2: 아이템 추가');

        const testItems = ['사과', '바나나', '우유', '빵'];

        for (const item of testItems) {
            await page.fill('#itemInput', item);
            await page.click('#addButton');
            await page.waitForTimeout(300);
            console.log(`  + "${item}" 추가`);
        }

        const totalAfterAdd = await page.textContent('#totalCount');
        console.log(`  전체 항목: ${totalAfterAdd}`);

        if (totalAfterAdd === String(testItems.length)) {
            console.log('  ✅ 아이템 추가 성공\n');
        } else {
            console.log('  ❌ 아이템 추가 실패\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 3: 아이템 체크 =====
        console.log('📝 테스트 3: 아이템 체크/언체크');

        // 첫 번째 아이템 체크
        await page.click('.list-item:nth-child(1) .checkbox');
        console.log('  ✓ "사과" 체크');
        await page.waitForTimeout(500);

        // 세 번째 아이템 체크
        await page.click('.list-item:nth-child(3) .checkbox');
        console.log('  ✓ "우유" 체크');
        await page.waitForTimeout(500);

        const checkedAfter = await page.textContent('#checkedCount');
        const remainingAfter = await page.textContent('#remainingCount');

        console.log(`  완료: ${checkedAfter}, 남은 항목: ${remainingAfter}`);

        if (checkedAfter === '2' && remainingAfter === '2') {
            console.log('  ✅ 체크 기능 정상\n');
        } else {
            console.log('  ❌ 체크 기능 오류\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 4: 체크된 아이템 스타일 확인 =====
        console.log('📝 테스트 4: 체크된 아이템 시각적 확인');

        const firstItem = await page.$('.list-item.checked');
        if (firstItem) {
            const hasCheckedClass = await firstItem.evaluate(el => el.classList.contains('checked'));
            const textElement = await firstItem.$('.item-text');
            const textDecoration = await textElement.evaluate(el =>
                window.getComputedStyle(el).textDecoration
            );

            console.log(`  체크된 항목 클래스: ${hasCheckedClass ? '있음' : '없음'}`);
            console.log(`  취소선 스타일: ${textDecoration.includes('line-through') ? '적용됨' : '미적용'}`);

            if (hasCheckedClass && textDecoration.includes('line-through')) {
                console.log('  ✅ 체크된 아이템 스타일 정상\n');
            } else {
                console.log('  ❌ 체크된 아이템 스타일 오류\n');
            }
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 5: 언체크 =====
        console.log('📝 테스트 5: 아이템 언체크');

        await page.click('.list-item:nth-child(1) .checkbox');
        console.log('  ✓ "사과" 언체크');
        await page.waitForTimeout(500);

        const checkedAfterUncheck = await page.textContent('#checkedCount');
        console.log(`  완료: ${checkedAfterUncheck}`);

        if (checkedAfterUncheck === '1') {
            console.log('  ✅ 언체크 기능 정상\n');
        } else {
            console.log('  ❌ 언체크 기능 오류\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 6: 개별 아이템 삭제 =====
        console.log('📝 테스트 6: 개별 아이템 삭제');

        await page.click('.list-item:nth-child(1) .delete-button');
        console.log('  ✓ 첫 번째 아이템 삭제');
        await page.waitForTimeout(500);

        const totalAfterDelete = await page.textContent('#totalCount');
        console.log(`  전체 항목: ${totalAfterDelete}`);

        if (totalAfterDelete === '3') {
            console.log('  ✅ 아이템 삭제 성공\n');
        } else {
            console.log('  ❌ 아이템 삭제 실패\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 7: Enter 키로 아이템 추가 =====
        console.log('📝 테스트 7: Enter 키로 아이템 추가');

        await page.fill('#itemInput', '계란');
        await page.press('#itemInput', 'Enter');
        await page.waitForTimeout(500);

        const totalAfterEnter = await page.textContent('#totalCount');
        console.log(`  + "계란" 추가 (Enter 키)`);
        console.log(`  전체 항목: ${totalAfterEnter}`);

        if (totalAfterEnter === '4') {
            console.log('  ✅ Enter 키 입력 정상\n');
        } else {
            console.log('  ❌ Enter 키 입력 오류\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 8: 빈 입력 처리 =====
        console.log('📝 테스트 8: 빈 입력 처리');

        await page.fill('#itemInput', '   ');
        await page.click('#addButton');
        await page.waitForTimeout(500);

        const totalAfterEmpty = await page.textContent('#totalCount');
        console.log(`  빈 문자열 입력 시도`);
        console.log(`  전체 항목: ${totalAfterEmpty}`);

        if (totalAfterEmpty === '4') {
            console.log('  ✅ 빈 입력 방어 정상\n');
        } else {
            console.log('  ❌ 빈 입력 방어 실패\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 9: 로컬 스토리지 확인 =====
        console.log('📝 테스트 9: 로컬 스토리지 저장 확인');

        const localStorageData = await page.evaluate(() => {
            return localStorage.getItem('shoppingList');
        });

        if (localStorageData) {
            const items = JSON.parse(localStorageData);
            console.log(`  로컬 스토리지에 ${items.length}개 항목 저장됨`);
            console.log('  ✅ 로컬 스토리지 저장 정상\n');
        } else {
            console.log('  ❌ 로컬 스토리지 저장 실패\n');
        }

        await page.waitForTimeout(1000);

        // ===== 테스트 10: 전체 삭제 =====
        console.log('📝 테스트 10: 전체 삭제');

        // 확인 대화상자 자동 승인
        page.on('dialog', async dialog => {
            console.log(`  확인 대화상자: "${dialog.message()}"`);
            await dialog.accept();
        });

        const isDisabled = await page.isDisabled('#clearAll');

        if (!isDisabled) {
            await page.click('#clearAll');
            await page.waitForTimeout(500);

            const totalAfterClear = await page.textContent('#totalCount');
            console.log(`  전체 항목: ${totalAfterClear}`);

            const emptyState = await page.$('.empty-state');

            if (totalAfterClear === '0' && emptyState) {
                console.log('  ✅ 전체 삭제 성공\n');
            } else {
                console.log('  ❌ 전체 삭제 실패\n');
            }
        }

        await page.waitForTimeout(2000);

        // ===== 테스트 완료 =====
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 모든 테스트 완료!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 스크린샷 저장
        await page.screenshot({
            path: 'test-result-screenshot.png',
            fullPage: true
        });
        console.log('📸 스크린샷 저장: test-result-screenshot.png\n');

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
        console.log('✓ 브라우저 종료\n');
    }
}

// 테스트 실행
testShoppingList().catch(console.error);
