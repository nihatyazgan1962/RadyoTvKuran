# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native & Hermes & JNI
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.soloader.** { *; }

# Expo Modules (expo-video, expo-audio, expo-router, etc.)
-keep class expo.modules.** { *; }
-keepclassmembers class * {
    @expo.modules.core.interfaces.ExpoProp *;
    @expo.modules.core.interfaces.ExpoMethod *;
}

# AndroidX Media3 (used by expo-video & expo-audio)
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# react-native-reanimated & gesture-handler & screens
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

-dontwarn com.facebook.react.**
-dontwarn expo.modules.**
