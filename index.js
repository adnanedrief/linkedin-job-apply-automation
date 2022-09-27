const puppeteer = require("puppeteer");
const data = require("./config.json");
const BaseURL = data.baseURL;
const email = data.email;
const password = data.password;
const keyword = data.keyword;
const location = data.location;
var avgOfExp = data.AvgExperience;
const periodOfTime = data.Period; // you can choose : Last 24 hours or Last week
const browserPath = data.ChromePath;
const resolution = data.resolution; // you can choose : --start-maximized or --window-size=1400,720
const numberOfPagination = data.numberOfPagination; // numberOfPagination it means number of execution
const nbrOfOffersPerPage = data.numberOfOffersPerPage; // don't touch it leave it like this !!
let page = "";
let browser = "";
async function logs() {
  console.log("mydata is :" + JSON.stringify(data));
}
async function Login() {
  await findTargetAndType('[name="session_key"]', email);
  await findTargetAndType('[name="session_password"]', password);
  page.keyboard.press("Enter");
}
async function initiliazer() {
  browser = await puppeteer.launch({
    headless: false,
    executablePath: browserPath,
    args: [resolution],
    defaultViewport: null,
    //userDataDir: "./userData",
    //uncomment userDataDir line  if you want to store your session and remove login() from main()
    // and change the baseURL to https://www.linkedin.com/feed
  });
  page = await browser.newPage();
  const pages = await browser.pages();
  if (pages.length > 1) {
    await pages[0].close();
  }
  await page.goto(BaseURL);
}
async function findTargetAndType(target, value) {
  const f = await page.$(target);
  await f.type(value);
}
async function waitForSelectorAndType(target, value) {
  const typer = await page.waitForSelector(target, { visible: true });
  await typer.type(value);
}
async function buttonClick(selector) {
  await page.waitForSelector(selector);
  const buttonClick = await page.$(selector);
  await buttonClick.click();
}
async function jobCriteriaByTime() {
  await buttonClick(".search-reusables__filter-binary-toggle"); // select EASY APPLY
  await page.waitForTimeout(2000);
  // dropmenu to chose the period
  await buttonClick(
    "ul.search-reusables__filter-list>li:nth-child(4)>div>span>button"
  );
  if (periodOfTime == "Past 24 hours") {
    await page.waitForTimeout(2000);
    await buttonClick(
      "form > fieldset > div.pl4.pr6 > ul > li:nth-child(4) > label"
    );
    await page.waitForTimeout(2000);
    await buttonClick(".render-mode-BIGPIPE");
  } else {
    // Past week
    await page.waitForTimeout(2000);
    await buttonClick(
      "form > fieldset > div.pl4.pr6 > ul > li:nth-child(3) > label"
    );
    await page.waitForTimeout(2000);
    await buttonClick(".render-mode-BIGPIPE");
  }
}
async function jobCriteriaByType() {
  // dropmenu to chose the Hyprid/onSite/Remote type of Work
  await buttonClick(
    'div[id="hoverable-outlet-on-site/remote-filter-value"]+span>button'
  );
  await page.waitForTimeout(2000);
  await buttonClick("label[for^='workplaceType']");
  await page.waitForTimeout(2000);
  await buttonClick(".render-mode-BIGPIPE");
  await page.waitForTimeout(2000);
}
async function Scrolling() {
  await page.evaluate(() => {
    document
      .querySelector(
        'div[class="scaffold-layout__list-detail-inner"]>section>div>ul'
      )
      .scrollIntoView();
  });
}
function changeValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;
  nativeInputValueSetter.call(input, value);
  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}
async function FillAndApply() {
  let i = 1;
  let lastIndexForPagination = 1;
  while (i <= numberOfPagination) {
    console.log("Scrolling the page N°" + i);
    //Loop trough list elements
    for (let index = 1; index <= nbrOfOffersPerPage; index++) {
      let state = true;
      await page.waitForTimeout(3000);
      await Scrolling();
      console.log(`Apply N°[${index}]`);
      await buttonClick(
        `li[class*="jobs-search-results__list-item"]:nth-child(${index})>div>div>div>div+div>div`
      );
      if (index === nbrOfOffersPerPage) lastIndexForPagination++;
      /* -------------------------- FIX THIS PART OF CODE ----------------------- */
      await page.waitForTimeout(2000);
      if ((await page.$("div:nth-child(4) > div > div > div>button")) != null) {
        // to find the EASY APPLY button
        await buttonClick("div:nth-child(4) > div > div > div>button");
        while (state == true) {
          await page.waitForTimeout(2000);
          if (
            // the next button
            await page.evaluate(() => {
              setTimeout(() => {}, 3000);
              document
                .querySelector(
                  'div[class="display-flex justify-flex-end ph5 pv4"]>button'
                )
                .click();
            })
          ) {
            state = true;
          } else {
            state = false;
            break;
          }
          await page.waitForTimeout(3000);
        }
        if (state == false) {
          // review button and submit button
          await page.waitForTimeout(3000);
          await buttonClick(
            'div[class="display-flex justify-flex-end ph5 pv4"]>button + button'
          );
          await page.waitForTimeout(3000);
          /* -------------------------------------------------------------------------- */
          /*                              find empty inputs                             */
          if (
            (await page.$(
              'input[class="ember-text-field ember-view fb-single-line-text__input"]'
            )) != null
          ) {
            await page.evaluate(() => {
              const divElem = document.querySelector("div.pb4");
              const inputElements = divElem.querySelectorAll("input");
              console.log(inputElements);
              let value = 3;
              var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              ).set;
              for (let index = 0; index < inputElements.length; index++) {
                setTimeout(() => {}, 2000);
                nativeInputValueSetter.call(inputElements[index], value);
                var inputEvent = new Event("input", { bubbles: true });
                inputElements[index].dispatchEvent(inputEvent);
              }
            });
          }
          /* -------------------------------------------------------------------------- */
          let i = 0;
          do {
            await page.waitForTimeout(4000);
            if (
              !(await page.$(
                'div[class*="artdeco-modal-overlay"]>div>div+div+div>button>span'
              ))
            ) {
              i++;
              console.log(i);
              await page.evaluate(() => {
                setTimeout(() => {}, 3000);
                document
                  .querySelector(
                    'div[class="display-flex justify-flex-end ph5 pv4"]>button + button'
                  )
                  .click();
              });
            } else i=-2;
          } while (i>=0);
          console.log("finally close button");
          await page.waitForTimeout(4000);
          await page.evaluate(() => {
            setTimeout(() => {}, 3000);
            document
              .querySelector(
                'div[class*="artdeco-modal-overlay"]>div>div+div+div>button>span'
              )
              .click();
          });
        }
      }
      /* ------------------------------------------------------------ */
    }
    // To click on the next page
    await buttonClick(
      `ul[class="artdeco-pagination__pages artdeco-pagination__pages--number"]>li:nth-child(${lastIndexForPagination})`
    );
    i++;
    console.log("finished Scrolling page N°" + (i - 1));
  }
}
async function jobsApply() {
  await buttonClick("#global-nav > div > nav > ul > li:nth-child(3)");
  await waitForSelectorAndType('[id^="jobs-search-box-keyword-id"]', keyword);
  await waitForSelectorAndType('[id^="jobs-search-box-location-id"]', location);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await jobCriteriaByTime();
  await page.waitForTimeout(3000);
  await jobCriteriaByType();
  await page.waitForTimeout(2000);
  // to hide messages dialog
  await page.waitForTimeout(2000);
  await FillAndApply();
}
async function main() {
  logs();
  await initiliazer();
   await Login();
  await jobsApply();
  await browser.close();
}
main();
