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

const terminator = () => console.log(COLORS.dim("-=").repeat(cliWidth() / 2));
const WrongPass = [];
const spinner = new SPINNIES({
  succeedPrefix: "✔",
  failPrefix: "✖",
});
PUPPETEER.use(STEALTH_PLUGIN());
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
const LEVELS = Setting.Miner.Levels;
async function LEVEL(PAGE, NAME, ID) {
  if (WrongPass.includes(ID)) return 0;
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
  if (WrongPass.includes(ID)) return 0;
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
async function LOGIN(PAGE, ID, PASS, NAME) {
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
  // console.log("LOGGED IN", NAME);
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
    if (WrongPass.includes(id)) return;
    spinner.fail(id, { text: name + " : " + COLORS.redBright.bold("FAILED") });
    cluster.queue({ id: id, pass: pass, name: name });
  });
  const LEVEL_OUT = [];
  const TARGET_OUT = [];
  const CHEQUE_OUT = [];
  await cluster.task(async ({ page, data: { id, pass, name } }) => {
    // Fetching Data
    await page.setRequestInterception(true); // Not Loading FONT and IMAGE
    page.on("request", (req) => {
      if (req.resourceType() == "font" || req.resourceType() == "image")
        req.abort();
      else req.continue();
    });
    // ---------------------- Calling Awpl Functions Accordingly ----------------------

    spinner.add(id, { text: name + " " + COLORS.yellow("Logging") });
    await LOGIN(page, id, pass, name);
    spinner.add(id, { text: name + " " + COLORS.green.bold("Logged") });
    if (FUNCTION.includes("LEVEL")) {
      spinner.add(id, {
        text:
          name +
          " : " +
          COLORS.green.bold("Logged") +
          " : " +
          COLORS.yellow("Leveling"),
      });
      var data = await LEVEL(page, name, id);
      spinner.add(id, {
        text:
          name +
          " : " +
          COLORS.green.bold("Logged") +
          " : " +
          COLORS.green.bold("Leveled"),
      });
      if (data == 0) {
        LEVEL_OUT.push({
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
      } else {
        LEVEL_OUT.push(data); // push data to output
        FILE_SYSTEM.writeFileSync(
          PATH.join(__dirname, "./json/" + NAME + " LEVEL DATA.json"),
          JSON.stringify(LEVEL_OUT)
        );
      }
    }
    if (FUNCTION.includes("TARGET")) {
      spinner.add(id, {
        text:
          name +
          " : " +
          COLORS.green.bold("Logged") +
          " : " +
          COLORS.green.bold("Leveled") +
          " : " +
          COLORS.yellow("Targeting"),
      });
      var data = await TARGET(page, name, id);
      spinner.add(id, {
        text:
          name +
          " : " +
          COLORS.green.bold("Logged") +
          " : " +
          COLORS.green.bold("Leveled") +
          " : " +
          COLORS.green.bold("Targeted"),
      });
      TARGET_OUT.push(data); // push data to output
      FILE_SYSTEM.writeFileSync(
        PATH.join(__dirname, "./json/" + NAME + " TARGET DATA.json"),
        JSON.stringify(TARGET_OUT)
      );
    }
    if (FUNCTION.includes("CHEQUE")) {
      console.log();
      var data = await CHEQUE(page, name, id);
      console.log("CHEQUE DATA", data.name, data.level, data.data);
      CHEQUE_OUT.push(data); // push data to output
    }
    spinner.succeed(id);
  });
  for (let i = 0; i < DATA.length; i++) {
    // calling Fetch for every Member
    cluster.queue(DATA[i]);
  }
  await cluster.idle(); // closing when done
  await cluster.close(); // closing when done
  return LEVEL_OUT;
}
async function START() {
  console.clear();
  terminator();
  const func = await new MultiSelect({
    name: "function",
    message: "SELECT FUNCTION",
    choices: ["LEVEL", "TARGET", "CHEQUE"],
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
    spinner.add("teamFetch", {
      color: "yellow",
      text: `FETCHING TEAM OF ${COLORS.yellow.bold(u)}`,
    });
    try {
      const response = await axios.get(Setting.Users[u]);
      const data = await csv().fromString(response.data);
      spinner.succeed("teamFetch", {
        text: `${COLORS.magenta.bold(u)} : ${COLORS.yellow.bold(data.length)}`,
      });
      await MINER(data, func, u);
    } catch (error) {
      spinner.fail("teamFetch", {
        text: `FETCHING FAIL : ${COLORS.red.bold(u)}`,
      });
      process.exit(0);
      return null;
    }
  }
}

START();
