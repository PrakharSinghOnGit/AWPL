const browser = require("chromium");
const POWER = require("child_process");
const FILE_SYSTEM = require("fs");

const files = FILE_SYSTEM.readdirSync("./html");
files.forEach((file) => {
  console.log("./html/" + file);
  POWER.execFileSync(browser.path, [
    "--headless",
    "--disable-gpu",
    `--print-to-pdf=${__dirname}/out/${file.replace(".html", "")}.pdf`,
    "--no-margins",
    `${__dirname}/html/${file}`,
  ]);
});
