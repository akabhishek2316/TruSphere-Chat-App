# TruSphere

### Real-Time Messaging Application

TruSphere is a real-time messaging application built with **React Native, Expo, TypeScript, and Firebase**, focused on real-time communication, messaging, notifications, media sharing, and modern chat features.

## 📱 Try TruSphere

[Download Android APK](https://github.com/akabhishek2316/TruSphere-Chat-App/releases/latest)

> **Current Version:** `v1.1.0`  
> TruSphere is currently available as an Android application.

## 🚀 Key Features

- 💬 **Real-Time Messaging** — One-to-one chat with Firebase Realtime Database synchronization.
- ✓ **Message Status** — Sent, delivered, and read receipts with real-time updates.
- ℹ️ **Message Info** — View message delivery and read information.
- ↩️ **Message Actions** — Reply, reactions, copy, delete for me, and delete for everyone.
- 🟢 **Presence & Typing** — Online/offline status and real-time typing indicators.
- 🔔 **Push Notifications** — Firebase Cloud Messaging with a Node.js notification server using Firebase Admin SDK.
- 🖼️ **Media Sharing** — Image sharing with Cloudinary-based media uploads.
- 🎙️ **Voice Messaging** — Voice recording, playback, and message synchronization.
- ⏳ **Disappearing Messages** — Messages can automatically disappear after a selected duration.
- 🚫 **User Controls** — Block, unblock, clear chat, and delete chat options.
- 📞 **Calling** — Real-time voice/video calling is currently under development.
## 🛠️ Tech Stack

**Mobile:** React Native, Expo, TypeScript

**Backend & Services:** Firebase Authentication, Firebase Realtime Database, Firebase Cloud Messaging, Firebase Admin SDK, Node.js, Cloudinary

**Tools:** Git, GitHub, VS Code

## 🔄 How It Works

```text
User
 │
 ▼
TruSphere App
 │
 ├── Authentication
 ├── Real-Time Messages
 ├── Presence & Typing
 └── Media Messages
 │
 ▼
Firebase Realtime Database
 │
 └── Message / Chat Synchronization
 │
 ▼
Node.js Notification Server
 │
 ▼
Firebase Admin SDK
 │
 ▼
Firebase Cloud Messaging
 │
 ▼
Receiver Device
