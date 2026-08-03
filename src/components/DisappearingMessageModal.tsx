import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const OPTIONS = [
  {
    label: "Off",
    enabled: false,
    duration: null,
  },
  {
    label: "24 Hours",
    enabled: true,
    duration: 86400000,
  },
  {
    label: "7 Days",
    enabled: true,
    duration: 604800000,
  },
  {
    label: "30 Days",
    enabled: true,
    duration: 2592000000,
  },
  {
    label: "90 Days",
    enabled: true,
    duration: 7776000000,
  },
];

type Props = {
  visible: boolean;

  selectedDuration: number | null;

  onClose: () => void;

  onSelect: (
    enabled: boolean,
    duration: number | null
  ) => void;
};

export default function DisappearingMessageModal({
  visible,
  selectedDuration,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheet}
        >
          <Text style={styles.title}>
            Disappearing Messages
          </Text>

          <Text style={styles.subtitle}>
            New messages will disappear after the selected duration.
          </Text>

          {OPTIONS.map((item) => {
            const selected =
              item.duration === selectedDuration;

            return (
              <TouchableOpacity
                key={item.label}
                style={styles.item}
                onPress={() => {
                  onSelect(
                    item.enabled,
                    item.duration
                  );

                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.itemText,
                    selected && styles.selected,
                  ]}
                >
                  {item.label}
                </Text>

                {selected && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
  },

  item: {
    height: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemText: {
    fontSize: 17,
    color: "#111827",
  },

  selected: {
    color: "#2563EB",
    fontWeight: "700",
  },

  check: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
  },
});