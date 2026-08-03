import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

const DEVICE_KEY = "DEVICE_ID";

export async function getDeviceId() {
  let deviceId = await AsyncStorage.getItem(DEVICE_KEY);

  if (!deviceId) {
    deviceId = uuid.v4().toString();
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  }

  return deviceId;
}