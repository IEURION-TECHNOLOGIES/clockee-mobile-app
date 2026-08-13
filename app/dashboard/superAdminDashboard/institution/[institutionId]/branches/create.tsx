import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBranch } from "@/services/superAdminServices";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function BranchSetup() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<{
      latitude: number;
      longitude: number;
      address?: string;
    } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const STORAGE_KEY = institutionId
  ? `TEMP_OFFICE_LOCATION_${institutionId}`
  : null;

  /* ================= LOAD SAVED LOCATION ================= */

  useFocusEffect(
    useCallback(() => {
      if (!STORAGE_KEY) return;

      const loadSavedLocation = async () => {
        try {
          const stored = await AsyncStorage.getItem(
            STORAGE_KEY
          );

          if (stored) {
            const parsed = JSON.parse(stored);
            setSelectedLocation(parsed);
            setAddress(parsed.address || "");
          }
        } catch (err) {
          console.log("Load location error:", err);
        }
      };

      loadSavedLocation();
    }, [STORAGE_KEY])
  );

  /* ================= OPEN LOCATION PICKER ================= */

  const openLocationPicker = () => {
   if (!institutionId) {
  setError("Institution not found");
  return;
}

    router.push({
      pathname:
        "/dashboard/superAdminDashboard/institution/[institutionId]/settings/locationPicker",
    params: {
      institutionId,
    },
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (loading) return;

    setError("");

    if (!name.trim()) {
      setError("Branch name is required");
      return;
    }

    if (!selectedLocation) {
      setError("Please select branch location");
      return;
    }

    if (!institutionId) {
      setError("Institution not found");
      return;
    }

    try {
      setLoading(true);

      
      const payload = {
        institutionId: institutionId,
        name: name.trim(),
        address: address.trim(),
        latitude: Number(selectedLocation.latitude.toFixed(4)),
        longitude: Number(selectedLocation.longitude.toFixed(4)),
      };

      await createBranch(payload);

      if (STORAGE_KEY) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }

      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to create branch";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>
          Create New Branch
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.label}>Branch Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Abuja Branch"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          {/* ADDRESS */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#F1F5F9" }]}
            placeholder="Auto-filled after selecting location"
            placeholderTextColor="#94A3B8"
            value={address}
            editable={false}
          />

          {/* LOCATION */}
          <Text style={styles.label}>Branch Location</Text>

          <Pressable
            style={styles.locationCard}
            onPress={openLocationPicker}
          >
            <Ionicons
              name="location"
              size={28}
              color="#0284C7"
            />

            <View style={{ marginLeft: 12 }}>
              {selectedLocation ? (
                <>
                  <Text style={styles.locationTitle}>
                    Location Selected
                  </Text>
                  <Text style={styles.coords}>
                    Latitude: {selectedLocation.latitude.toFixed(4)}
                  </Text>
                  <Text style={styles.coords}>
                    Longitude: {selectedLocation.longitude.toFixed(4)}
                  </Text>
                </>
              ) : (
                <Text style={styles.locationPlaceholder}>
                  Tap to select branch location
                </Text>
              )}
            </View>
          </Pressable>


          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* BUTTON */}
      <Pressable
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>
              Create Branch
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284C7",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 15,
  },
  card: {
    backgroundColor: "#fff",
    marginTop: 5,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#334155",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  locationTitle: {
    fontWeight: "600",
    color: "#0F172A",
  },
  locationPlaceholder: {
    color: "#64748B",
  },
  coords: {
    fontSize: 12,
    color: "#475569",
  },
  button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#0284C7",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: "#DC2626",
    marginTop: 8,
    fontSize: 13,
  },
});
