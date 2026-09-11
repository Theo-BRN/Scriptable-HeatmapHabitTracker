> **This is a fork.** The original widget is [John-64/Scriptable-HeatmapHabitTracker](https://github.com/John-64/Scriptable-HeatmapHabitTracker). All credit for the original design and code goes to John-64.
>
> This version is maintained by [Theo-BRN](https://github.com/Theo-BRN). Grab [`script.js`](script.js) from the `theo` branch to get it. Most of the changes in this fork were written by LLMs, with design direction and oversight from Theo.
>
> **What this version adds:**
> - **Habit frequency & partial days**: set `HABIT_FREQ` (e.g. 3 = every 3 days). Days inside the window after a completion show as "partial", in one of these styles: `blend`, `inset`, `half-horizontal`, `half-vertical` or `half-diagonal`.
> - **Month gaps**: a blank column separates each month in the grid.
> - **Tap-to-log menu**: running the script ticks today straight away. If today is already logged, you get a menu to remove today or edit the previous 7–28 days.
> - **Gradient background**: `BG_COLOR_1`, `BG_COLOR_2` and `BG_GRADIENT_DIR`.
> - **Stats based on the visible grid**: current/max streak and completed/elapsed, counted from the days shown in the widget.
>
> **Limitations:** this version is built for the **small** widget only. The layout is hard-coded to a 158×158 widget (`WIDGET_WIDTH` / `WIDGET_HEIGHT`), so it probably won't look right as a medium or large widget.
>
> See [TODO.md](TODO.md) for what's planned.

# Scriptable - Heatmap habit tracker
A Scriptable widget for visualizing habit tracking data as a heatmap, featuring a streak counter (current/max streak) and a tracker for the total number of completed habits versus the total planned.

<p align="center">
  <img src="media/widget.jpg" alt="Habit Tracker Widget" width="50%"/>
</p>

## Setup and Installation
1. Install **Scriptable** from the App Store
2. **Create a new script** and paste the code provided in the [script](script.js) file
3. Modify the _user configuration_ section in the script to set your habit name (`HABIT_NAME`), year (`YEAR`), frequency (`HABIT_FREQ`) and, if you want, different styles
4. Add the widget to your home screen with **small** size and start to track your habit. Tap the widget to log today.

Habit data is stored in iCloud under `Scriptable/Habits/<Habit name> <Year>.json`.
