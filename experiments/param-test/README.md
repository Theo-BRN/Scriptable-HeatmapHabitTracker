# param-test

[script.js](script.js) checks how a per-widget habit name reaches the script, both when the widget renders and when it's tapped.

## How to run
1. Paste `script.js` into a new Scriptable script named `param-test`.
2. Add two **small** Scriptable widgets, both set to Script → `param-test` and When Interacting → Run Script.
3. Set the Parameters:
   - Widget 1: `Exercise` (the script sets `widget.url`, so a tap opens `scriptable:///run/param-test?habit=Exercise`)
   - Widget 2: `Reading|nourl` (no `widget.url`, so a tap uses Run Script)
4. Check that each widget shows its own name, then tap each one and note the alert.

## Results: 2026-09-11, iPhone
**Rendering:** both widgets drew their own parameter. `args.widgetParameter` held the full raw string (`"Reading|nourl"`). `config.widgetFamily` was `small`.

**Tap on `Reading|nourl` (no URL):**
```
widgetParameter: "Reading|nourl"
queryParameters: {}
runsInApp: true
runsInWidget: false
Script.name(): param-test
```

**Tap on `Exercise` (with URL):**
```
widgetParameter: null
queryParameters: {"habit": "Exercise"}
runsInApp: true
runsInWidget: false
Script.name(): param-test
```

## Conclusions
- `args.widgetParameter` is available both when the widget renders **and** when a tap runs the script via When Interacting → Run Script. A plain tap is enough to know which habit was tapped.
- Setting `widget.url` overrides the tap. The script is launched through the URL scheme instead, `args.widgetParameter` is **`null`**, and data only arrives via `args.queryParameters`.
- Either way the tapped run is in-app (`runsInApp: true`), so Alerts work.
- `Script.name()` returns the script's name without `.js`.
