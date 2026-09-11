# TODO

## Next: single-script, JSON-config redesign
One script for multiple habits. Each habit's configuration settings are stored in JSON instead of edited constants, and will be editable via a config wizard. 

Decided:
- [ ] **Habit chosen by widget parameter**: the widget's Parameter field sets the habit name, which decides which files are loaded. Tapping passes the name back through `widget.url` (`scriptable:///run/<Script>?habit=<Name>`).
  - [ ] First, test this on a phone with [experiments/param-test.js](experiments/param-test.js).
- [ ] **Two files per habit**: a config file and a data file. Proposed layout is one folder per habit (`Habits/<Habit>/config.json` + `Habits/<Habit>/data.json`), so renaming a habit means renaming one folder.
- [ ] **Drop the per-year split**: one data file per habit, with `YYYY-MM-DD` keys built from each date's own year. This matches John's `USER_DATE_FORMAT = 0`. It fixes the year-boundary bug below.
- [ ] **Migration** of existing `<Habit> <Year>.json` files into the new format:
  - Merge all the year files for a habit into one data file. If both files have the same date, `true` wins.
  - Rewrite keys to `YYYY-MM-DD`, assuming the old format was DD/MM/YYYY (`USER_DATE_FORMAT = 2`, the default). Nobody has changed it, so there's no need to ask.
  - Drop `false` entries and any dates in the future. Days saved under the wrong year by the old bug are acceptable losses, but future-dated ones would otherwise show up as ticked when that date arrives.
  - Settings live in the old script's constants, not a file, so they can't be migrated automatically. Start from defaults and adjust them in the wizard.
  - Show a preview before writing anything, and keep the old files.
- [ ] **Format wizard = config editor**: the in-app menu for creating a habit and changing its settings (name, frequency, colours, partial style, gradient).

## Bugs / cleanup
- [ ] **Year-boundary bug**: `formatDate` builds keys from the `YEAR` constant instead of `date.getFullYear()`. In January, December days (and the month gap across the new year) get the wrong key. ([script.js:128](script.js#L128)) John has already fixed this upstream.
- [ ] **Port John-64's iCloud fix**: upstream now awaits `FM.downloadFileFromiCloud()` before reading or writing. Without it, a data file that isn't downloaded yet can fail to read or write (upstream commit `5e5e3b2`).
- [ ] `getTodayKey()` calls `formatDate` without `USER_DATE_FORMAT`. It only works because the default format is 2. ([script.js:145](script.js#L145))
- [ ] `getHabitStats` is unused. It also calls `formatDate` without a format and parses keys as DD/MM. Remove it or fix it. ([script.js:265](script.js#L265))
- [ ] The gradient fallback uses the key `"TTB"`, which doesn't exist (should be `"T-B"`). The config comment lists `BL-TR` twice instead of `BR-TL`. ([script.js:18](script.js#L18), [script.js:483](script.js#L483))
- [ ] Unused variables: `DAYS_UNTIL_END`, `isToday`. Also fix the indentation at [script.js:552](script.js#L552).

## Features
- [ ] **Format wizard (beta)**: the menu item exists, but tapping it does nothing yet. ([script.js:447](script.js#L447)) It becomes the config editor as part of the redesign above.
