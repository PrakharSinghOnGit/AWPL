const fs = require("fs");
const Setting = JSON.parse(fs.readFileSync("./Settings.json"));
const LEVELS = Setting.Miner.Levels;
const child_process = require("child_process");
const chromium = require("chromium");
const files = require("fs").readdirSync("./json");

(async () => {
  await MakeJsons();
  await Print();
})();

async function MakeJsons() {
  files.forEach(async (file) => {
    const data = JSON.parse(fs.readFileSync(`./json/${file}`));
    let SortedLevelData = await SortData(data);
    let levelHtml = await MakeHtml(
      SortedLevelData,
      "SP",
      file.replace(".json", "")
    );
    fs.writeFileSync(
      "./html/" + file.replace(".json", "") + ".html",
      levelHtml
    );
  });
}

async function Print() {
  const htmls = fs.readdirSync("./html");
  htmls.forEach((file) => {
    child_process.execFileSync(chromium.path, [
      "--headless",
      "--disable-gpu",
      `--print-to-pdf=${__dirname}/out/${file.replace(".html", "")}.pdf`,
      "--no-margins",
      `${__dirname}/html/${file}`,
    ]);
  });
}

async function SortData(DATA) {
  LEVELS.unshift("-");
  const sortedData = await Promise.all(
    LEVELS.map((level) => {
      return DATA.filter((item) => item.level === level);
    })
  ).then((data) => {
    const sorted = data.flat().reverse();
    const unsorted = DATA.filter((item) => !item.level);
    return sorted.concat(unsorted);
  });
  return sortedData;
}

async function MakeHtml(DATA, TYPE, FILENAME) {
  const style = `<style id="style">
  @page{margin: 0mm;}
  * {color: ${Setting.print.HeadingColor};
    margin: 0;
    padding: 0;
    font-family: ${Setting.print.Font};
    text-align: left;
  }
  h1 {margin: 10px;text-align: center;}
  body {
    background-color: ${Setting.print.BackgroundColor};
    zoom: ${Setting.print.PageZoom};
  }
  table {margin: auto;}
  td,th {
    padding: ${Setting.print.DataPadding};
    border-left: ${Setting.print.BorderWidth} solid ${Setting.print.BorderColor};
    min-width: max-content;
  }
  tr:nth-of-type(even) {
    background-color: ${Setting.print.EvenRowColor};
  }
  th {
    font-size: ${Setting.print.FontSize};
    border-bottom: ${Setting.print.BorderWidth} solid ${Setting.print.BorderColor};
  }
  .a {color: ${Setting.print.Column1Col}}
  .c {color: ${Setting.print.Column2Col}}
  .d {color: ${Setting.print.Column3Col}}
  .e {color: ${Setting.print.Column4Col}}
  .b {color: #ff7b72}
  .g {color: #656565da}
  .hol {
    width: max-content;
    height: max-content;
  }
  </style>`;
  let headers = "";
  let rows = "";
  if (TYPE === "SP") {
    for (let i = 0; i < DATA.length; i++) {
      let row = `<tr><td>${i + 1}</td>
            <td class="a">${DATA[i].name}</td>
            <td class="c">${DATA[i].level}</td>
            <td class="d">${DATA[i].remainsaosp}</td>
            <td class="e">${DATA[i].remainsgosp}</td></tr>`;
      rows = rows + row;
    }
    headers = `<th>SAO</th><th>SGO</th>`;
  } else {
    // Making non repeating array of dates
    let Dates = [];
    let cheque = [];
    DATA.forEach((el) => {
      el.data.forEach((ele) => {
        Dates.push(ele.payDate);
      });
    });

    // Making headers
    Dates = [...new Set(Dates)];
    for (let i = 0; i < 4; i++) {
      headers = headers + `<th>${Dates[i]}</th>`;
    }

    // sorting payCheque by dates
    for (let i = 0; i < DATA.length; i++) {
      for (let j = 0; j < 4; j++) {
        cheque[j] = 0;
        DATA[i].data.forEach((el) => {
          if (el.payDate == Dates[j]) {
            cheque[j] = cheque[j] + Number(el.amount);
          }
        });
      }
      let row = `<tr>
            <td>${i + 1}</td>
            <td class="a">${DATA[i].name}</td>
            <td class="d">${DATA[i].level}</td>
            <td class="${cheque[0] ? "e" : "b"}">
            ${cheque[0]}</td>
            <td class="${cheque[1] ? "e" : "b"}">
            ${cheque[1]}</td>
            <td class="${cheque[2] ? "e" : "b"}">
            ${cheque[2]}</td>
            <td class="${cheque[3] ? "e" : "b"}">
            ${cheque[3]}</td>
            </tr>`;
      rows = rows + row;
    }
  }
  var contentHtml = `
    ${style}
    <div class="hol">
    <h1>${FILENAME}</h1>
    <table><tbody><tr>
    <th>SNo</th>
    <th>Name</th>
    <th>Level</th>
    ${headers}
  </tr>${rows}</tbody></table><div>
<script>
  const content = document.querySelector('.hol');
  const contentWidth = content.clientWidth;
  const contentHeight = content.clientHeight;
  const style = "@page { size: " +contentWidth+"px "+contentHeight+"px}; margin: 0; }"
  document.getElementById('style').innerHTML = document.getElementById('style').innerHTML + style
  </script>`;
  return contentHtml;
}
