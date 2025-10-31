
import basicSetup from '../wallet-setup/basic.setup';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import { anvil2Address, anvil1Address, mockTokenAddress, oneAmount } from '../test-constants';

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test;


test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/BatchSend/);
});

test('should show airdropForm when connected, otherwise, not ', async({ page, context, metamaskPage, extensionId }) => {
  await page.goto('/');
  await expect(page.getByText('Please Connect')).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
  await page.getByTestId('rk-connect-button').click();
  await page.getByTestId('rk-wallet-option-metaMask').waitFor({ state: 'visible', timeout: 30000})
  await page.getByTestId('rk-wallet-option-metaMask').click();
  await metamask.connectToDapp();

   await page.getByRole("textbox", { name: "0x", exact: true }).waitFor({
     state: "visible",
     timeout: 60000,
   });
   await page
     .getByRole("textbox", { name: "0x", exact: true })
     .fill(mockTokenAddress);
   await page
     .getByRole("textbox", { name: "0x123..., 0x456..." })
     .fill(anvil2Address);
   await page.getByRole("textbox", { name: "200, 300..." }).fill(oneAmount);
   await expect(page.getByText("Token Name:Mock Token")).toBeVisible();

  await expect(page.getByText("Token Address ")).toBeVisible();
  
})
