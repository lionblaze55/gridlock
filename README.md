# Gridlock: San Varro

A 2D top-down open-world crime game in the style of the classic top-down GTA games, built for phones and the browser. It ships as a single self-contained HTML file and as an Android app, with optional online room multiplayer.

**Current version: 1.79**

## Play

Open `gridlock.html` in any modern browser. It runs fully offline, with touch controls on phones and keyboard/mouse on desktop.

## What's in the game

- **City and countryside:** a city, farmland and docks, with traffic, pedestrians, weather, a day/night cycle and radio.
- **Cars:** stealing (lock picking, hotwiring, alarms), garages per property, a modular workshop where every part has its own condition, wear, repairs and slow DIY fixes, a mod shop, insurance and towing.
- **Marketplace:** buy and sell cars and parts, meet in person, inspect cars, haggle, and deal with scammers.
- **Crime and law:** wanted levels, witnesses, surrender and arrest, fines, police who also go after violent NPCs, and security that throws troublemakers out.
- **Work and business:** jobs, street gigs, missions, heists, property, businesses, clubs, farms and drug labs.
- **Weapons:** including a gun workshop.

## Build

The game is written as plain JavaScript files in `src/`, which are concatenated into one HTML file:

```
python3 tools/build.py        # writes gridlock.html
```

The load order is the file list in `tools/build.py`. Later files override earlier ones: a function is renamed in its original file and wrapped in a later one.

### Android

`android/GridlockSanVarro/` is an Android Studio project that loads the game from `app/src/main/assets/index.html`. To update it:

```
cp gridlock.html android/GridlockSanVarro/app/src/main/assets/index.html
```

Then build from Android Studio. You can also use `tools/build_apk.py` to build a signed APK without Gradle (it needs your own keystore) and `tools/check_apk.py` to check it.

### LAN / online

`lan/` holds a small LAN server (`lan-server.js`) and its copy of the game.

## Tests

`tests/` holds Playwright scripts used during development. Each `.js` file runs inside the game page:

```
pip install playwright && playwright install chromium
python3 tests/run.py tests/smoke.js
```

Set `CHROME=/path/to/chrome` to use a specific browser, and `HTML=/path/to/gridlock.html` to test a different build. The older scripts in `tools/test*.py` still contain absolute paths from the original development machine.

## License

Copyright (C) 2026 lionblaze55

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See [LICENSE](LICENSE) for the full text of the GNU General Public License v3.
