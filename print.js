const files = require("fs").readdirSync("./html");
files.forEach((file) => {
  require("child_process").execFileSync(require("chromium").path, [
    "--headless",
    "--disable-gpu",
    `--print-to-pdf=${__dirname}/out/${file.replace(".html", "")}.pdf`,
    "--no-margins",
    `${__dirname}/html/${file}`,
  ]);
});
