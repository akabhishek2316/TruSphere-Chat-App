import * as LocalAuthentication from "expo-local-authentication";

export async function isBiometricSupported() {
  const hasHardware =
    await LocalAuthentication.hasHardwareAsync();

  const isEnrolled =
    await LocalAuthentication.isEnrolledAsync();

  return hasHardware && isEnrolled;
}

export async function authenticateUser() {
  return await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock TruSphere",
    cancelLabel: "Cancel",
    fallbackLabel: "Use Device PIN",
    disableDeviceFallback: false,
    requireConfirmation: false,
  });
}