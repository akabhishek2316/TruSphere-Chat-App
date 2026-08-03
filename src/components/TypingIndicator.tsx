import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

type Props = {
  visible: boolean;
  recording?: boolean;
};

export default function TypingIndicator({
  visible,
  recording,
}: Props) {
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);
  const d3 = useSharedValue(0.3);

  useEffect(() => {
    if (!visible) return;

    d1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 250 }),
        withTiming(0.3, { duration: 250 })
      ),
      -1,
      false
    );

    setTimeout(() => {
      d2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 250 }),
          withTiming(0.3, { duration: 250 })
        ),
        -1,
        false
      );
    }, 150);

    setTimeout(() => {
      d3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 250 }),
          withTiming(0.3, { duration: 250 })
        ),
        -1,
        false
      );
    }, 300);
  }, [visible]);

  const s1 = useAnimatedStyle(() => ({
    opacity: d1.value,
  }));

  const s2 = useAnimatedStyle(() => ({
    opacity: d2.value,
  }));

  const s3 = useAnimatedStyle(() => ({
    opacity: d3.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Ionicons
  name={
    recording
      ? "mic"
      : "ellipsis-horizontal-circle-outline"
  }
  size={14}
  color={Colors.primary}
/>

      <Text style={styles.typingText}>
  {recording
    ? "Recording audio..."
    : "Typing..."}
</Text>

      <Animated.Text
        style={[styles.dot, s1]}
      >
        .
      </Animated.Text>

      <Animated.Text
        style={[styles.dot, s2]}
      >
        .
      </Animated.Text>

      <Animated.Text
        style={[styles.dot, s3]}
      >
        .
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    marginLeft: 4,
    fontSize: 13,
    color: Colors.primary,
    fontStyle: "italic",
    fontWeight: "500",
  },

  dot: {
    fontSize: 18,
    color: Colors.primary,
    marginLeft: 1,
    marginTop: -3,
    fontWeight: "700",
  },

  typingText: {
  color: Colors.primary,
  fontSize: 13,
  fontStyle: "italic",
  marginLeft: 6,
},
});