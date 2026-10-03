# 📺 Radyo TV Kuran — Canlı İslami Radyo & TV Uygulaması

Kuran kanallarını ve İslami radyo yayınlarını hem ses hem video olarak izleyip dinleyebileceğiniz bir Android uygulamasıdır.

## ✨ Özellikler

- 📡 Canlı Kuran TV kanalları (video stream)
- 🎙️ Canlı Kuran radyo istasyonları (ses akışı)
- 📱 Tab bazlı navigasyon (Expo Router)
- 🎵 Arka planda ses çalma (expo-audio)
- 🎬 Video oynatıcı (expo-video)
- 🌐 Tarayıcı içi bağlantı (expo-web-browser)
- 💾 Yerel depolama (AsyncStorage)
- 📤 Paylaşım desteği (expo-sharing)

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native (Expo) |
| Navigasyon | Expo Router (file-based routing) |
| Video | expo-video |
| Ses | expo-audio |
| Animasyon | react-native-reanimated |
| Font | expo-font |
| Dosya | expo-file-system |
| Platform | Android APK |

## 📋 Gereksinimler

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio
- Java 17+
- Android SDK 21+

## 🚀 Kurulum

```bash
npm install
npx expo start
```

### Android'de Çalıştırma
```bash
npx expo run:android
```

### APK Derleme
```powershell
.\apk_yap.ps1
# veya
.\apk_yap.bat
```

> ⚠️ **Not:** `.jdk21/` ve `cmdline-tools/` klasörleri proje dışında tutulmuştur.  
> Android SDK: [developer.android.com/studio](https://developer.android.com/studio)

## 📁 Proje Yapısı

```
├── app/              # Expo Router sayfalar (file-based routing)
├── components/       # Yeniden kullanılabilir bileşenler
├── constants/        # Sabitler (renkler, URL'ler)
├── assets/           # Görseller, fontlar
├── utils/            # Yardımcı fonksiyonlar
├── android/          # Native Android proje
└── package.json
```

## 📞 İletişim

<div align="center">

[![E-posta](https://img.shields.io/badge/E--posta-yazganbilisim2026@gmail.com-00b4d8?style=for-the-badge&logo=gmail&logoColor=white&labelColor=0d1117)](mailto:yazganbilisim2026@gmail.com)
[![Diğer Uygulamalarımız](https://img.shields.io/badge/Diğer_Uygulamalarımız-Tüm_Projeler-00b4d8?style=for-the-badge&logo=android&logoColor=white&labelColor=0d1117)](https://github.com/nihatyazgan1962?tab=repositories)

**Yazgan Bilişim**

</div>
