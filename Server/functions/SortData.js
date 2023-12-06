const FILE_SYSTEM = require("fs");
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./config.json"));
const LEVELS = Setting.Miner.Levels;

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
export default SortData;
