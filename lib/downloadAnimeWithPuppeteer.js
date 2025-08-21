const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function downloadAnimeMp4(url, filePath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    Referer: 'https://kwik.cx/'
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  const buffer = await page.evaluate(async () => {
    const res = await fetch(window.location.href);
    return await res.arrayBuffer();
  });

  fs.writeFileSync(filePath, Buffer.from(buffer));
  await browser.close();
  return filePath;
}

module.exports = downloadAnimeMp4;
