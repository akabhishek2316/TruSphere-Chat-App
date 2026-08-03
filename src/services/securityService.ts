import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "fingerprint_lock_enabled";

export async function setFingerprintEnabled(
  enabled: boolean
) {
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(enabled)
  );
}

export async function getFingerprintEnabled() {
  const value = await AsyncStorage.getItem(KEY);

  if (value === null) {
    return false;
  }

  return JSON.parse(value);
}