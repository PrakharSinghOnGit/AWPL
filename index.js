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
const CLI_WIDTH = require("cli-width");
const POWER = require("child_process");
const { MultiSelect } = require("enquirer");

// assigning constants
const Load = new Spinnies({
  succeedPrefix: "✔",
});
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./Settings.json"));
const LEVELS = Setting.Miner.Levels;
const TERMINATOR = () => log(COLORS.dim("=-".repeat(CLI_WIDTH() / 4)));
// Preload
console.clear();
TERMINATOR();

// Output File Handling
if (!FILE_SYSTEM.existsSync(PATH.join(__dirname, "/out")))
  FILE_SYSTEM.mkdirSync(PATH.join(__dirname, "/out"));
var out = FILE_SYSTEM.readdirSync(PATH.join(__dirname, "/out")).filter((el) =>
  el != "json" ? el : ""
);
try {
  out.forEach((el) => {
    FILE_SYSTEM.unlinkSync(PATH.join(__dirname, "/out", el));
  });
} catch (error) {
  log(COLORS.red("ERROR : Please Close File to continue !"));
  process.exit(0);
}

//getting names from keys
const TeamsOPT = Object.keys(Setting.Links).filter(
  ([key]) => !key.startsWith("#")
);

(async () => {
  // Asking for which team to use
  const Func = await new MultiSelect({
    name: "Func",
    initial: "LEVEL DATA",
    message: COLORS.yellow("Select Function ?"),
    choices: ["LEVEL DATA", "TARGET DATA", "CHEQUE DATA"],
  }).run();

  if (Func.length === 0) {
    log(
      `${COLORS.red("-ERROR- :")} ${COLORS.yellow("Please Select Function")}`
    );
    process.exit(0); // exit if no team selected
  }

  // // asking for which team to use
  const Teams = await new MultiSelect({
    name: "Teams",
    message: COLORS.yellow("Select Teams ?"),
    choices: TeamsOPT,
  }).run();

  if (Teams.length == 0) {
    log(`${COLORS.red("-ERROR- :")} ${COLORS.yellow("Please Select Team")}`);
    process.exit(0); // exit if no team selected
  }

  // loop for every Selected team
  for (let i = 0; i < Teams.length; i++) {
    // Fetch Their Teams Data
    Load.add("1", { text: COLORS.magenta("Fetching Data for : " + Teams[i]) });
    const url = Setting.Links[Teams[i]];
    const csv = await axios.get(url);
    const Data = (await csvtojson().fromString(csv.data)).slice(0, 3);
    Load.succeed("1", { text: "Fetched Data : " + COLORS.yellow(Teams[i]) });
    TERMINATOR();

    // loging Progress
    log(
      COLORS.magenta("FILE NBR"),
      ":",
      COLORS.yellow((i + 1).toString()) + "/" + COLORS.yellow(Teams.length)
    );
    log(
      COLORS.magenta(Teams[i].toString().toUpperCase()),
      ":",
      COLORS.yellow(Data.length.toString())
    );
    TERMINATOR();
    Load.stopAll();
    // calling Fetch for every Member
    const MinedData = await MINER(Data, Func, Teams[i]); // actual Data Fetch
    HandleData(MinedData, Teams[i].replaceAll(" ", "_"), Func); // Writing Data to file

    // Writing Data to file
  }
  TERMINATOR();
  log(COLORS.green.bold("PROCESS COMPLETED"));
  // POWER.execSync("open " + PATH.join(__dirname, "/out"));
  log("Open ->", COLORS.magenta(PATH.join(__dirname, "/out")));
  TERMINATOR();
})();

async function SortData(DATA) {
  LEVELS.unshift("-");
  const sortedData = await Promise.all(
    LEVELS.map((level) => {
      return DATA.filter((item) => item.level === level);
    })
  ).then((data) => {
    const sorted = data.flat().reverse();
    const unsorted = DATA.filter((item) => !item.level);
    return sorted.concat(unsorted);
  });
  return sortedData;
}

