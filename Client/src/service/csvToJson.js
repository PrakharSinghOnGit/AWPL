export function csvToJson(csvData) {
  const lines = csvData.split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].trim()] = currentLine[j].toString().toUpperCase().trim();
    }
    result.push(obj);
  }

  result.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  return result;
}
