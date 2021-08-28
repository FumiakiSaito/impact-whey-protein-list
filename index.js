const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.myprotein.jp/sports-nutrition/impact-whey-protein/10530943.html"
  );

  // フレーバー名の一覧
  /*
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
  */

  // フレーバーのオプション値リストを取得
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
  //console.log(valueList);

  for (let value of valueList) {
    let detail = {
      fravarText: null,
      capacityText: null,
      priceText: null,
    };

    // フレーバー選択
    await page.select("#athena-product-variation-dropdown-5", value);
    await page.waitForTimeout(1000);

    // 容量は250g, 1kg, 2.5kg, 5kgで最大4つのボタンがある。
    // 在庫がない場合はボタン自体存在しないため、
    // 存在チェックを行い存在したらボタンをクリックする
    for (let i = 1; i <= 4; i++) {
      // 容量ボタンのセレクタ
      const capacitySelector =
        "#mainContent > div.athenaProductPage_topRow > div.athenaProductPage_lastColumn > div > div.athenaProductPage_productVariations > div > div > div:nth-child(2) > div > div > ul > li:nth-child(" +
        i +
        ") > button";

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
          .replace(/選択した/g, "");

        //await page.screenshot({ path: "screenshot/" + value + ".png" });

        // フレーバー名取得 (ex. ソルティッドキャラメル)
        const fravarText = await page.evaluate(() => {
          const fravar = document.querySelector(
            "#athena-product-variation-dropdown-5"
          );
          const fravarText = fravar.options[fravar.selectedIndex].text;
          return fravarText;
        });
        detail.fravarText = fravarText;

        // 価格取得 (ex. ¥7,390)
        const priceText = await page.evaluate(() => {
          const price = document.querySelector("p.productPrice_price");
          const priceText = price.innerText;
          return priceText;
        });
        detail.priceText = priceText;
        console.log(detail);
      }
    }
  }
  await browser.close();
})();
