
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";



import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";

import React, { useEffect, useState } from "react";

import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
} from "expo-audio";

type Props = {
  onStart: () => void;

  onStop: (
    uri: string,
    duration: number
  ) => void;
};

export default function VoiceRecorder({
  onStart,
  onStop,
}: Props) {


  const recorder = useAudioRecorder(
  RecordingPresets.HIGH_QUALITY
);

const [isRecording, setIsRecording] =
  useState(false);

const [seconds, setSeconds] =
  useState(0);



  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

  if (isRecording) {
    interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  return () => {
    clearInterval(interval);
  };
}, [isRecording]);


const recordingDuration =
  `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(
    seconds % 60
  ).padStart(2,"0")}`;


async function startRecording() {
  const permission =
    await AudioModule.requestRecordingPermissionsAsync();

  if (!permission.granted) {
    alert("Microphone permission denied");
    return;
  }

  await recorder.prepareToRecordAsync();

  recorder.record();

  setSeconds(0);

  setIsRecording(true);

  onStart();
}


async function stopRecording() {
  try {
    await recorder.stop();

    setIsRecording(false);

    const uri = recorder.uri;

    if (!uri) return;

    console.log("Recorded URI:", uri);

    onStop(uri, seconds);

  } catch (e) {
    console.log("VOICE ERROR =>", e);
  }
}

  return (
    <View style={styles.container}>
    {isRecording && (
        <>
          <View style={styles.dot} />

          <Text style={styles.timer}>
  {recordingDuration}
</Text>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.recordingButton,
        ]}
        onPress={
  isRecording
    ? stopRecording
    : startRecording
}
      >
        <Ionicons
          name={
  isRecording
    ? "stop"
    : "mic"
}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
    marginBottom:5,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 8,
  },

  timer: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
    color: Colors.text,
  },

  button: {
    width: 44,
    height: 44,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  recordingButton: {
    backgroundColor: "#E53935",
  },
});