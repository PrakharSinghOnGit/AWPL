const DATA = [
  { name: "MAINPAL SINGH", id: "402A1A6", pass: "4229" },
  { name: "HITESH JOSHI", id: "8200FBD", pass: "2014" },
  { name: "MUKESH SANGELA", id: "BC392CB", pass: "2026" },
  { name: "SD VYAS", id: "D556491", pass: "1312" },
  { name: "RAJENDER VYAS", id: "77A8020", pass: "1905" },
  { name: "HARISH SORARI", id: "A606E52", pass: "1976" },
  { name: "RAJESH GIRI", id: "61D0679", pass: "7123" },
  { name: "VIJAY SHANKAR", id: "3811F28", pass: "V123" },
  { name: "DHARAMVIR", id: "BB1C650", pass: "7088" },
  { name: "SANJAY UNIYAL", id: "2DDF976", pass: "1846" },
  { name: "SUNIL PANT", id: "DE2B804", pass: "2482" },
  { name: "DN PANDEY", id: "45C8BBA", pass: "9898" },
  { name: "VINOD BISHT", id: "95CF50F", pass: "3404" },
  { name: "MULKRAJ", id: "7D5763A", pass: "9840" },
  { name: "RAVINDER SINGH", id: "16A677B", pass: "9735" },
  { name: "KUSH KUMAR", id: "6D9DE5B", pass: "7867" },
  { name: "NANDANI KUMARI", id: "DFA6AE3", pass: "2233" },
  { name: "ANITA MODI", id: "8E6D5B9", pass: "1999" },
  { name: "SHANKAR RATHORE", id: "E914CC7", pass: "7018" },
  { name: "ANITA KAPRI", id: "29E0A9F", pass: "1084" },
  { name: "GEETA DEVI", id: "D2B3162", pass: "1705" },
  { name: "GIRISH ANDOLA", id: "BA430D7", pass: "2000" },
  { name: "JAGDISH SARAN", id: "737B78C", pass: "3668" },
  { name: "ANJU DASMANA", id: "96FF643", pass: "2482" },
  { name: "JAGAT SINGH RAWAT", id: "2187C96", pass: "1506" },
  { name: "SUSHIL PANWAR", id: "5008462", pass: "3126" },
  { name: "BALVINDER SINGH", id: "A7C6E31", pass: "2482" },
  { name: "DEEPANSHU", id: "0EC9985", pass: "8958" },
  { name: "SATISH SINGH", id: "6F92A99", pass: "1035" },
];

console.table(DATA);

let longestName = "";
for (let i = 0; i < DATA.length; i++) {
  if (DATA[i].name.length > longestName.length) {
    longestName = DATA[i].name;
  }
}

for (let i = 0; i < DATA.length; i++) {
  console.log(DATA[i].name.padEnd(longestName.length, " ") + "│");
}
