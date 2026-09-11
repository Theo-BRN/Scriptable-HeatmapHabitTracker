// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: dumbbell;
// Scriptable Habit Tracker - John64 & Theo-BRN
// ==============================
// =- USER CONFIGURATION -=
// ==============================
const FOLDER_NAME = "Habits";
const HABIT_NAME = "Exercise";
const YEAR = 2026
const HABIT_FREQ = 3;
const PARTIAL_BLEND = 0.4;
const QUICK_TEST = false;

// Style configuration
const BG_COLOR_1 = new Color("#FFFFFF", 1.0);
const BG_COLOR_2 = new Color("#FFFFFF", 1.0);
const BG_GRADIENT_DIR = "BL-TR"; // T-B, B-T, L-R, R-L, TL-BR, TR-BL, BL-TR, BL-TR
const TEXT_COLOR = new Color("#fc6464");

// Grid colors for different states
const COLOR_FILLED = new Color("#fc6464", 1.0);
const COLOR_UNFILLED = new Color("#e0e0e0", 0.5);

// Partial-day appearance:
const PARTIAL_STYLE = "half-diagonal"; // "blend" | "inset" | "half-horizontal" | "half-vertical" | "half-diagonal"
const PARTIAL_INSET_SIZE = 4; // size of the centred mini-square (px), used by "inset"

// Fonts and layout constants
const FONT_REGULAR = new Font("Menlo", 12);
const FONT_BOLD = new Font("Menlo-Bold", 12);

// ============================
// =- ADVANCED CONFIGURATION -=
// ============================

// Date Configuration configured to end with current date
const END_DATE = new Date();
const USER_DATE_FORMAT = 2;

// Spacing and sizing
const WIDGET_WIDTH = 158;
const WIDGET_HEIGHT = 158;

const ELEMENT_SIZE = 9;
const ELEMENT_RADIUS = 2;
const ELEMENT_SPACING = 3.5;

// Padding around the widget
const PADDING_TOP = 13;
const PADDING_BOTTOM = 13;
const PADDING_HORIZONTAL = 6;
const PADDING_STATS_HEADER = 10; 

// ============================
// =- FUNCTIONS AND EXECUTION -=
// ============================

