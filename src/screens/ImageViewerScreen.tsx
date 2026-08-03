import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import ImageViewer from "react-native-image-zoom-viewer";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";

export default function ImageViewerScreen() {

  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const { image } = route.params;

  return (

    <SafeAreaView style={styles.container}>

      <ImageViewer

        imageUrls={[
          {
            url: image,
          },
        ]}

        enableSwipeDown

        onSwipeDown={() => navigation.goBack()}

        onCancel={() => navigation.goBack()}

        saveToLocalByLongPress={false}

        enableImageZoom

        doubleClickInterval={200}

        renderIndicator={() => <></>}

      />

      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back"
          size={30}
          color="#fff"
        />
      </TouchableOpacity>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000",
  },

  back:{
    position:"absolute",
    top:45,
    left:20,
    zIndex:999,
  },

});