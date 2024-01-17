const PATH = require("path");
const SPINNIES = require("spinnies");
const chalk = require("chalk");
const log = (msg) => process.stdout.write(msg.toString());
const terminator = () => console.log(chalk.dim("-=").repeat(cliWidth() / 4));
const cliWidth = require("cli-width");
const { MultiSelect } = require("enquirer");
const Setting = require(PATH.join(__dirname, "./Settings.json"));
const spinner = new SPINNIES({
  succeedPrefix: " ",
  failPrefix: "✖",
});
const axios = require("axios");
const csv = require("csvtojson");
let headTheme = {
  0: function (msg) {
    return chalk.hex("#FFFD82")(msg);
  },
  1: function (msg) {
    return chalk.hex("#FF9B71")(msg);
  },
  2: function (msg) {
    return chalk.hex("#1B998B")(msg);
  },
  3: function (msg) {
    return chalk.hex("#8DCB87")(msg);
  },
  4: function (msg) {
    return chalk.hex("#FFCC7A")(msg);
  },
  5: function (msg) {
    return chalk.hex("#52528C")(msg);
  },
  6: function (msg) {
    return chalk.hex("#FEE1C7")(msg);
  },
};
let statusTheme = {
  QUEUED: function (msg) {
    return chalk.hex("#7C9EB2")(msg);
  },
  LOGING: function (msg) {
    return chalk.hex("#E1AA7D")(msg);
  },
  LOADIN: function (msg) {
    return chalk.hex("#52DEE5")(msg);
  },
  SUCCES: function (msg) {
    return chalk.hex("#09BC8A")(msg);
  },
  "ERROR ": function (msg) {
    return chalk.hex("#F40000")(msg);
  },
};

function table(DATA, FUNCTION, NAME) {
  let longestName = NAME;
  for (let i = 0; i < DATA.length; i++) {
    if (DATA[i].name.length > longestName.length) {
      longestName = DATA[i].name;
    }
  }
  let theads = [
    DATA.length,
    NAME.padEnd(longestName.length),
    "USER ID",
    "PASS",
    ...FUNCTION,
  ];
  // ┏ ┳ ┓ ┣ ╋ ┫ ┗ ┛ ┻ ━ ┃
  let preHeader = `┏`;
  let header = `┃ `;
  let postHeader = `┣`;
  theads.forEach((ele, i) => {
    preHeader = preHeader + "━".repeat(ele.toString().length + 2) + "┳";
    header = header + headTheme[i](ele) + " ┃ ";
    postHeader = postHeader + "━".repeat(ele.toString().length + 2) + "╋";
  });
  preHeader = preHeader.slice(0, -1) + "┓";
  postHeader = postHeader.slice(0, -1) + "┫";
  log(preHeader + "\n");
  log(chalk.bold(header) + "\n");
  log(postHeader + "\n");
  for (let i = 0; i < DATA.length; i++) {
    let Status = FUNCTION.map((ele) =>
      DATA[i][ele] ? DATA[i][ele] : "QUEUED"
    );
    let tdata = [
      (i + 1).toString().padStart(2),
      DATA[i].name.padEnd(longestName.length),
      DATA[i].id.padEnd(7),
      DATA[i].pass.length > 4 ? DATA[i].pass.substr(0, 2) + "•➜" : DATA[i].pass,
      ...Status,
    ];
    let row = `┃ `;
    tdata.forEach((ele, i) => {
      if (statusTheme[ele]?.call) {
        row = row + statusTheme[ele](ele) + " ┃ ";
        return;
      }
      row = row + headTheme[i](ele) + " ┃ ";
    });
    log(row + "\n");
  }
  log(
    postHeader.replaceAll("╋", "┻").replace("┣", "┗").replace("┫", "┛") + "\n"
  );
}

async function START() {
  console.clear();
  terminator();
  const func = await new MultiSelect({
    name: "function",
    message: "SELECT FUNCTION",
    choices: ["LEVEL ", "TARGET", "CHEQUE"],
  })
    .run()
    .then((answer) => {
      return answer;
    })
    .catch(console.error);
  const Users = await new MultiSelect({
    name: "function",
    message: "SELECT FUNCTION",
    choices: Object.keys(Setting.Users),
  })
    .run()
    .then((answer) => {
      return answer;
    })
    .catch(console.error);
  for (u of Users) {
    terminator();
    spinner.add("fetch", {
      color: "yellow",
      text: `FETCHING TEAM OF ${chalk.yellow.bold(u)}`,
    });
    try {
      const response = await axios.get(Setting.Users[u]);
      const data = await csv().fromString(response.data);
      const UpperCasedData = data.map((item) => {
        const modifiedItem = {};
        for (const key in item) {
          if (Object.hasOwnProperty.call(item, key)) {
            modifiedItem[key] = item[key].toUpperCase();
          }
        }
        return modifiedItem;
      });
      spinner.remove("fetch");
      table(UpperCasedData, func, u);
      terminator();
      process.exit(0);
    } catch (error) {
      console.error(error);
      spinner.fail("fetch", {
        text: `FETCHING FAIL : ${chalk.red.bold(u)}`,
      });
      process.exit(0);
    }
  }
}

START();
