const fs = require('fs').promises;
const path = require('path');
const { jalaliToDilami } = require('./dilami.js');

async function dump(filepath, text) {
  try {
    await fs.writeFile(filepath, text, 'utf8');
  } catch (err) {
    throw new Error(`Error writing to file (${filepath}): ${err.message}`);
  }
}

async function getFilesInDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const filteredFiles = files.filter(file => {
      return file.startsWith('persian') && file.endsWith('.json');
    });
    const fullPaths = filteredFiles.map(file => path.join(directoryPath, file));
    return fullPaths;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
  }
}

async function generate (calendarsDir) {
  const files = await getFilesInDirectory(calendarsDir);
  const filepath = files[0];

  const jdata = await readJsonFile(filepath);
  const data = [];
  const filename = path.basename(filepath);
  const [minYear, maxYear] = filename.split('.')[0].split('_')[1].split('-');

  for (const year in jdata) {
    if (!jdata.hasOwnProperty(year)) continue;
    for (const month in jdata[year]) {
      if (!jdata[year].hasOwnProperty(month)) continue;
      for (const day in jdata[year][month]) {
        if (!jdata[year][month].hasOwnProperty(day)) continue;
        const value = jdata[year][month][day].split('-');
        const jyear = parseInt(value[0]);
        const jmonth = parseInt(value[1]);
        const jday = parseInt(value[2]);
        let [dyear, dmonth, dday] = jalaliToDilami(jyear,jmonth,jday);
        dyear = dyear.toString();
        dmonth = dmonth.toString().padStart(2, '0');
        dday = dday.toString().padStart(2, '0');
        const ddate = `${dyear}-${dmonth}-${dday}`;
        const gdate = `${year}-${month.padStart(2,'0')}-${day.padStart(2, '0')}`;
        jdata[year][month][day] = ddate;
        data.push(`${gdate},${ddate}`);
      }
    }
  }
  await dump(
    path.join(calendarsDir, `dilami_${minYear}-${maxYear}.json`),
    JSON.stringify(jdata),
  );
  await dump(
    path.join(calendarsDir, `dilami_${minYear}-${maxYear}.csv`),
    data.join('\n'),
  );

}

async function main () {
  const thisDir = __dirname;
  const calendarsDir = path.join(thisDir, 'calendars');
  await generate(calendarsDir);
}


main();
