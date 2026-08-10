import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import Waveform from "./Waveform";
import { Colors } from "../theme/colors";
import { MessageStatus } from "../types/chat";

type Props = {
  voiceUrl: string;
  duration: number;
  status?: MessageStatus;
};

export default function VoicePlayer({
  voiceUrl,
  duration,
  status,
}: Props) {
  const [sound, setSound] =
    useState<Audio.Sound | null>(null);
  const [progress, setProgress] = useState(0);

  const [playing, setPlaying] =
    useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  async function togglePlay() {
    try {
      if (playing && sound) {
        await sound.pauseAsync();
        setPlaying(false);
        return;
      }

      if (sound) {
        await sound.playAsync();
        setPlaying(true);
        return;
      }

      const { sound: newSound } =
        await Audio.Sound.createAsync({
          uri: voiceUrl,
        });

      setSound(newSound);

      setPlaying(true);

      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        if (status.durationMillis) {
          setProgress(
            status.positionMillis / status.durationMillis
          );

          setCurrentTime(
            Math.floor(status.positionMillis / 1000)
          );
        }

        if (status.didJustFinish) {
          setPlaying(false);
          setProgress(0);
          setCurrentTime(0);

          newSound.unloadAsync();
          setSound(null);
        }
      });

    } catch (e) {
      console.log("VOICE ERROR", e);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (status === "sending") {
    return (
      <View style={styles.container}>
        <Ionicons
          name="cloud-upload-outline"
          size={22}
          color="#2563EB"
        />

        <Text
          style={{
            marginLeft: 10,
            color: "#2563EB",
            fontWeight: "600",
          }}
        >
          Uploading...
        </Text>
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View style={styles.container}>


        <Ionicons
          name="mic"
          size={24}
          color="#EF4444"
        />



        <View style={styles.waveSection}>
          <Waveform progress={0} />

          <Text style={styles.duration}>
            {`${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(
              duration % 60
            ).padStart(2, "0")}`}
          </Text>
        </View>


      </View>
    );
  }

  const bars: number[] = [
    8, 15, 24, 18, 10,
    20, 28, 14, 9, 23,
    18, 27, 13, 8, 22,
    30, 17, 11,
  ];



  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlay}>
        <Ionicons
          name={playing ? "pause" : "play"}
          size={26}
          color={Colors.primary}
        />
      </TouchableOpacity>

      <View style={styles.waveSection}>
        <Waveform progress={progress} />

        <Text style={styles.duration}>
          {`${String(
            Math.floor((playing ? currentTime : duration) / 60)
          ).padStart(2, "0")}:${String(
            (playing ? currentTime : duration) % 60
          ).padStart(2, "0")}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({


  bar: {
    width: 3,
    borderRadius: 3,
    backgroundColor: "#CFCFCF",
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },

  waveSection: {
    flex: 1,
    marginLeft: 10,
  },

  duration: {
    marginTop: 5,
    marginLeft: 2,
    fontSize: 11,
    color: "#6B7280",
  },

  failed: {
    flexDirection: "column",
    gap: 5,
  },
  time: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
});