// To track Time
console.time("Time Taken ");

// importing modules
const PATH = require("path");
const axios = require("axios");
const COLORS = require("colors");
const FILE_SYSTEM = require("fs");
const { log } = require("console");
const MINER = require("./miner.js");
const Spinnies = require("spinnies");
const csvtojson = require("csvtojson");
const CLI_WIDTH = require("cli-width");
const POWER = require("child_process");
const { MultiSelect, Confirm, Select } = require("enquirer");

// assigning constants
const Load = new Spinnies({
  succeedPrefix: "✔",
});
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./Settings.json"));
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
  const Func = await new Select({
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
    const Data = await csvtojson().fromString(csv.data);
    Load.succeed("1", { text: "Fetched Data : " + COLORS.yellow(Teams[i]) });
    TERMINATOR();

    // loging Progress
    log(
      COLORS.magenta("FILE NBR :"),
      COLORS.yellow((i + 1).toString()) + "/" + COLORS.yellow(Teams.length)
    );
    log(
      COLORS.magenta(Teams[i].toString().toUpperCase()),
      ":",
      COLORS.yellow(Data.length.toString())
    );
    TERMINATOR();
    // calling Fetch for every Member

    const MinedData = await MINER(Data, Func, Teams[i]); // actual Data Fetch
    console.log(MinedData);
    // Writing Data to file
    const NotNames = Data.map((item) => item.name).filter(
      (name) => !MinedData.map((item) => item.name).includes(name)
    );
    console.log;
    FILE_SYSTEM.writeFileSync(
      PATH.join(__dirname, "/out", Teams[i] + ".json"),
      JSON.stringify(MinedData)
    );
  }
  TERMINATOR();
  log(COLORS.green.bold("PROCESS COMPLETED"));
  const prompt = await new Confirm({
    name: "question",
    message: COLORS.yellow("OPEN OUTPUT DIRECTORY?"),
    initial: false,
  }).run();
  if (prompt) {
    POWER.execSync("open " + PATH.join(__dirname, "/out"));
    log("Opened", COLORS.magenta(PATH.join(__dirname, "/out")));
  }
  TERMINATOR();
})();
