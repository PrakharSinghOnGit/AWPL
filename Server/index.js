// importing modules
const PATH = require("path");
const axios = require("axios");
const COLORS = require("colors");
const FILE_SYSTEM = require("fs");
const { log } = require("console");
const browser = require("chromium");
const MINER = require("./miner.js");
const Spinnies = require("spinnies");
const csvtojson = require("csvtojson");
const POWER = require("child_process");
const LEVELMINER = require("./level.js");
const { SortData } = require("./functions/SortData.js");
const { MakeHtml } = require("./functions/MakeHtml.js");

// assigning constants
const Load = new Spinnies({
  succeedPrefix: "✔",
});
// Preload

(async () => {
  // loop for every Selected team
  for (let i = 0; i < Teams.length; i++) {
    // Fetch Their Teams Data
    const url = Setting.Links[Teams[i]];
    const csv = await axios.get(url);
    const Data = await csvtojson().fromString(csv.data);

    // loging Progress
    await LEVELMINER(Data, Teams[i]); // actual Data Fetch
    //HandleData(MinedData, Teams[i].replaceAll(" ", "_"), Func); // Writing Data to file

    // Writing Data to file
  }
  TERMINATOR();
  log(COLORS.green.bold("PROCESS COMPLETED"));
  const files = FILE_SYSTEM.readdirSync("./html");
  files.forEach((file) => {
    POWER.execFileSync(browser.path, [
      "--headless",
      "--disable-gpu",
      `--print-to-pdf=${__dirname}/out/${file.replace(".html", "")}.pdf`,
      "--no-margins",
      `${__dirname}/html/${file}`,
    ]);
  });
  // POWER.execSync("open " + PATH.join(__dirname, "/out"));
  log("Open ->", COLORS.magenta(PATH.join(__dirname, "/out")));
  TERMINATOR();
})();

async function HandleData(Data, Team) {
  // creating file name
  console.log(Data);
  let FileName = Team + "_Level_Data";
  let SortedLevelData = await SortData(Data);
  let levelHtml = await MakeHtml(SortedLevelData, "SP", FileName);
  FILE_SYSTEM.writeFileSync("./html/" + FileName + ".html", levelHtml);
}
