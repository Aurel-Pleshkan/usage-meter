# usage-meter

A Claude Code mod that shows how much of your Claude subscription limits you have used and how much is left, in percent: the 5-hour window and the weekly window, each with a progress bar and the time until it resets.

```
5ч      ███░░░░░░░ 27% исп. / 73% осталось · сброс 2ч 14м
Неделя  ██████░░░░ 58% исп. / 42% осталось · сброс 3д 5ч
```

- A row above the prompt with both windows
- The same figures in the status line
- Yellow from 75%, red and a toast from 90%
- Updates after every reply and whenever a window moves by 1%

The windows appear after the first reply in a session. On API (pay-as-you-go) billing there are no such windows, so nothing is shown.

## Install

At the prompt of a terminal session:

```
/plugin install usage-meter --marketplace Aurel-Pleshkan/usage-meter
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install usage-meter --marketplace Aurel-Pleshkan/usage-meter
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `Aurel-Pleshkan/usage-meter`, then Add plugin.

## License

MIT
