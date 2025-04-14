# calstatic

Static version of all calendars supported by [ICU](https://icu.unicode.org/) + 1

- To test your calendar algorithm.
- To use where memory or network bandwidth is cheap.
- To reference any algorithmic issues to report to [ICU](https://icu.unicode.org/bugs).


The date range spans from the Unix epoch (1970-01-01) to the year 3000.
Each calendar file size is ~7MB (~1MB gzipped).

Each calendar has two output formats:
- **Flat CSV**: The first column is the Gregorian date, the second is the target calendar date.
- **Nested JSON**: Dates are accessible via `data[year][month][day]`.

All dates use the `YYYY-MM-DD` format.

**Notes:**
- **Chinese calendar**: Uses the Gregorian-related year.
- **Chinese calendar**: Leap months have a `bis` suffix.
- **Hebrew calendar**: Uses month names instead of numbers.
- **Dilami calendar** (not listed in ICU): Has 5 extra days, represented with `00` as the month number.

👉 [**DEMO**](https://meyt.github.io/calstatic)