function blendColors(c1, c2, ratio) {
  const h1 = c1.hex.replace('#', '');
  const h2 = c2.hex.replace('#', '');
  const r = Math.round(parseInt(h1.slice(0,2),16)*ratio + parseInt(h2.slice(0,2),16)*(1-ratio));
  const g = Math.round(parseInt(h1.slice(2,4),16)*ratio + parseInt(h2.slice(2,4),16)*(1-ratio));
  const b = Math.round(parseInt(h1.slice(4,6),16)*ratio + parseInt(h2.slice(4,6),16)*(1-ratio));
  return new Color(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
}
const COLOR_PARTIAL = blendColors(COLOR_FILLED, COLOR_UNFILLED, PARTIAL_BLEND);

// Builds a single supersampled image for the half/diagonal partial styles.
// The widget cell's own cornerRadius clips this to rounded corners,
// so it stays visually consistent with the solid cells.
function partialCellImage(style) {
  const scale = 4;
  const S = ELEMENT_SIZE * scale;
  const ctx = new DrawContext();
  ctx.size = new Size(S, S);
  ctx.opaque = false;
  ctx.respectScreenScale = false;

  // base = unfilled
  ctx.setFillColor(COLOR_UNFILLED);
  ctx.fillRect(new Rect(0, 0, S, S));

  // filled portion
  ctx.setFillColor(COLOR_FILLED);
  const p = new Path();
  if (style === "half-horizontal") {
    p.addRect(new Rect(0, S / 2, S, S / 2));     // bottom half (swap to (0,0,S,S/2) for top)
  } else if (style === "half-vertical") {
    p.addRect(new Rect(0, 0, S / 2, S));         // left half (swap x to S/2 for right)
  } else if (style === "half-diagonal") {
    p.move(new Point(0, 0));                       // lower-left wedge
    p.addLine(new Point(0, S));
    p.addLine(new Point(S, S));
    p.closeSubpath();
  } else if (style === "inset") {
    const inset = PARTIAL_INSET_SIZE * scale;
    const off = (S - inset) / 2;
    const r = Math.min(ELEMENT_RADIUS * scale, inset / 2);
    p.addRoundedRect(new Rect(off, off, inset, inset), r, r);
  }
  ctx.addPath(p);
  ctx.fillPath();

  return ctx.getImage();
}

function wasFilledRecently(date, freq, habitData) {
  if (freq <= 1) return false;
  for (let i = 1; i < freq; i++) {
    const checkDate = new Date(date.getTime() - i * 86400000);
    const key = formatDate(checkDate, USER_DATE_FORMAT);
    if (habitData[key] === true) return true;
  }
  return false;
}

const FILE_NAME = `${HABIT_NAME} ${YEAR}.json`;
const FM = FileManager.iCloud();
const HABITS_DIR = FM.joinPath(FM.documentsDirectory(), FOLDER_NAME);

if (!FM.fileExists(HABITS_DIR)) {
  FM.createDirectory(HABITS_DIR);
}
const FILE_PATH = FM.joinPath(HABITS_DIR, FILE_NAME);

// Function to format date based on user preference
function formatDate(date, USER_DATE_FORMAT) {
    if (USER_DATE_FORMAT === 0) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${YEAR}-${month}-${day}`;
    } else if (USER_DATE_FORMAT === 1) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}/${YEAR}`;
    } else {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${YEAR}`;
    }
}

// Function to get today's date key
function getTodayKey() {
  return formatDate(new Date());
}

// Functions to load and save habit data
function loadHabitData() {
  if (FM.fileExists(FILE_PATH)) {
    const raw = FM.readString(FILE_PATH);
    try {
      return JSON.parse(raw);
    } catch (e) {
      FM.writeString(FILE_PATH + ".backup", raw);
      return {};
    }
  }
  return {};
}

// Function to save habit data
function saveHabitData(data) {
  FM.writeString(FILE_PATH, JSON.stringify(data, null, 2));
}

// Helper: ordinal suffix (1st, 2nd, 3rd, 7th…)
function ordinalSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  switch (n % 10) {
    case 1: return n + "st";
    case 2: return n + "nd";
    case 3: return n + "rd";
    default: return n + "th";
  }
}

// Helper: weekday name via Scriptable's DateFormatter
function weekdayName(date) {
  const df = new DateFormatter();
  df.dateFormat = "EEEE";
  return df.string(date);
}

// Helper: short month name (Jan, Feb…)
function monthName(date) {
  const df = new DateFormatter();
  df.dateFormat = "MMM";
  return df.string(date);
}

// Helper: label for a day given its offset from today (0 = today)
function labelForDayOffset(date, offset, refDate) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  let label = `${weekdayName(date)} ${ordinalSuffix(date.getDate())}`;
  if (refDate && date.getMonth() !== refDate.getMonth()) {
    label += " " + monthName(date);
  }
  return label;
}

// Edit previous data: looping menu, expands a week at a time via "Show more"
async function editPreviousData(data) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const STEP = 7;       // days added per "Show more" press
  const MAX_DAYS = 28;  // cap on how far back the menu goes
  let daysToShow = STEP;

  while (true) {
    const days = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(now.getTime() - i * 86400000);
      // Use getTodayKey() for today so it matches the widget-tap tick exactly
      const key = (i === 0) ? getTodayKey() : formatDate(d, USER_DATE_FORMAT);
      days.push({
        date: d,
        key: key,
        filled: data[key] === true,
        label: labelForDayOffset(d, i, now)
      });
    }

    const editAlert = new Alert();
    editAlert.title = "Edit previous data";

    const completed = days.filter(x => x.filled).map(x => x.label);
    editAlert.message = completed.length
      ? "Completed: " + completed.join(", ")
      : "No days completed";

    for (const day of days) {
      editAlert.addAction(day.filled ? `${day.label}  ✅` : day.label);
    }

    // "Show more" sits just below the day list, hidden once we hit the cap
    const canShowMore = daysToShow < MAX_DAYS;
    if (canShowMore) {
      editAlert.addAction(`Show ${STEP} more days`);
    }
    editAlert.addCancelAction("Done");

    const choice = await editAlert.presentAlert();

    if (choice < 0) break; // Done → exit loop

    if (canShowMore && choice === days.length) {
      // Show more pressed → grow the window and re-open
      daysToShow = Math.min(daysToShow + STEP, MAX_DAYS);
      continue;
    }

    // Otherwise a day was tapped → toggle it
    const day = days[choice];
    data[day.key] = !day.filled;
    saveHabitData(data);
  }
}

// Function to calculate habit statistics
function getHabitStats(habitData, startDate) {
  let maxStreak = 0;
  let currentStreak = 0;
  let filledCount = 0;

  const keys = Object.keys(habitData);
  if (keys.length === 0) {
    return { currentStreak: 0, maxStreak: 0, filledCount: 0, daysElapsed: 0 };
  }

  const dates = keys.map(k => {
    const p = k.split('/');
    return new Date(p[2], p[1] - 1, p[0]).getTime();
  });
  
  const lastTimestamp = Math.max(...dates);
  const lastDateInFile = new Date(lastTimestamp);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const daysToProcess = Math.floor((lastTimestamp - start.getTime()) / 86400000) + 1;

  for (let i = 0; i < daysToProcess; i++) {
    const checkDate = new Date(start.getTime() + i * 86400000);
    const key = formatDate(checkDate);
    const isFilled = habitData[key] === true;

    if (isFilled) {
      filledCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      if (checkDate.getTime() !== lastTimestamp) {
        currentStreak = 0;
      }
    }
  }

  return {
    currentStreak: currentStreak,
    maxStreak: maxStreak,
    filledCount: filledCount,
    daysElapsed: daysToProcess
  };
}

// Function to convert (row, col) to a flat grid index
function gridIndex(row, col, ROWS, COLUMNS) {
  // This gives us index 0 = today (bottom-right), 1 = yesterday, etc.
  return (COLUMNS - 1 - col) * ROWS + (ROWS - 1 - row);
}

// Function to figure out what date or null for a particular grid index given a grid index (0 = today)
function dateForGridIndex(index, endDate) {
  let date = new Date(endDate);
  let consumedGridCells = 0;
  let previousMonth = date.getMonth();

  while (consumedGridCells < index) {
    // Step back one real day
    date.setDate(date.getDate() - 1);
    consumedGridCells++;
    
    const currentMonth = date.getMonth();
    
    // Detect month change → insert 7 blank cells
    if (currentMonth !== previousMonth) {
      consumedGridCells += 7;
      
      // If the target index falls inside the gap → it's a blank cell
      if (consumedGridCells > index) {
        return null;
      }
      
      previousMonth = currentMonth;
    }
  }

  return date;
}

function dateForCell(row, col, ROWS, COLUMNS, END_DATE) {
  const index = gridIndex(row, col, ROWS, COLUMNS);
  return dateForGridIndex(index, END_DATE);
}

let PARTIAL_IMAGE = null;
if (PARTIAL_STYLE !== "blend") {
  PARTIAL_IMAGE = partialCellImage(PARTIAL_STYLE);
}

function applyPartial(square) {
  if (PARTIAL_STYLE === "blend") {
    square.backgroundColor = COLOR_PARTIAL;
  } else {
    square.backgroundImage = PARTIAL_IMAGE;
  }
}

// Function own version of the getHabitStats, so it's based on the visible days of the widget
function getVisibleDaysStats(ROWS, COLUMNS, END_DATE, HABIT_DATA) {
  let filledCount = 0;
  let daysCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  
  // Collect all the actual dates (not nulls) from the grid
  const visibleDates = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const dayDate = dateForCell(row, col, ROWS, COLUMNS, END_DATE);
      if (dayDate !== null) {
        visibleDates.push(dayDate);
      }
    }
  }
  
  // Sort oldest to newest
  visibleDates.sort((a, b) => a - b);
  
  // Count stats
  for (let i = 0; i < visibleDates.length; i++) {
    const date = visibleDates[i];
    const key = formatDate(date, USER_DATE_FORMAT);
    const isFilled = HABIT_DATA[key] === true;
    
    // Only count days up to today (not future days)
    if (date <= END_DATE) {
      daysCount++;
      
      if (isFilled) {
        filledCount++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }
  }
  
  return {
    currentStreak: currentStreak,
    maxStreak: maxStreak,
    filledCount: filledCount,
    daysElapsed: daysCount
  };
}

// Main execution
if (!config.runsInWidget && !QUICK_TEST) {
  const data = loadHabitData();
  const today = getTodayKey();
  const alreadyLogged = data[today] === true;

  if (!alreadyLogged) {
    // Not tracked yet today → tick today immediately, no menu
    data[today] = true;
    saveHabitData(data);
    Script.complete();
    return;
  }

  // Already tracked today → show the options menu
  const alert = new Alert();
  alert.title = HABIT_NAME;
  alert.message = "Today logged ✅";

  alert.addDestructiveAction("Remove today's data");
  alert.addAction("Edit previous data");
  alert.addAction("Format wizard (beta)");
  alert.addCancelAction("Cancel");

  const response = await alert.presentAlert();

  if (response === 0) {
    // Remove today's data
    data[today] = false;
    saveHabitData(data);
  } else if (response === 1) {
    // Edit previous data
    await editPreviousData(data);
  } else if (response === 2) {
    // Format wizard (beta) — not implemented yet
  }
  // response === -1 → Cancel, do nothing

  Script.complete();
  return;
}

const HABIT_DATA = loadHabitData();
const TODAY_KEY = getTodayKey();

const NOW = new Date();
const MS_PER_DAY = 86400000;
const DAYS_UNTIL_END = Math.max(0, Math.round((END_DATE - NOW) / MS_PER_DAY));


if (!(TODAY_KEY in HABIT_DATA)) {
  HABIT_DATA[TODAY_KEY] = false;
  saveHabitData(HABIT_DATA);
}

// Drawing the widget
const widget = new ListWidget();
widget.setPadding(PADDING_TOP, PADDING_HORIZONTAL, PADDING_BOTTOM, PADDING_HORIZONTAL);

const GRADIENT_DIRS = {
  "T-B":  { start: new Point(0.5, 0), end: new Point(0.5, 1) },
  "B-T":  { start: new Point(0.5, 1), end: new Point(0.5, 0) },
  "L-R":  { start: new Point(0, 0.5), end: new Point(1, 0.5) },
  "R-L":  { start: new Point(1, 0.5), end: new Point(0, 0.5) },
  "TL-BR": { start: new Point(0, 0),   end: new Point(1, 1)   },
  "TR-BL": { start: new Point(1, 0),   end: new Point(0, 1)   },
  "BL-TR": { start: new Point(0, 1),   end: new Point(1, 0)   },
  "BR-TL": { start: new Point(1, 1),   end: new Point(0, 0)   },
};
const dir = GRADIENT_DIRS[BG_GRADIENT_DIR] ?? GRADIENT_DIRS["TTB"];

const overlay = new LinearGradient();
overlay.locations = [0, 1];
overlay.colors = [BG_COLOR_1, BG_COLOR_2];
overlay.startPoint = dir.start;
overlay.endPoint = dir.end;
widget.backgroundGradient = overlay;

// Calculations for the grid layout
const TOTAL_ELEMENT_WIDTH = ELEMENT_SIZE + ELEMENT_SPACING;
const COLUMNS = Math.floor((WIDGET_WIDTH - (PADDING_HORIZONTAL * 2)) / TOTAL_ELEMENT_WIDTH);
const ROWS = 7; // Always 7 rows (days of week)

// Stats calculation
const stats = getVisibleDaysStats(ROWS, COLUMNS, END_DATE, HABIT_DATA);

// Header creation
const header = widget.addStack();
header.layoutHorizontally(); 
header.centerAlignContent();
header.spacing = 0;

header.addSpacer(); 
const titleText = header.addText(HABIT_NAME);
titleText.font = FONT_BOLD;
titleText.textColor = TEXT_COLOR;
header.addSpacer(); 

widget.addSpacer();

// Grid creation
const gridContainer = widget.addStack();
gridContainer.layoutHorizontally();
gridContainer.addSpacer(); 
const gridStack = gridContainer.addStack();
gridStack.layoutVertically();
gridContainer.addSpacer(); 

gridStack.spacing = ELEMENT_SPACING;

// LOGGING
console.log(`=== GRID LAYOUT INFO ===`);
console.log(`Total columns: ${COLUMNS}, Total rows: ${ROWS}`);
console.log(`Today's date: ${NOW.toDateString()}`);
console.log(`========================\n`);

for (let row = 0; row < ROWS; row++) {
  const rowStack = gridStack.addStack();
  rowStack.layoutHorizontally();
  rowStack.spacing = ELEMENT_SPACING;
  
  for (let col = 0; col < COLUMNS; col++) {
    const dayDate = dateForCell(row, col, ROWS, COLUMNS, END_DATE);
    
    // Create the square
    const square = rowStack.addStack();
    square.size = new Size(ELEMENT_SIZE, ELEMENT_SIZE);
    square.cornerRadius = ELEMENT_RADIUS;
    
    if (dayDate === null) {
      // Phantom cell - leave it transparent/empty
      square.backgroundColor = new Color("#000000", 0);
    } else {
      // Real day - apply normal logic
      const key = formatDate(dayDate, USER_DATE_FORMAT);
      const filled = HABIT_DATA[key] === true;
      const isToday = dayDate.toDateString() === NOW.toDateString();
      
if (filled) {
        square.backgroundColor = COLOR_FILLED;
      } else if (wasFilledRecently(dayDate, HABIT_FREQ, HABIT_DATA)) {
        applyPartial(square);
      } else {
        square.backgroundColor = COLOR_UNFILLED;
      }
    }
  }
}

widget.addSpacer();

// Footer creation
const footer = widget.addStack();
footer.layoutHorizontally(); 
footer.centerAlignContent();
footer.spacing = 0;

const leftFooterStack = footer.addStack();
leftFooterStack.layoutHorizontally();
leftFooterStack.setPadding(0, PADDING_STATS_HEADER+7, 0, 0); 
const streakFooterText = leftFooterStack.addText(`${stats.currentStreak}/${stats.maxStreak}`);
streakFooterText.font = FONT_REGULAR;
streakFooterText.textColor = new Color(TEXT_COLOR.hex, 0.7);
leftFooterStack.addSpacer(); 

footer.addSpacer(); 

const rightFooterStack = footer.addStack();
rightFooterStack.layoutHorizontally();
rightFooterStack.setPadding(0, 0, 0, PADDING_STATS_HEADER); 
rightFooterStack.addSpacer(); 

const progressFooterText = rightFooterStack.addText(`${stats.filledCount}/${stats.daysElapsed}`);
progressFooterText.font = FONT_REGULAR;
progressFooterText.textColor = new Color(TEXT_COLOR.hex, 0.7);

leftFooterStack.flexWeight = 1;
rightFooterStack.flexWeight = 1;

// Preview widget when running in app during debug
if (QUICK_TEST && !config.runsInWidget) {
  widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();