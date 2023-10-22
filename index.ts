// To track Time
console.time("Time Taken ");

// importing modules
import ora from "ora";
import PATH from "path";
import axios from "axios";
import COLORS from "colors";
import FILE_SYSTEM from "fs";
import { log } from "console";
import csvtojson from "csvtojson";
import CLI_WIDTH from "cli-width";
import POWER from "child_process";

// requiring modules
const Bun = require("bun");
const { MultiSelect, Confirm } = require("enquirer");

// assigning constants
const Setting = JSON.parse(await Bun.file("./Settings.json").text());
const TERMINATOR = () => log(COLORS.dim("=-".repeat(CLI_WIDTH() / 4)));
const LEVELS = Setting.Miner.Levels;

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

// Asking for which team to use
const Func = await new MultiSelect({
  name: "Func",
  initial: "LEVEL DATA",
  message: COLORS.yellow("Select Function ?"),
  choices: ["LEVEL DATA", "TARGET DATA", "CHEQUE DATA"],
}).run();

if (Func.length === 0) {
  log(`${COLORS.red("-ERROR- :")} ${COLORS.yellow("Please Select Function")}`);
  process.exit(0);
}

// // asking for which team to use
const Teams = await new MultiSelect({
  name: "Teams",
  initial: TeamsOPT[0],
  message: COLORS.yellow("Select Teams ?"),
  choices: TeamsOPT,
}).run();

if (Teams.length == 0) {
  log(`${COLORS.red("-ERROR- :")} ${COLORS.yellow("Please Select Team")}`);
  process.exit(0);
}

for (let i = 0; i < Teams.length; i++) {
  // loop for every team
  const spinner = ora(
    COLORS.magenta("Fetching Data for : " + Teams[i])
  ).start();
  const url = Setting.Links[Teams[i]];
  const csv = await axios.get(url);
  const Data = await csvtojson().fromString(csv.data);
  spinner.succeed(COLORS.green("Fetched Data for : " + Teams[i]));
  TERMINATOR();
  log(
    COLORS.magenta("FILE NBR :"),
    COLORS.yellow((i + 1).toString()) + "/" + COLORS.yellow(Teams.length)
  );
  log(
    COLORS.magenta(Teams[i].toString().toUpperCase()) +
      ":" +
      COLORS.yellow(Data.length.toString())
  );
  TERMINATOR();
  // await MINER(data, Func, Teams[i]); // actual Data Fetch
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

export {};
