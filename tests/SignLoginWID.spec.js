const { test } = require('@playwright/test');

const PW = '!!test2025';
const base_ID = 'lhntest000'; // 이메일 아이디
const domain = '@gmail.com';
const RUN_COUNT = 2; // 반복 횟수

test('회원가입 후 로그인하여 WID 추출', async ({ page }) => {
  const results = [];

  for (let i = 1; i <= RUN_COUNT; i++) {
    const email = `${base_ID}${i}${domain}`;
    let wid = null;

    console.log(`\n▶ [${i}] 회원가입 진행 중 - ID: ${email}`);

    try {
      // WID 추출
      await page.route('**/wevweb/users/v1.0/users/me**', async (route, request) => {
        const response = await route.fetch();
        const body = await response.json();
        wid = body?.data?.wid || body?.wid || body?.data?.id || null;
        await route.fulfill({ response });
      });

      await page.goto('https://weverse.io/?hl=ko'); // 위버스 진입
      await page.waitForTimeout(3000);

      // 회원가입 Flow
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.fill('input[name="userEmail"]', email); // 이메일 입력
      await page.getByRole('button', { name: '이메일로 계속하기' }).click();
      await page.getByRole('button', { name: '가입하기' }).click();
      await page.waitForLoadState('load');

      await page.fill('input[name="newPassword"]', PW); // 새 비밀번호 입력
      await page.fill('input[name="confirmPassword"]', PW); // 컨펌 비밀번호 입력
      await page.getByRole('button', { name: '다음' }).click();
      await page.waitForLoadState('load');

      await page.getByRole('button', { name: '다음' }).click(); // 닉네임은 자동 입력으로 진행
      await page.waitForLoadState('load');

      await page.getByLabel('모두 동의 합니다.').check(); // 약관동의
      await page.getByRole('button', { name: '다음' }).click();

      const confirmButton = page.getByRole('button', { name: '확인' }); // 광고선택
      await confirmButton.waitFor({ state: 'visible' });
      await confirmButton.click();

      await page.waitForTimeout(3000);

      // 이메일 인증 스킵 → 메인으로 이동
      await page.goto('https://weverse.io/?hl=ko');

      // 로그인
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.fill('input[name="userEmail"]', email);
      await page.getByRole('button', { name: '이메일로 계속하기' }).click();
      await page.fill('input[name="password"]', PW);
      await page.getByRole('button', { name: '로그인' }).click();

      await page.waitForTimeout(4000);
      await page.getByRole('button', { name: 'global more' }).click();
      await page.waitForTimeout(2000);

      results.push({
        email,
        password: PW,
        wid: wid || 'WID 추출 실패'
      });

      // 다음 턴에도 실행되기 위해
      await page.unroute('**/wevweb/users/v1.0/users/me**');

    } catch (err) {
      console.log(`[${i}] 에러 발생 - ${email}`);
      results.push({
        email,
        password: PW,
        wid: '회원가입 또는 로그인 실패'
      });
    }
  }

  // 결과 출력
  console.log('\n V 생성된 계정 요약');
  console.table(results);
});
