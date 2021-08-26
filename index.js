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
      datalist.push(dropdown.options[i].innerText);
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

  // ドロップダウンを変更してまわる
  for (let value of valueList) {
    await page.select("#athena-product-variation-dropdown-5", value);
    //await page.waitForTimeout(1000);
    const price = await page.evaluate(() => {
      const price = document.querySelector("p.productPrice_price");
      return price.innerText;
    });
    console.log(price);
  }

  // TODO: 容量変更

  //await page.click(
  //  "#mainContent > div.athenaProductPage_topRow > div.athenaProductPage_lastColumn > div > div.athenaProductPage_productVariations > div > div > div:nth-child(2) > div > div > ul > li:nth-child(1) > button"
  //);
  //await page.screenshot({ path: "test.png" });

  await browser.close();
})();
