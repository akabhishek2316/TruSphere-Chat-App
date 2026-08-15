# TruSphere

TruSphere is a real-time messaging application built with React Native and Expo, focused on real-time communication, chat features, media sharing, notifications, and a modern mobile experience.

## Features

- Real-time one-to-one messaging
- Firebase Authentication
- Firebase Realtime Database synchronization
- Online / offline presence
- Typing indicators
- Sent / delivered / read message status
- Unread message tracking
- Reply to messages
- Delete for everyone
- Disappearing messages
- Image sharing
- Voice messaging
- Push notifications with Firebase Cloud Messaging
- Node.js notification server with Firebase Admin SDK
- Cloudinary-based media uploads
- Chat state synchronization
- Real-time voice/video calling — currently under development

## Tech Stack

**Mobile:** React Native, Expo, TypeScript

**Backend & Services:** Firebase Authentication, Firebase Realtime Database, Firebase Cloud Messaging, Firebase Admin SDK, Node.js, Cloudinary

**Tools:** Git, GitHub, VS Code

## Notification Architecture

```text
TruSphere App
      |
      v
Node.js Notification Server
      |
      v
Firebase Admin SDK
      |
      v
Firebase Cloud Messaging
      |
      v
Receiver Device
```

## Messaging Flow

1. User sends a message from the chat screen.
2. The message is synchronized through Firebase Realtime Database.
3. The receiver receives the message in real time.
4. Message state is tracked through sent, delivered, and read states.
5. Presence and typing information are synchronized in real time.
6. Firebase Cloud Messaging handles push notifications.
7. Images and other media use Cloudinary for uploads.

## Media Support

- Image messages
- Voice messages
- Captions and message metadata
- Cloudinary media uploads

## Project Status

**Active Development**

### Implemented

- Real-time messaging
- Authentication
- Online/offline presence
- Typing indicators
- Delivery/read status
- Push notifications
- Image sharing
- Voice messaging
- Disappearing messages
- Message management

### In Progress

- Real-time voice/video calling

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo development environment
- Android Studio or an Android device for Android development

### Installation

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
npm install
npx expo start
```

For Android development, use the project's configured Expo development workflow.

## Environment Variables

The project uses environment variables for Firebase, Cloudinary, and other configuration values.

Do not commit `.env` files, private keys, or secret credentials to GitHub.

## Security

Before production deployment:

- Configure Firebase Realtime Database security rules properly.
- Protect private server credentials.
- Never commit secrets to GitHub.
- Validate authenticated users before protected database operations.

## Author

**Abhishek Kumar**

Computer Science & Engineering Student

GitHub: https://github.com/akabhishek2316
