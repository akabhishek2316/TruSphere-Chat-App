import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";


import { deleteSession } from "./sessionService";
import { auth } from "./firebase";


export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("User not found");
  }

  const credential =
    EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

  await reauthenticateWithCredential(
    user,
    credential
  );

  await updatePassword(
    user,
    newPassword
  );
}

export async function register(
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export async function login(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}


export async function sendResetPasswordEmail(
  email: string
) {
  return sendPasswordResetEmail(
    auth,
    email.trim()
  );
}



export async function logout() {
  const user = auth.currentUser;

  if (user) {
    await deleteSession(user.uid);
  }

  return signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}