const fs = require('fs');
const readline = require('readline');
const puppeteer = require('puppeteer');
const delay = require('delay');

async function processLineByLine() {
  const fileStream = fs.createReadStream('hotmail.txt');
  var logger = fs.createWriteStream('outputMail.txt', 
  {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  const rl = readline.createInterface
  ({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) 
  {



    // Each line in input.txt will be successively available here as `line`.
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1645258024&rver=7.0.6737.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26RpsCsrfState%3da357fa34-30cc-aef5-ab33-212dc8b9bf1b&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015');
    await page.waitForTimeout(800)
    await page.waitForSelector('input[name="loginfmt"]');
    await page.type('input[name="loginfmt"]', line);
    await page.waitForTimeout(100)
    await page.click('input[type="submit"]');
    // Add a wait for some selector on the home page to load to ensure the next step works correctly
    await page.waitForTimeout(1300)
    const text = await page.evaluate(function getUrls() 
    {
    return Array.from(document.querySelectorAll('div[data-bind="text: title"]').values()).
      map(el => el.innerHTML);
    });
    if(text==""||text==null)
    {
      await logger.write(line+'\n')
    }else
    {
      console.log(line+" : Invalide");
    }
    await browser.close()
  }

}

processLineByLine();