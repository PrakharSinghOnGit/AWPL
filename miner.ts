// importing Modules
import { PendingXHR } from "pending-xhr-puppeteer";
import { Cluster } from "puppeteer-cluster";
import PUPPETEER from "puppeteer-extra";
import STEALTH_PLUGIN from "puppeteer-extra-plugin-stealth";
import COLORS from "colors";
import { log } from "console";

// Requiring Modules
const Bun = require("bun");

// Assigning Constants
PUPPETEER.use(STEALTH_PLUGIN());
const Setting = JSON.parse(await Bun.file("./Settings.json").text());

async function MINER(DATA: string | any[], FUNCTION: any, FILENAME: any) {
  return { DATA, FUNCTION, FILENAME };
  const cluster = await Cluster.launch({
    // browser Launch Properties
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Incognito Pages gor each Worker
    maxConcurrency: Setting.Miner.Debug ? 1 : Setting.Miner.MaxConcurrency,
    puppeteer: PUPPETEER,
    sameDomainDelay: Setting.Miner.SameDomainDelay,
    puppeteerOptions: {
      headless: Setting.Miner.Debug ? false : "new",
      defaultViewport: null,
      args: [`--start-maximized`, `--auto-open-devtools-for-tabs`],
    },
  });
  cluster.on("taskerror", async (err, { name }) => {
    // Error Handling
    log(
      `${COLORS.red("-ERROR- :")} ${COLORS.yellow(name)} : ${COLORS.dim(
        err.message.toString()
      )}`
    );
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
    // await LOGIN(page, id, pass, name);
    // if (FUNCTION.includes("LEVEL DATA")) {
    //   var data = await LEVEL(page, name);
    //   funcName = "LEVEL";
    //   log(
    //     `${COLORS.green("SUCCESS")} : ${COLORS.blue(
    //       funcName
    //     )}  : ${COLORS.yellow(name)} : ${COLORS.dim(data.level)}`
    //   );
    //   LEVEL_OUT.push(data); // push data to output
    // }
    // if (FUNCTION.includes("TARGET DATA")) {
    //   var data = await TARGET(page, name);
    //   funcName = "TARGET";
    //   log(
    //     `${COLORS.green("SUCCESS")} : ${COLORS.blue(
    //       funcName
    //     )} : ${COLORS.yellow(name)} : ${COLORS.dim(data.level)}`
    //   );
    //   TARGET_OUT.push(data); // push data to output
    // }
    // if (FUNCTION.includes("CHEQUE DATA")) {
    //   var data = await CHEQUE(page, name);
    //   const totalAmount = data.data.reduce((total, item) => {
    //     const amount = parseFloat(item.amount); // Parse the amount as a float
    //     return total + amount;
    //   }, 0);
    //   funcName = "CHEQUE";
    //   log(
    //     `${COLORS.green("SUCCESS")} : ${COLORS.blue(
    //       funcName
    //     )} : ${COLORS.yellow(name)} : ${COLORS.dim(data.level)} : ${COLORS.dim(
    //       totalAmount
    //     )}`
    //   );
    //   CHEQUE_OUT.push(data); // push data to output
    // }
  });
  for (let i = 0; i < DATA.length; i++) {
    // calling Fetch for every Member
    cluster.queue(DATA[i]);
  }
  await cluster.idle(); // closing when done
  await cluster.close(); // closing when done
  if (LEVEL_OUT.length != 0) {
    // Handle Level Output File
    // const Sorted_Level_Out = await SORT(LEVEL_OUT, true, "Level"); // sorting Out Data by Level
    // await PRINT(Sorted_Level_Out, FILENAME + " Level Data");
  }
  if (TARGET_OUT.length != 0) {
    // Handle Target Output File
    // const Sorted_Target_Out = await SORT(TARGET_OUT, true, "Target"); // sorting Out Data by Level
    // await PRINT(Sorted_Target_Out, FILENAME + " Target Data");
  }
  if (CHEQUE_OUT.length != 0) {
    // Handle Cheque Output FIle
    // const Sorted_Cheque_Out = await SORT(CHEQUE_OUT);
    // await PRINT(Sorted_Cheque_Out, FILENAME + " Cheque Data", "Cheque");
  }
}

export default MINER;
