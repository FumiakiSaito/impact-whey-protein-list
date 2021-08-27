const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.myprotein.jp/sports-nutrition/impact-whey-protein/10530943.html"
  );

  // フレーバー一覧
  const fravarList = await page.evaluate(() => {
    const dropdown = document.getElementById(
      "athena-product-variation-dropdown-5"
    );
    const datalist = [];
    for (let i = 0; i < dropdown.options.length; i++) {
      datalist.push(dropdown.options[i].text);
    }
    return datalist;
  });
  console.log(fravarList);

  // 値一覧
  const valueList = await page.evaluate(() => {
    const dropdown = document.getElementById(
      "athena-product-variation-dropdown-5"
    );
    const datalist = [];
    for (let i = 0; i < dropdown.options.length; i++) {
      datalist.push(dropdown.options[i].value);
    }
    return datalist;
  });
  console.log(valueList);

  for (let value of valueList) {
    // フレーバードロップダウン選択
    await page.select("#athena-product-variation-dropdown-5", value);

    await page.waitForTimeout(1000);

    // 容量ボタンクリック
    await page.click(
      "#mainContent > div.athenaProductPage_topRow > div.athenaProductPage_lastColumn > div > div.athenaProductPage_productVariations > div > div > div:nth-child(2) > div > div > ul > li:nth-child(1) > button"
    );

    //await page.screenshot({ path: "screenshot/" + value + ".png" });

    const price = await page.evaluate(() => {
      // フレーバー名取得
      const fravar = document.querySelector(
        "#athena-product-variation-dropdown-5"
      );
      const fravarText = fravar.options[fravar.selectedIndex].text;

      // 容量テキスト取得
      const button1 = document.querySelector(
        "#mainContent > div.athenaProductPage_topRow > div.athenaProductPage_lastColumn > div > div.athenaProductPage_productVariations > div > div > div:nth-child(2) > div > div > ul > li:nth-child(1) > button"
      );
      const capacityText = button1.innerText
        .replace(/\r?\n/g, "")
        .replace(/選択した/g, "");

      // 値段取得
      const price = document.querySelector("p.productPrice_price");
      const priceText = price.innerText;

      return fravarText + "," + capacityText + "," + priceText;
    });
    console.log(price);
  }

  await browser.close();
})();
