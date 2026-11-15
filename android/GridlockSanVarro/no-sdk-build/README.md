# Building the APK without the Android SDK

`build_apk.py` writes a complete, signed APK with only Python 3 and the `cryptography` package:
a tiny WebView launcher (hand-written Dalvik bytecode), a binary manifest, a one-icon resource
table, and an APK Signature Scheme v2 signature.

    python3 build_apk.py ../app/src/main/assets/index.html \
        ../app/src/main/res/mipmap-xxxhdpi/ic_launcher.png Gridlock-SanVarro.apk signing <versionCode> <versionName>
    python3 check_apk.py Gridlock-SanVarro.apk     # independent structure + signature check

Keep the `signing/` folder: Android only installs an update over an existing app when it is
signed with the same key. Raise versionCode each release.

Compared with the Gradle build in `../app`, this launcher has no LAN *hosting* bridge
(joining a LAN game still works) and no onDestroy cleanup. The Gradle build is signed with a
different key, so uninstall one before installing the other.
