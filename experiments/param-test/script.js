// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: flask;
// Widget parameter test - how does a habit name reach the script?
//
// Set the widget's Parameter (long-press → Edit Widget → Parameter) to:
//   Exercise        → widget.url is set, so a tap opens ?habit=Exercise
//   Exercise|nourl  → no widget.url, so a tap uses "When Interacting" (Run Script)
//
// Things to check:
//   1. Two widgets, same script, different parameters → each shows its own name
//   2. Tap in URL mode    → alert shows queryParameters.habit
//   3. Tap in no-URL mode → does args.widgetParameter arrive, or is it null?
//   4. Run from the app with no parameter → shows a preview widget

const NO_URL_FLAG = "nourl";

const rawParam = args.widgetParameter;
const [habitPart, flag] = (rawParam ?? "").split("|");
const habit = habitPart.trim() || "Preview";
const useUrl = flag !== NO_URL_FLAG;

function timeNow() {
  const df = new DateFormatter();
  df.dateFormat = "HH:mm:ss";
  return df.string(new Date());
}

// ---------- Tapped / run in app: report what arrived ----------
if (config.runsInApp && (rawParam !== null || Object.keys(args.queryParameters).length > 0)) {
  const report = [
    `widgetParameter: ${JSON.stringify(rawParam)}`,
    `queryParameters: ${JSON.stringify(args.queryParameters)}`,
    `runsInApp: ${config.runsInApp}`,
    `runsInWidget: ${config.runsInWidget}`,
    `Script.name(): ${Script.name()}`,
    `time: ${timeNow()}`,
  ].join("\n");
  console.log(report);

  const alert = new Alert();
  alert.title = "Param test: tap received";
  alert.message = report;
  alert.addAction("OK");
  await alert.presentAlert();
  Script.complete();
  return;
}

// ---------- Widget (or preview from the app) ----------
const widget = new ListWidget();
widget.backgroundColor = new Color("#1c1c1e");
widget.setPadding(12, 12, 12, 12);

function line(text, size, color) {
  const t = widget.addText(text);
  t.font = new Font("Menlo", size);
  t.textColor = new Color(color);
  t.minimumScaleFactor = 0.6;
}

line(habit, 16, "#fc6464");
widget.addSpacer(6);
line(`param: ${JSON.stringify(rawParam)}`, 10, "#ffffff");
line(`mode: ${useUrl ? "url" : "no url"}`, 10, "#ffffff");
line(`family: ${config.widgetFamily ?? "n/a"}`, 10, "#ffffff");
widget.addSpacer();
line(`updated ${timeNow()}`, 9, "#8e8e93");

if (useUrl) {
  const scriptName = encodeURIComponent(Script.name());
  widget.url = `scriptable:///run/${scriptName}?habit=${encodeURIComponent(habit)}`;
  console.log(`widget.url = ${widget.url}`);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentSmall();
}
Script.complete();
