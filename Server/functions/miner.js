const FILE_SYSTEM = require("fs");
const { Cluster } = require("puppeteer-cluster");
const PUPPETEER = require("puppeteer-extra");
const STEALTH_PLUGIN = require("puppeteer-extra-plugin-stealth");
const { LEVEL } = require("./LEVEL");
const { TARGET } = require("./TARGET");
const { CHEQUE } = require("./CHEQUE");
const { LOGIN } = require("./LOGIN");

// Assigning Constants
const WrongPass = [];
exports.WrongPass = WrongPass;
PUPPETEER.use(STEALTH_PLUGIN());
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
exports.SLEEP = SLEEP;
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./Settings.json"));
exports.Setting = Setting;
const LEVELS = Setting.Miner.Levels;
exports.LEVELS = LEVELS;

async function MINER(DATA, FUNCTION, NAME, SOCKET) {
  console.log("MINER STARTED", DATA.length);
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
        // check if LEVEL_OUT aleardy has an object with same name
        // if (LEVEL_OUT.includes(data.name)) return;
        SOCKET.emit("LEVEL", {
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
        LEVEL_OUT.push({
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
      } else {
        SOCKET.emit("LEVEL", data);
        LEVEL_OUT.push(data); // push data to output
      }
    }
    if (FUNCTION.includes("TARGET")) {
      Ticker--;
      var data = await TARGET(page, name, id);
      if (data == 0) {
        if (LEVEL_OUT.includes(data.name)) return;
        TARGET_OUT.push({
          name: name,
          level: "-",
          remainsaosp: "-",
          remainsgosp: "-",
        });
      } else {
        TARGET_OUT.push(data); // push data to output
      }
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
  FILE_SYSTEM.writeFileSync(NAME + ".json", JSON.stringify(LEVEL_OUT));
  return LEVEL_OUT;
}
module.exports = MINER;
