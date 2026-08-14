import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEMO_STORAGE_KEY = "hasSeenDemo";

const DEMO_ROUTE = "/demopage/firstdemo";

const ONBOARDING_RESET_EVENT =
  "CLOCKEE_ONBOARDING_RESET";

export default function DevResetOnboarding() {
  const router = useRouter();

  const [resetting, setResetting] =
    useState(false);


  const resetOnboarding = async () => {
    if (resetting) return;

    try {
      setResetting(true);

      /**
       * Remove the onboarding completion flag.
       */
      await AsyncStorage.removeItem(
        DEMO_STORAGE_KEY
      );

      console.log(
        "[DEV] Onboarding status reset successfully"
      );

      /**
       * Tell AppRouterController immediately.
       *
       * This is the important part that fixes
       * the old hasSeenDemo=true state.
       */
      DeviceEventEmitter.emit(
        ONBOARDING_RESET_EVENT
      );

      /**
       * Navigate to demo.
       */
      setTimeout(() => {
        router.replace(DEMO_ROUTE);
      }, 100);

    } catch (error) {
      console.error(
        "[DEV] Failed to reset onboarding:",
        error
      );

      Alert.alert(
        "Reset failed",
        "Could not reset onboarding status."
      );
    } finally {
      setResetting(false);
    }
  };


  return (
    <View style={styles.container}>

      <Pressable
        onPress={resetOnboarding}
        disabled={resetting}
        style={[
          styles.button,
          resetting &&
            styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {resetting
            ? "Resetting..."
            : "DEV: Reset Onboarding"}
        </Text>
      </Pressable>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "center",
  },

  button: {
    minWidth: 210,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
