# Gridlock: San Varro — Android app

A full-screen Android wrapper around the single-file game (`app/src/main/assets/index.html`).
Landscape, immersive mode, saves via localStorage, Android back button opens the pause menu / closes dialogs,
and the game auto-pauses and saves when you switch apps.

## Get an APK without installing anything (GitHub)
1. Create a new GitHub repository and upload the contents of this folder (keep the `.github` folder).
2. Open the **Actions** tab → **Build APK** runs automatically (or press *Run workflow*).
3. When it finishes (~4 min), download the **Gridlock-apk** artifact → unzip → `app-release.apk`.
4. Copy it to your phone and open it (allow "Install unknown apps" for your file manager/browser).

## Or build locally
- **Android Studio:** File → Open → this folder → Build → Build APK(s).
- **Command line** (Android SDK installed, `ANDROID_HOME` set): `./gradlew assembleRelease`
  → `app/build/outputs/apk/release/app-release.apk`

The release build is signed with the standard debug key so it installs directly.
For the Play Store, create your own keystore and set it in `app/build.gradle.kts`.

## Updating the game
Replace `app/src/main/assets/index.html` with a newer `gridlock.html` and rebuild. Bump `versionCode` to install over the old version.

## LAN multiplayer
In the app: Multiplayer -> **Host a LAN game**. The app shows an address like `192.168.1.20:8080`. Friends on the same Wi-Fi (or your hotspot) either type it under **Join LAN** in their app, or simply open `http://192.168.1.20:8080` in any browser - the host phone serves the game to them.
To host from a computer instead: put `lan-server.js` next to `gridlock.html` and run `node lan-server.js`.

## Notes
- Online room codes only work in the Claude-hosted version of the game. The app and the standalone HTML file use LAN multiplayer.
- Fonts load from Google Fonts when online; offline it falls back to system fonts.
