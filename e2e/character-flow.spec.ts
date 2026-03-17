import { test, expect } from '@playwright/test';

test.describe('Character Foundry E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new character and see it on the dashboard', async ({ page }) => {
    // 0. Debug DOM
    const html = await page.content();
    console.log('DOM length:', html.length);
    if (html.includes('Create New Character')) {
      console.log('Button text found in HTML');
    } else {
      console.log('Button text NOT found in HTML');
      console.log('HTML snippet:', html.substring(0, 1000));
    }

    // 1. Click Create New Character (using multiple strategies to be safe)
    const createBtn = page.getByText('Create New Character').first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();

    // 2. Fill in basic details
    const charName = `Hero ${Date.now()}`;
    await page.locator('input[name="name"]').fill(charName);
    await page.locator('input[name="title"]').fill('The Brave');
    await page.locator('textarea[name="synopsis"]').fill('A legendary hero from a far away land.');

    // 3. Save character
    await page.getByRole('button', { name: /save character/i }).click();

    // 4. Verify on dashboard
    await expect(page.getByText(charName)).toBeVisible();
    await expect(page.getByText('The Brave')).toBeVisible();
  });

  test('should edit an existing character and preserve updates', async ({ page }) => {
    // 1. Create a character first
    const createBtn = page.getByText('Create New Character').first();
    await createBtn.click();
    
    const charName = `Edit Me ${Date.now()}`;
    await page.locator('input[name="name"]').fill(charName);
    await page.getByRole('button', { name: /save character/i }).click();

    // 2. Click the character card to edit
    await page.getByText(charName).click();

    // 3. Update the character
    await page.locator('input[name="title"]').fill('The Updated Title');
    await page.getByRole('button', { name: /save character/i }).click();

    // 4. Verify update on dashboard
    await expect(page.getByText(charName)).toBeVisible();
    await expect(page.getByText('The Updated Title')).toBeVisible();
  });

  test('should handle AI flesh out flow', async ({ page }) => {
    // 1. Start new character
    await page.getByText('Create New Character').first().click();
    
    // 2. Mock the AI response
    await page.route('**/api/gemini/generate', async route => {
      const json = {
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ 
                name: 'AI Generated Name', 
                title: 'The Synthesized',
                synopsis: 'Born from digital lightning.'
              }) }]
            }
          }
        ]
      };
      await route.fulfill({ json });
    });

    // 3. Click Flesh out with AI
    const aiBtn = page.getByText(/flesh out with ai/i);
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();

    // 4. Verify the fields were filled
    await expect(page.locator('input[name="name"]')).toHaveValue('AI Generated Name');
  });
});
