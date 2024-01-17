const chalk = require("chalk");

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

let a = "QUEUED";
console.log(statusTheme[a](a));
console.log(statusTheme.LOGING("LOGING"));
console.log(statusTheme.LOADIN("LOADIN"));
console.log(statusTheme.SUCCES("SUCCES"));
console.log(statusTheme["ERROR "]("ERROR "));
