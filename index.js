const PATH = require("path");
const axios = require("axios");
const csv = require("csvtojson");
const FILE_SYSTEM = require("fs");
const SPINNIES = require("spinnies");
const COLORS = require("ansi-colors");
const { MultiSelect } = require("enquirer");
const PUPPETEER = require("puppeteer-extra");
const { Cluster } = require("puppeteer-cluster");
const { PendingXHR } = require("pending-xhr-puppeteer");
const STEALTH_PLUGIN = require("puppeteer-extra-plugin-stealth");
const cliWidth = require("cli-width");
const Setting = require(PATH.join(__dirname, "./Settings.json"));
const terminator = () => console.log(COLORS.dim("-=").repeat(cliWidth() / 4));
const WrongPass = [];
const spinner = new SPINNIES({
  succeedPrefix: " ",
  failPrefix: "✖",
});
PUPPETEER.use(STEALTH_PLUGIN());
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
const LEVELS = Setting.Miner.Levels;
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
function TABLE(DATA, FUNCTION, NAME) {
  console.clear();
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
async function LEVEL(PAGE, NAME, ID) {
  if (WrongPass.includes(ID))
    return {
      name: NAME,
      level: "-",
      remainsaosp: "-",
      remainsgosp: "-",
    };
  await PAGE.evaluate(() =>
    window.open(
      "https://asclepiuswellness.com/userpanel/LevelPandingListNew.aspx",
      "_self"
    )
  );
  await PAGE.waitForNavigation({ waitUntil: "networkidle2" });
  await SLEEP(1000);
  const targetdata = await PAGE.evaluate(() => {
    let i = 2;
    while (
      document.querySelector(
        "#ctl00_ContentPlaceHolder1_GVPanding > tbody > tr:nth-child(" +
          i +
          ") > td:nth-child(9)"
      ).textContent != "Pending"
    ) {
      i++;
    }
    return [
      document.querySelector(
        "#ctl00_ContentPlaceHolder1_GVPanding > tbody > tr:nth-child(" +
          i +
          ") > td:nth-child(7)"
      ).textContent,
      document.querySelector(
        "#ctl00_ContentPlaceHolder1_GVPanding > tbody > tr:nth-child(" +
          i +
          ") > td:nth-child(8)"
      ).textContent,
      i,
    ];
  });
  var data = {
    name: NAME,
    level: LEVELS[targetdata[2] - 2].toUpperCase(),
    remainsaosp: Number(targetdata[0]).toFixed(),
    remainsgosp: Number(targetdata[1]).toFixed(),
  };
  return data;
}
async function TARGET(PAGE, NAME, ID) {
  if (WrongPass.includes(ID))
    return {
      name: NAME,
      level: "-",
      remainsaosp: "-",
      remainsgosp: "-",
    };
  const pending = new PendingXHR(PAGE);
  await PAGE.evaluate(
    (URL) => window.open(URL, "_self"),
    Setting.Miner.TargetURL
  );
  await PAGE.waitForNavigation({ waitUntil: "networkidle2" });
  await SLEEP(1000);
  try {
    await pending.waitForAllXhrFinished();
    let level = await PAGE.evaluate(() =>
      document
        .querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(2)"
        )
        .textContent.replace(" DS", "")
        .toUpperCase()
    );
    let remainsaosp = await PAGE.evaluate(() =>
      Number(
        document.querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(5)"
        ).textContent
      ).toFixed()
    );
    let remainsgosp = await PAGE.evaluate(() =>
      Number(
        document.querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(6)"
        ).textContent
      ).toFixed()
    );
    return {
      name: NAME,
      level: level,
      remainsaosp: remainsaosp,
      remainsgosp: remainsgosp,
    };
  } catch (error) {
    return {
      name: NAME,
      level: "-",
      remainsaosp: "-",
      remainsgosp: "-",
    };
  }
}
async function CHEQUE(PAGE, NAME) {
  if (WrongPass.includes(ID)) return 0;
  const pending = new PendingXHR(PAGE);
  await PAGE.evaluate(() =>
    window.open(
      "https://asclepiuswellness.com/userpanel/UserLevelNew.aspx",
      "_self"
    )
  );
  await PAGE.waitForNavigation({ waitUntil: "networkidle2" });
  const sleep = (duration) =>
    new Promise((resolve) => setTimeout(resolve, duration));
  await PAGE.evaluate(() => {
    let d = new Date();
    const pad = function (nbr) {
      return nbr < 10 ? "0" + nbr : nbr;
    };
    var omb =
      pad(d.getDate()) +
      "/" +
      pad(d.getMonth() == 0 ? "12" : d.getMonth()) +
      "/" +
      (d.getMonth() == 0 ? d.getFullYear() - 1 : d.getFullYear());
    document.querySelector("#ctl00_ContentPlaceHolder1_txtFrom").value = omb;
  });
  await PAGE.click("#ctl00_ContentPlaceHolder1_btnshow");
  try {
    await pending.waitForAllXhrFinished();
    await PAGE.waitForSelector(
      "#ctl00_ContentPlaceHolder1_gvIncome > tbody > tr:nth-child(1) > th:nth-child(1)"
    );
    await sleep(1000);
    await PAGE.evaluate(() => {
      var table = document.querySelector("table");
      var data = [];
      var headers = [];
      for (var i = 0; i < table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML
          .toLowerCase()
          .replace(/ /gi, "");
      }
      for (var i = 1; i < table.rows.length; i++) {
        var tableRow = table.rows[i];
        var rowData = {};
        for (var j = 0; j < tableRow.cells.length; j++) {
          rowData[headers[j]] = tableRow.cells[j].innerHTML;
        }
        data.push(rowData);
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].status == "Pending") {
          data = data[i];
        }
      }
      let d = [];
      data.forEach((el) => {
        d.push({ payDate: el.paydate.substr(0, 5), amount: el.totalamount });
      });
      var div = document.createElement("div");
      div.id = "myCustomDiv";
      div.innerText = JSON.stringify(d);
      document.querySelector("body").appendChild(div);
    });
    var RawData = JSON.parse(
      await PAGE.evaluate(
        () => document.querySelector("#myCustomDiv").innerText
      )
    );
  } catch (e) {
    var RawData = [];
  }
  await PAGE.evaluate(() =>
    window.open(
      "https://asclepiuswellness.com/userpanel/LevelPandingListNew.aspx",
      "_self"
    )
  );
  await PAGE.waitForNavigation({ waitUntil: "networkidle2" });
  await sleep(1000);
  await PAGE.evaluate(() => {
    var table = document.querySelector("table");
    var data = [];
    var headers = [];
    for (var i = 0; i < table.rows[0].cells.length; i++) {
      headers[i] = table.rows[0].cells[i].innerHTML
        .toLowerCase()
        .replace(/ /gi, "");
    }
    for (var i = 1; i < table.rows.length; i++) {
      var tableRow = table.rows[i];
      var rowData = {};
      for (var j = 0; j < tableRow.cells.length; j++) {
        rowData[headers[j]] = tableRow.cells[j].innerHTML;
      }
      data.push(rowData);
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i].status == "Pending") {
        data = data[i];
      }
    }
    const levels = [
      "Fresher",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Emerald",
      "Topaz",
      "Ruby Star",
      "Sapphire",
      "Star Sapphire",
      "Diamond",
      "Blue Diamond",
      "Black Diamond",
      "Royal Diamond",
      "Crown Diamond",
      "Ambassador",
      "Royal Ambassador",
      "Crown Ambassador",
      "Brand Ambassador",
    ];
    var div = document.createElement("div");
    div.id = "myCustomDiv";
    div.innerText = levels[Number(data.step) - 1].toUpperCase();
    document.querySelector("body").appendChild(div);
  });
  var level = await PAGE.evaluate(
    () => document.querySelector("#myCustomDiv").innerText
  );
  return {
    name: NAME,
    data: RawData,
    level: level,
  };
}
async function LOGIN(PAGE, ID, PASS) {
  PAGE.on("dialog", async (dialog) => {
    WrongPass.push(ID);
    dialog.dismiss();
  });
  await PAGE.goto(
    `https://asclepiuswellness.com/userpanel/uservalidationnew.aspx?memberid=${ID.replace(
      /\W/g,
      ""
    )}&pwd=${PASS.replace(/\W/g, "")}`,
    { waitUntil: "networkidle2" }
  );
  return;
}
async function MINER(DATA, FUNCTION, NAME) {
  const cluster = await Cluster.launch({
    // browser Launch Properties
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Incognito Pages gor each Worker
    maxConcurrency: Setting.Miner.Debug ? 1 : Setting.Miner.MaxConcurrency,
    puppeteer: PUPPETEER,
    sameDomainDelay: Setting.Miner.SameDomainDelay,
    timeout: Setting.Miner.Timeout,
    puppeteerOptions: {
      timeout: Setting.Miner.Timeout,
      headless: Setting.Miner.Debug ? false : "new",
      defaultViewport: null,
      args: [`--start-maximized`, `--auto-open-devtools-for-tabs`],
    },
  });
  cluster.on("taskerror", async (_err, { name, pass, id }) => {
    // Error Handling
    FUNCTION.forEach((ele) => {
      DATA[ele] = "ERROR ";
    });
    TABLE(DATA, FUNCTION, NAME);
    if (WrongPass.includes(id)) return;
    cluster.queue({ id: id, pass: pass, name: name });
  });
  const LEVEL_OUT = [];
  const TARGET_OUT = [];
  const CHEQUE_OUT = [];
  await cluster.task(async ({ page, data: { id, pass, name } }) => {
    await page.setRequestInterception(true); // Not Loading FONT and IMAGE
    page.on("request", (req) => {
      if (req.resourceType() == "font" || req.resourceType() == "image")
        req.abort();
      else req.continue();
    });
    // ---------------------- Calling Awpl Functions Accordingly ----------------------
    FUNCTION.forEach((ele) => {
      DATA[ele] = "LOGING";
    });
    TABLE(DATA, FUNCTION, NAME);
    await LOGIN(page, id, pass, name);
    TABLE(DATA, FUNCTION, NAME);
    if (FUNCTION.includes("LEVEL")) {
      DATA["LEVEL"] = "LOADIN";
      TABLE(DATA, FUNCTION, NAME);
      var data = await LEVEL(page, name, id);
      DATA["LEVEL"] = "SUCCES";
      TABLE(DATA, FUNCTION, NAME);
      LEVEL_OUT.push(data); // push data to output
      FILE_SYSTEM.writeFileSync(
        PATH.join(__dirname, "./json/" + NAME + " LEVEL DATA.json"),
        JSON.stringify(LEVEL_OUT)
      );
    }
    if (FUNCTION.includes("TARGET")) {
      DATA["TARGET"] = "LOADIN";
      TABLE(DATA, FUNCTION, NAME);
      var data = await TARGET(page, name, id);
      DATA["LEVEL"] = "SUCCES";
      TABLE(DATA, FUNCTION, NAME);
      TARGET_OUT.push(data); // push data to output
      FILE_SYSTEM.writeFileSync(
        PATH.join(__dirname, "./json/" + NAME + " TARGET DATA.json"),
        JSON.stringify(TARGET_OUT)
      );
    }
    if (FUNCTION.includes("CHEQUE")) {
      DATA["CHEQUE"] = "LOADIN";
      TABLE(DATA, FUNCTION, NAME);
      var data = await CHEQUE(page, name, id);
      DATA["LEVEL"] = "SUCCES";
      TABLE(DATA, FUNCTION, NAME);
      CHEQUE_OUT.push(data); // push data to output
      FILE_SYSTEM.writeFileSync(
        PATH.join(__dirname, "./json/" + NAME + " CHEQUE DATA.json"),
        JSON.stringify(CHEQUE_OUT)
      );
    }
  });
  for (let i = 0; i < DATA.length; i++) {
    cluster.queue(DATA[i]);
  }
  await cluster.idle(); // closing when done
  await cluster.close(); // closing when done
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
      MINER(UpperCasedData, func, u);
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
