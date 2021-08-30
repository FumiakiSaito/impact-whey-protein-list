const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    //slowMo: 1000,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    timeout: 10000,
    args: ["--incognito"],
  });
  const page = await browser.newPage();
  await page.goto(
    // WPC
    "https://www.myprotein.jp/sports-nutrition/impact-whey-protein/10530943.html"
    // WPI
    //"https://www.myprotein.jp/sports-nutrition/impact-whey-isolate/10530911.html"
  );

  // フレーバーのオプション値リストを取得
  const valueList = await page.evaluate(() => {
    const dropdown = document.getElementById(
      "athena-product-variation-dropdown-5"
    );
    const valueList = [];
    for (let i = 0; i < dropdown.options.length; i++) {
      valueList.push(dropdown.options[i].value);
    }
    return valueList;
  });

  for (let value of valueList) {
    let detail = {
      fravorText: null,
      capacityText: null,
      priceText: null,
    };

    // フレーバー選択
    await page.select("#athena-product-variation-dropdown-5", value);
    await page.waitForTimeout(1000);

    /**
     * 容量は250g, 1kg, 2.5kg, 5kgで最大4つのボタンがある
     * 在庫がない場合はボタン自体存在しないため、存在チェックを行い存在したらボタンをクリックする
     */
    for (let i = 1; i <= 4; i++) {
      // 容量ボタンのセレクタ
      const capacitySelector = `#mainContent > div.athenaProductPage_topRow > div.athenaProductPage_lastColumn > div > div.athenaProductPage_productVariations > div > div > div:nth-child(2) > div > div > ul > li:nth-child(${i}) > button`;

      // 容量ボタンの存在チェック
      const existsCapacity = await page
        .$(capacitySelector)
        .then((res) => !!res);
      if (existsCapacity) {
        // 容量ボタンクリック
        await page.click(capacitySelector);
        await page.waitForTimeout(1000);

        // 容量テキスト取得 (ex. 5 kg)
        const capacityText = await page.$eval(
          capacitySelector,
          (el) => el.textContent
        );
        detail.capacityText = capacityText
          .replace(/\r?\n/g, "")
          .replace(/ /g, "")
          .replace(/選択した/g, "");

        //await page.screenshot({ path: "screenshot/" + value + ".png" });

        // フレーバー名取得 (ex. ソルティッドキャラメル)
        const fravorText = await page.evaluate(() => {
          const fravor = document.querySelector(
            "#athena-product-variation-dropdown-5"
          );
          const fravorText = fravor.options[fravor.selectedIndex].text;
          return fravorText;
        });
        detail.fravorText = fravorText;

        // 価格取得 (ex. ¥7,390)
        const priceText = await page.evaluate(() => {
          const price = document.querySelector("p.productPrice_price");
          const priceText = price.innerText;
          return priceText;
        });
        detail.priceText = priceText.replace(/\r?\n/g, "");

        console.log(
          `${detail.fravorText},${detail.capacityText},${detail.priceText}`
        );
      }
    }
  }
  await browser.close();
})();
