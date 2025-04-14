const fs = require('fs').promises;
const path = require('path');

async function mkdir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory (${dirPath}):`, err);
  }
}

async function dump(filepath, text) {
  try {
    await fs.writeFile(filepath, text, 'utf8');
  } catch (err) {
    throw new Error(`Error writing to file (${filepath}): ${err.message}`);
  }
}

function Formatter(calendar='gregory') {
  const formatter = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  this.format = function (date) {
    const parts = formatter.formatToParts(date);
    const jparts = {};
    for (const part of parts) {
      jparts[part.type] = part.value;
    }
    if (typeof jparts.year === 'undefined') {
      if (typeof jparts.relatedYear !== 'undefined') {
        jparts.year = jparts.relatedYear
        if (typeof jparts.yearName !== 'undefined') {
          jparts.year += ` (${jparts.yearName})`
        }
      }
    }
    return `${jparts.year}-${jparts.month}-${jparts.day}`;
  }
}

async function generate (yearMin, yearMax, calendars, calendarsDir) {
  const current = new Date(`${yearMin}-01-01T00:00:00`);
  const end = new Date(`${yearMax}-01-01T00:00:00`);
  const data = {};
  const jdata = {};
  const fmt = { gregory: new Formatter('gregory') };
  for (const calendar of calendars) {
    data[calendar] = [];
    jdata[calendar] = {};
    fmt[calendar] = new Formatter(calendar);
  };

  while (current <= end) {
    const gYear = current.getFullYear();
    const gMonth = current.getMonth() + 1; // JS months are 0-indexed
    const gDay = current.getDate();
    for (const calendar of calendars) {
      const gdate = fmt.gregory.format(current);
      const cdate = fmt[calendar].format(current);
      data[calendar].push(`${gdate},${cdate}`);

      if (typeof jdata[calendar][gYear] === 'undefined') {
        jdata[calendar][gYear] = {}
      }
      if (typeof jdata[calendar][gYear][gMonth] === 'undefined') {
        jdata[calendar][gYear][gMonth] = {}
      }
      jdata[calendar][gYear][gMonth][gDay] = cdate;
    };
    current.setDate(current.getDate() + 1);
  }

  for (const calendar of calendars) {
    const filename = `${calendar}_${yearMin}-${yearMax}.csv`;
    const jfilename = `${calendar}_${yearMin}-${yearMax}.json`;
    await dump(path.join(calendarsDir, filename), data[calendar].join('\n'));
    await dump(path.join(calendarsDir, jfilename), JSON.stringify(jdata[calendar]));
  };
}

async function main () {
  const calendars = [
    'buddhist', 'chinese',
    'coptic', 'dangi',
    'ethioaa', 'ethiopic',
    'hebrew', 'indian',
    'islamic', 'islamic-civil',
    'islamic-rgsa', 'islamic-tbla',
    'islamic-umalqura', 'japanese',
    'persian', 'roc',
  ];
  const yearMin = 1970;
  const yearMax = 3000;
  const thisDir = __dirname;
  const calendarsDir = path.join(thisDir, 'calendars');
  await mkdir(calendarsDir);
  await generate(yearMin, yearMax, calendars, calendarsDir);
}


main();
