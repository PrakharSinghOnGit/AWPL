// importing Modules
const { PendingXHR } = require("pending-xhr-puppeteer");
const FILE_SYSTEM = require("fs");
const { Cluster } = require("puppeteer-cluster");
const PUPPETEER = require("puppeteer-extra");
const STEALTH_PLUGIN = require("puppeteer-extra-plugin-stealth");
const COLORS = require("colors");
const Spinnies = require("spinnies");

// Assigning Constants
const WrongPass = [];
PUPPETEER.use(STEALTH_PLUGIN());
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
const Load = new Spinnies({
  succeedPrefix: "✔",
});
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./Settings.json"));
const LEVELS = Setting.Miner.Levels;

async function MINER(DATA, FUNCTION) {
  let Ticker = DATA.length;
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
  cluster.on("taskerror", async (err, { name, pass, id }) => {
    // Error Handling
    if (WrongPass.includes(id)) return;
    if (Load.checkIfActiveSpinners(id)) {
      Load.update(id, {
        text: `${COLORS.red.bold(name)} : ${err.message.toString()}`,
        spinnerColor: "red",
      });
    }
    cluster.queue({ id: id, pass: pass, name: name });
  });
  const LEVEL_OUT = [];
  const TARGET_OUT = [];
  const CHEQUE_OUT = [];
  await cluster.task(async ({ page, data: { id, pass, name } }) => {
    Load.add(id, {
      text: COLORS.yellow(name) + COLORS.magenta("Mining Data : "),
    });
    // Fetching Data
    await page.setRequestInterception(true); // Not Loading FONT and IMAGE
    page.on("request", (req) => {
      if (req.resourceType() == "font" || req.resourceType() == "image")
        req.abort();
      else req.continue();
    });
    // ---------------------- Calling Awpl Functions Accordingly ----------------------
    if (Ticker == 0) {
      FILE_SYSTEM.writeFileSync("TEST.json", JSON.stringify(LEVEL_OUT));
      return LEVEL_OUT;
    }
    await LOGIN(page, id, pass, name);
    if (FUNCTION.includes("LEVEL DATA")) {
      var data = await LEVEL(page, name, id);
      Ticker--;
      if (data == 0) {
        Load.fail(id, {
          text: `${COLORS.red.bold(name)} : ${COLORS.dim("FAILED")}`,
        });
        // check if LEVEL_OUT aleardy has an object with same name
        // if (LEVEL_OUT.includes(data.name)) return;
        LEVEL_OUT.push({
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
      } else {
        Load.succeed(id, {
          text: `${COLORS.green.bold(name)} : ${COLORS.dim("SUCCESS")} : ${
            data.level
          } ${data.remainsaosp} ${data.remainsgosp}`,
        });
        LEVEL_OUT.push(data); // push data to output
      }
    }
    if (FUNCTION.includes("TARGET DATA")) {
      Ticker--;
      var data = await TARGET(page, name, id);
      if (data == 0) {
        Load.fail(id, {
          text: `${COLORS.red.bold(name)} : ${COLORS.dim("FAILED")}`,
        });
        if (LEVEL_OUT.includes(data.name)) return;
        TARGET_OUT.push({
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
      } else {
        Load.succeed(id, {
          text: `${COLORS.green.bold(name)} : ${COLORS.dim("SUCCESS")}`,
        });
        TARGET_OUT.push(data); // push data to output
      }
    }
    if (FUNCTION.includes("CHEQUE DATA")) {
      var data = await CHEQUE(page, name, id);
      Load.succeed(id, {
        text: `${COLORS.green("SUCCESS")} : ${COLORS.yellow(name)}`,
      });
      CHEQUE_OUT.push(data); // push data to output
    }
  });
  for (let i = 0; i < DATA.length; i++) {
    // calling Fetch for every Member
    cluster.queue(DATA[i]);
  }
  await cluster.idle(); // closing when done
  await cluster.close(); // closing when done
}
async function LEVEL(PAGE, NAME, ID) {
  if (WrongPass.includes(ID)) return 0;
  await PAGE.evaluate(() =>
    window.open(
      "https://asclepiuswellness.com/userpanel/LevelPandingListNew.aspx",
      "_self"
    )
  );
  Load.update(ID, {
    text:
      COLORS.yellow.bold(NAME) +
      " :" +
      COLORS.dim.magenta(" Opening Level Page : "),
    spinnerColor: "magenta",
  });
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
async function LOGIN(PAGE, ID, PASS, NAME) {
  PAGE.on("dialog", async (dialog) => {
    let dialogMessage = dialog
      .message()
      .toString()
      .replace(/(\r\n|\n|\r)/gm, "");
    Load.fail(ID, {
      text: `${COLORS.red.bold(NAME)} : ${COLORS.dim(dialogMessage)}`,
    });
    WrongPass.push(ID);
    dialog.dismiss();
  });
  Load.update(ID, {
    text: COLORS.yellow.bold(NAME) + " :" + COLORS.dim(" Logging in : "),
    spinnerColor: "yellow",
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
async function TARGET(PAGE, NAME, ID) {
  if (WrongPass.includes(ID)) return 0;
  const pending = new PendingXHR(PAGE);
  Load.update(ID, {
    text:
      COLORS.yellow.bold(NAME) +
      " :" +
      COLORS.dim.cyan(" Opening Target Page : "),
    spinnerColor: "cyan",
  });
  await PAGE.evaluate(
    (URL) => window.open(URL, "_self"),
    Setting.Miner.TargetURL
  );
  await PAGE.waitForNavigation({ waitUntil: "networkidle2" });
  try {
    await pending.waitForAllXhrFinished();
    let level = await PAGE.evaluate(() =>
      document
        .querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(3)"
        )
        .textContent.replace(" DS", "")
        .toUpperCase()
    );
    let remainsaosp = await PAGE.evaluate(() =>
      Number(
        document.querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(6)"
        ).textContent
      ).toFixed()
    );
    let remainsgosp = await PAGE.evaluate(() =>
      Number(
        document.querySelector(
          "#ctl00_ContentPlaceHolder1_CustomersGridView > tbody > tr:nth-child(2) > td:nth-child(7)"
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
    Load.fail(ID, {
      text:
        COLORS.yellow.red(NAME) + " :" + COLORS.red(" EMPTY TARGET PAGE : "),
    });
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
    await SLEEP(1000);
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

module.exports = MINER;