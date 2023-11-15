const PATH = require("path");
const COLORS = require("colors");
const FILE_SYSTEM = require("fs");
const { log } = require("console");

function outDirHandler() {
  if (!FILE_SYSTEM.existsSync(PATH.join(__dirname, "../out")))
    FILE_SYSTEM.mkdirSync(PATH.join(__dirname, "../out"));
  var out = FILE_SYSTEM.readdirSync(PATH.join(__dirname, "../out")).filter(
    (el) => (el != "json" ? el : "")
  );
  try {
    out.forEach((el) => {
      FILE_SYSTEM.unlinkSync(PATH.join(__dirname, "../out", el));
    });
  } catch (error) {
    log(COLORS.red("ERROR : Please Close File to continue !"));
    process.exit(0);
  }
}

export default outDirHandler;
