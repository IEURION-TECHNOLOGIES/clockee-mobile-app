import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type ClockLoaderProps = {
  size?: number;
  color?: string;
};

export default function ClockLoader({
  size = 60,
  color = "#22c55e", // green (Clockee vibe)
}: ClockLoaderProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.clock,
          {
            width: size,
            height: size,
            borderColor: color,
            transform: [{ rotate }],
          },
        ]}
      >
        {/* CLOCK HAND */}
        <View
          style={[
            styles.hand,
            {
              backgroundColor: color,
              height: size / 2.4,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  clock: {
    borderWidth: 3,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  hand: {
    width: 3,
    position: "absolute",
    top: 6,
    borderRadius: 2,
  },
});
