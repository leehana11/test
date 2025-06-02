// 로그인하여 WID 추출
const { test } = require('@playwright/test');

const ID = 'dlgksk0910@gmail.com';
const PW = '!!test2025';

test('WID 추출 확인', async ({ page }) => {
  let wid = null;

  // WID추출 가능한 request url 
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/wevweb/users/v1.0/users/me')) {
      try {
        const json = await response.json();
        wid = json?.data?.wid || json?.wid || json?.data?.id || null;

      } catch (e) {
        console.log('응답 파싱 실패:', e);
      }
    }
  });

  await page.goto('https://weverse.io/?hl=ko');
  await page.waitForTimeout(3000);

  // 로그인 Step
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.fill('input[name="userEmail"]', ID);
  await page.getByRole('button', { name: '이메일로 계속하기' }).click();
  await page.fill('input[name="password"]', PW);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForTimeout(5000);

  // 자동화 실행 시, 비정상적 감지로 인해 인증이 필요하나, 인증과정 스킵가능한 것으로 확인하여 인증번호 수기 입력해주었음
  
  // 마이페이지 진입
  await page.getByRole('button', { name: 'global more' }).click();
  await page.waitForTimeout(3000); // WID 응답 기다림

  // 결과 출력
  console.log('\n V 계정 요약');
  console.table([
    {
      ID: ID,
      PW: PW,
      WID: wid || 'WID 추출 실패',
    },
  ]);
});
