const { PendingXHR } = require("pending-xhr-puppeteer");
const { WrongPass, SLEEP } = require("./miner");

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
exports.CHEQUE = CHEQUE;
