import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  progress: number;
};

const bars = [
  8,15,6,18,10,5,14,20,8,12,
  6,18,15,8,20,10,6,14,19,9,
  7,17,11,5,16,8
];

export default function Waveform({
  progress,
}: Props) {

  const active = Math.floor(
    progress * bars.length
  );

  return (
    <View style={styles.container}>
      {bars.map((height,index)=>(
        <View
          key={index}
          style={[
            styles.bar,
            {
              height,
              backgroundColor:
                index <= active
                  ? "#2563EB"
                  : "#D1D5DB",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles=StyleSheet.create({

container:{
flex:1,
height:22,
flexDirection:"row",
alignItems:"flex-end",
marginHorizontal:12,
},

bar:{
width:3,
marginHorizontal:1,
borderRadius:5,
}

});