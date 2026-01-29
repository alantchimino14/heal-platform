const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5173';
const PROFESIONAL_ID = 'cmkqz2hkx000055b8bram4vv8'; // Carlos Muñoz

async function waitForContentLoaded(page, timeout = 5000) {
  // Wait for skeletons to disappear
  try {
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
      return skeletons.length === 0;
    }, { timeout });
  } catch (e) {
    // If timeout, continue anyway
  }
  // Extra wait for render
  await page.waitForTimeout(1000);
}

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });

  // Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();

  // Mobile context (iPhone 12 Pro)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();

  try {
    console.log('📸 Capturando screenshots de Heal Platform...\n');

    // 1. Dashboard Admin
    console.log('1. Dashboard Admin...');
    await desktopPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(desktopPage, 8000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-dashboard-admin.png'),
      fullPage: false
    });
    console.log('   ✓ 01-dashboard-admin.png');

    // 2. Lista de Profesionales
    console.log('2. Lista de Profesionales...');
    await desktopPage.goto(`${BASE_URL}/profesionales`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(desktopPage, 8000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-profesionales-lista.png'),
      fullPage: false
    });
    console.log('   ✓ 02-profesionales-lista.png');

    // 3. Detalle Profesional - Tab Info
    console.log('3. Detalle Profesional - Info...');
    await desktopPage.goto(`${BASE_URL}/profesionales/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(desktopPage, 5000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-profesional-detalle-info.png'),
      fullPage: false
    });
    console.log('   ✓ 03-profesional-detalle-info.png');

    // 4. Detalle Profesional - Tab Contrato
    console.log('4. Detalle Profesional - Contrato...');
    const contratoTab = await desktopPage.$('button:has-text("Contrato")');
    if (contratoTab) {
      await contratoTab.click();
      await waitForContentLoaded(desktopPage, 3000);
    }
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-profesional-detalle-contrato.png'),
      fullPage: false
    });
    console.log('   ✓ 04-profesional-detalle-contrato.png');

    // 5. Detalle Profesional - Tab Metas
    console.log('5. Detalle Profesional - Metas...');
    const metasTab = await desktopPage.$('button:has-text("Metas")');
    if (metasTab) {
      await metasTab.click();
      await waitForContentLoaded(desktopPage, 3000);
    }
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-profesional-detalle-metas.png'),
      fullPage: false
    });
    console.log('   ✓ 05-profesional-detalle-metas.png');

    // 6. Detalle Profesional - Tab Liquidaciones
    console.log('6. Detalle Profesional - Liquidaciones...');
    const liqTab = await desktopPage.$('button:has-text("Liquidaciones")');
    if (liqTab) {
      await liqTab.click();
      await waitForContentLoaded(desktopPage, 3000);
    }
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-profesional-detalle-liquidaciones.png'),
      fullPage: false
    });
    console.log('   ✓ 06-profesional-detalle-liquidaciones.png');

    // ========== PORTAL DEL PROFESIONAL (Mobile) ==========

    // 7. Portal Home
    console.log('7. Portal Profesional - Home (mobile)...');
    await mobilePage.goto(`${BASE_URL}/portal/${PROFESIONAL_ID}`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(mobilePage, 5000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07-portal-home-mobile.png'),
      fullPage: false
    });
    console.log('   ✓ 07-portal-home-mobile.png');

    // 8. Portal Agenda
    console.log('8. Portal Profesional - Agenda (mobile)...');
    await mobilePage.goto(`${BASE_URL}/portal/${PROFESIONAL_ID}/agenda`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(mobilePage, 5000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08-portal-agenda-mobile.png'),
      fullPage: false
    });
    console.log('   ✓ 08-portal-agenda-mobile.png');

    // 9. Portal Métricas
    console.log('9. Portal Profesional - Métricas (mobile)...');
    await mobilePage.goto(`${BASE_URL}/portal/${PROFESIONAL_ID}/metricas`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(mobilePage, 5000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09-portal-metricas-mobile.png'),
      fullPage: false
    });
    console.log('   ✓ 09-portal-metricas-mobile.png');

    // 10. Portal Liquidaciones
    console.log('10. Portal Profesional - Liquidaciones (mobile)...');
    await mobilePage.goto(`${BASE_URL}/portal/${PROFESIONAL_ID}/liquidaciones`, { waitUntil: 'networkidle' });
    await waitForContentLoaded(mobilePage, 5000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10-portal-liquidaciones-mobile.png'),
      fullPage: false
    });
    console.log('   ✓ 10-portal-liquidaciones-mobile.png');

    console.log('\n✅ Todas las capturas completadas!');
    console.log(`📁 Guardadas en: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

takeScreenshots();
