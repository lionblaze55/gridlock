plugins { id("com.android.application") }
android {
    namespace = "com.gridlock.sanvarro"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.gridlock.sanvarro"
        minSdk = 24
        targetSdk = 35
        versionCode = 79
        versionName = "1.77"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            // Signed with the debug key so the release APK installs directly. Replace with your own keystore for store publishing.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    androidResources { noCompress += listOf("html") }
}
