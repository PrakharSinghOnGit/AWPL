import { csvToJson } from "./csvToJson";

async function fetchData(link) {
  const response = await fetch(link);
  const csvData = await response.text();
  const jsonData = csvToJson(csvData);
  return jsonData;
}

export default fetchData;
