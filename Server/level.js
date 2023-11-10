// importing Modules
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

async function LEVELMINER(DATA, FILENAME) {
  console.log(FILENAME);
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
    if (!err.message.toString().includes("30000")) return;
    if (Load.checkIfActiveSpinners(id)) {
      Load.update(id, {
        text: `${COLORS.red.bold(name)} : ${err.message.toString()}`,
        spinnerColor: "red",
      });
    }
    cluster.queue({ id: id, pass: pass, name: name });
  });
  const LEVEL_OUT = [];
  await cluster.task(async ({ page, data: { id, pass, name } }) => {
    Load.add(id, {
      text: COLORS.yellow(name) + COLORS.magenta("Mining Data : "),
    });
    // Fetching Data
    await page.setRequestInterception(true); // Not Loading FONT and IMAGE
    page.on("request", (req) => {
      if (
        req.resourceType() == "font" ||
        req.resourceType() == "image" ||
        req.resourceType() == "stylesheet"
      )
        req.abort();
      else req.continue();
    });
    // ---------------------- Calling Awpl Functions Accordingly ----------------------
    await LOGIN(page, id, pass, name);
    var data = await LEVEL(page, name, id);
    if (data == 0) {
      Load.fail(id, {
        text: `${COLORS.red.bold(name)} : ${COLORS.dim("FAILED")}`,
      });
      if (LEVEL_OUT.includes(data.name)) return;
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
  });
  for (let i = 0; i < DATA.length; i++) {
    // calling Fetch for every Member
    cluster.queue(DATA[i]);
  }
  await cluster.idle(); // closing when done
  await cluster.close(); // closing when done
  FILE_SYSTEM.writeFileSync(
    "./json/" + FILENAME + "_LEVEL_DATA.json",
    JSON.stringify(LEVEL_OUT)
  );
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

module.exports = LEVELMINER;
