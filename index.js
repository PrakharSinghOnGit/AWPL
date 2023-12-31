const PATH = require("path");
const axios = require("axios");
const csv = require("csvtojson");
const FILE_SYSTEM = require("fs");
const { MultiSelect } = require("enquirer");
const PUPPETEER = require("puppeteer-extra");
const { Cluster } = require("puppeteer-cluster");
const { PendingXHR } = require("pending-xhr-puppeteer");
const STEALTH_PLUGIN = require("puppeteer-extra-plugin-stealth");
const Setting = require(PATH.join(__dirname, "./Settings.json"));

const WrongPass = [];
PUPPETEER.use(STEALTH_PLUGIN());
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
const LEVELS = Setting.Miner.Levels;

async function getTeam(url) {
  try {
    const response = await axios.get(url);
    const jsonData = await csv().fromString(response.data);
    return jsonData;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
function outDirHandler() {
  if (!FILE_SYSTEM.existsSync(PATH.join(__dirname, "./out")))
    FILE_SYSTEM.mkdirSync(PATH.join(__dirname, "./out"));
  var out = FILE_SYSTEM.readdirSync(PATH.join(__dirname, "./out")).filter(
    (el) => (el != "json" ? el : "")
  );
  try {
    out.forEach((el) => {
      FILE_SYSTEM.unlinkSync(PATH.join(__dirname, "./out", el));
    });
  } catch (error) {
    log(COLORS.red("ERROR : Please Close File to continue !"));
    process.exit(0);
  }
}
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
    console.log(level);
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
  console.log("LOGGED IN", NAME);
  return;
}
async function MINER(DATA, FUNCTION, NAME) {
  console.log("MINER STARTED", NAME, DATA.length);
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

    await LOGIN(page, id, pass, name);
    if (FUNCTION.includes("LEVEL")) {
      var data = await LEVEL(page, name, id);
      console.log(
        "LEVEL DATA",
        data.name,
        data.level,
        data.remainsaosp,
        data.remainsgosp
      );
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
      var data = await TARGET(page, name, id);
      console.log(
        "Target DATA",
        data.name,
        data.level,
        data.remainsaosp,
        data.remainsgosp
      );
      TARGET_OUT.push(data); // push data to output
      FILE_SYSTEM.writeFileSync(
        PATH.join(__dirname, "./json/" + NAME + " TARGET DATA.json"),
        JSON.stringify(TARGET_OUT)
      );
    }
    if (FUNCTION.includes("CHEQUE")) {
      var data = await CHEQUE(page, name, id);
      CHEQUE_OUT.push(data); // push data to output
    }
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
  outDirHandler();
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
    const data = await getTeam(Setting.Users[u]);
    await MINER(data, func, u);
  }
}

START();
