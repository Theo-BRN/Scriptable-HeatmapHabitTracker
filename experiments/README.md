# Experiments

Small throwaway scripts that check how Scriptable behaves on a real device before we rely on it in `script.js`. Each experiment has its own folder with a `script.js` and a `README.md` covering how to run it, the raw results, and the conclusions.

## How to run an experiment
1. Create a folder here named after the experiment, with a `script.js` that tests one question.
2. On the iPhone, create a new Scriptable script and paste the code in.
3. Follow the steps in that experiment's README (widgets to add, parameters, what to tap).
4. Copy the output word for word (alert text, widget text) into that experiment's README with the date and the conclusions, then add a line to the index below.

## Index
| Experiment | Question | Key finding |
|---|---|---|
| [param-test](param-test/) | How does a per-widget habit name reach the script? | A plain tap (Run Script) receives `args.widgetParameter`. Setting `widget.url` makes it `null`. |
