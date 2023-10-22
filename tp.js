const axios = require("axios");
const { readFileSync } = require("fs");
const Setting = JSON.parse(readFileSync("./Settings.json"));
const csvtojson = require("csvtojson");
const url = Setting.Links["TOPAZ AND ABOVE"];

(async () => {
  const csv = await axios.get(url);
  const Data = await csvtojson().fromString(csv.data);
  let MinedData = JSON.parse(readFileSync("./TOPAZ AND ABOVE.json", "utf-8"));

  const NotMined = Data.map((item) => item.name).filter(
    (name) => !MinedData.map((item) => item.name).includes(name)
  );
  console.log(NotMined);
})();