async function MakeHtml(DATA) {
  const style = `<style id="style">
  @page{margin: 0mm;}
  * {color: ${Setting.print.HeadingColor};
    margin: 0;
    padding: 0;
    font-family: ${Setting.print.Font};
    text-align: left;
  }
  h1 {margin: 10px;text-align: center;}
  body {
    background-color: ${Setting.print.BackgroundColor};
    zoom: ${Setting.print.PageZoom};
  }
  table {margin: auto;}
  td,th {
    padding: ${Setting.print.DataPadding};
    border-left: ${Setting.print.BorderWidth} solid ${Setting.print.BorderColor};
    min-width: max-content;
  }
  tr:nth-of-type(even) {
    background-color: ${Setting.print.EvenRowColor};
  }
  th {
    font-size: ${Setting.print.FontSize};
    border-bottom: ${Setting.print.BorderWidth} solid ${Setting.print.BorderColor};
  }
  .a {color: ${Setting.print.Column1Col}}
  .c {color: ${Setting.print.Column2Col}}
  .d {color: ${Setting.print.Column3Col}}
  .e {color: ${Setting.print.Column4Col}}
  .b {color: #ff7b72}
  .g {color: #656565da}
  .hol {
    width: max-content;
    height: max-content;
  }
  </style>`;
  let headers = "";
  let rows = "";
  if (TYPE === "SP") {
    for (let i = 0; i < DATA.length; i++) {
      let row = `<tr><td>${i + 1}</td>
            <td class="a">${DATA[i].name}</td>
            <td class="c">${DATA[i].level}</td>
            <td class="d">${DATA[i].remainsaosp}</td>
            <td class="e">${DATA[i].remainsgosp}</td></tr>`;
      rows = rows + row;
    }
    headers = `<th>SAO</th><th>SGO</th>`;
  } else {
    // Making non repeating array of dates
    let Dates = [];
    let cheque = [];
    DATA.forEach((el) => {
      el.data.forEach((ele) => {
        Dates.push(ele.payDate);
      });
    });

    // Making headers
    Dates = [...new Set(Dates)];
    for (let i = 0; i < 4; i++) {
      headers = headers + `<th>${Dates[i]}</th>`;
    }

    // sorting payCheque by dates
    for (let i = 0; i < DATA.length; i++) {
      for (let j = 0; j < 4; j++) {
        cheque[j] = 0;
        DATA[i].data.forEach((el) => {
          if (el.payDate == Dates[j]) {
            cheque[j] = cheque[j] + Number(el.amount);
          }
        });
      }
      let row = `<tr>
            <td>${i + 1}</td>
            <td class="a">${DATA[i].name}</td>
            <td class="d">${DATA[i].level}</td>
            <td class="${cheque[0] ? "e" : "b"}">
            ${cheque[0]}</td>
            <td class="${cheque[1] ? "e" : "b"}">
            ${cheque[1]}</td>
            <td class="${cheque[2] ? "e" : "b"}">
            ${cheque[2]}</td>
            <td class="${cheque[3] ? "e" : "b"}">
            ${cheque[3]}</td>
            </tr>`;
      rows = rows + row;
    }
  }
  var contentHtml = `
    ${style}
    <div class="hol">
    <h1>${FILENAME}</h1>
    <table><tbody><tr>
    <th>SNo</th>
    <th>Name</th>
    <th>Level</th>
    ${headers}
  </tr>${rows}</tbody></table><div>
<script>
  const content = document.querySelector('.hol');
  const contentWidth = content.clientWidth;
  const contentHeight = content.clientHeight;
  const style = "@page { size: " +contentWidth+"px "+contentHeight+"px}; margin: 0; }"
  document.getElementById('style').innerHTML = document.getElementById('style').innerHTML + style
  </script>`;
  return contentHtml;
}

async function HandleData(Data, Team) {
  // creating file name
  if (Data.level.length != 0) {
    let SortedLevelData = await SortData(Data.level);
    let levelHtml = await MakeHtml(SortedLevelData);
    FILE_SYSTEM.writeFileSync("./html/" + Team + "_Level_Data", levelHtml);
  }
  if (Data.level.length != 0) {
    let SortedTargetData = await SortData(Data.target);
    let TargetHtml = await MakeHtml(SortedTargetData);
    FILE_SYSTEM.writeFileSync("./html/" + Team + "_Target_Data", TargetHtml);
  }
  if (Data.level.length != 0) {
    let SortedChequeData = await SortData(Data.cheque);
    let ChequeHtml = await MakeHtml(SortedChequeData);
    FILE_SYSTEM.writeFileSync("./html/" + Team + "_Cheque_Data", ChequeHtml);
  }
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
}
