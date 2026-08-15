# TruSphere

### Real-Time Messaging Application

TruSphere is a real-time messaging application built with **React Native, Expo, TypeScript, and Firebase**, focused on real-time communication, messaging, notifications, media sharing, and modern chat features.

## 🚀 Key Features

- 💬 **Real-Time Messaging** — One-to-one chat with Firebase Realtime Database synchronization.
- ✓ **Message Status** — Sent, delivered, and read receipts with real-time updates.
- 🟢 **Presence & Typing** — Online/offline status and real-time typing indicators.
- 🔔 **Push Notifications** — Firebase Cloud Messaging with a Node.js notification server using Firebase Admin SDK.
- 🖼️ **Media Sharing** — Image sharing with Cloudinary-based media uploads.
- 🎙️ **Voice Messaging** — Voice recording, playback, and message synchronization.
- ↩️ **Message Actions** — Reply, delete for everyone, unread tracking, and disappearing messages.
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