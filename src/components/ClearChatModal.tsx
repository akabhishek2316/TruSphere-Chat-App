import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";

type Props = {
  visible: boolean;

  onClose: () => void;

  onDeleteMe: () => void;

  onDeleteBoth: () => void;
};

export default function ClearChatModal({
  visible,
  onClose,
  onDeleteMe,
  onDeleteBoth,
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <Ionicons
            name="trash"
            size={42}
            color="#EF4444"
          />

          <Text style={styles.title}>
            Clear Chat
          </Text>

          <Text style={styles.subtitle}>
            Choose how you want to
            clear this conversation.
          </Text>

          <TouchableOpacity
            style={styles.option}
            onPress={onDeleteMe}
          >
            <Ionicons
              name="person"
              size={22}
              color="#2563EB"
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>
                Delete for Me
              </Text>

              <Text style={styles.optionSub}>
                Remove chat only
                from this device
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={onDeleteBoth}
          >
            <Ionicons
              name="people"
              size={22}
              color="#DC2626"
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>
                Delete for Both
              </Text>

              <Text style={styles.optionSub}>
                Permanently remove
                chat for both users
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancel}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,.45)",
    justifyContent:"center",
    padding:25
  },

  card:{
    backgroundColor:"#fff",
    borderRadius:24,
    padding:24,
    alignItems:"center"
  },

  title:{
    fontSize:24,
    fontWeight:"700",
    marginTop:10
  },

  subtitle:{
    marginTop:8,
    textAlign:"center",
    color:"#666",
    marginBottom:25
  },

  option:{
    width:"100%",
    flexDirection:"row",
    alignItems:"center",
    padding:18,
    borderRadius:16,
    backgroundColor:"#F7F7F7",
    marginBottom:15,
    gap:15
  },

  optionTitle:{
    fontSize:17,
    fontWeight:"700"
  },

  optionSub:{
    color:"#666",
    marginTop:3
  },

  cancel:{
    marginTop:8
  },

  cancelText:{
    color:"#2563EB",
    fontWeight:"700",
    fontSize:16
  }
});