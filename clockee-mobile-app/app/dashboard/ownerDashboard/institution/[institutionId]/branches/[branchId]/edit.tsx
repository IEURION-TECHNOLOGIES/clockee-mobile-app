import { Ionicons } from "@expo/vector-icons";
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import React, {
  useState,
  useCallback,
  useEffect,
} from "react";
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
import { useUpdateBranch } from "@/hooks/useUpdateBranch";
import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";

export default function UpdateBranch() {
  const router = useRouter();
  const { branchId, institutionId } = useLocalSearchParams<{
    branchId: string;
    institutionId: string;

  }>();

  const { data: branches = [], isLoading } =
    useInstitutionBranches(institutionId);

  const branch = branches?.find(
    (b: any) => b._id === branchId
  );

  const { mutateAsync, isPending } =
    useUpdateBranch();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [radiusMeters, setRadiusMeters] =
    useState(100);

  const [error, setError] = useState("");

  const STORAGE_KEY =
    institutionId && branchId
      ? `TEMP_BRANCH_LOCATION_${institutionId}_${branchId}`
      : null;

  /* ================= PREFILL ================= */

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setAddress(branch.address);
      setRadiusMeters(branch.radiusMeters || 100);

      if (branch.location?.coordinates) {
        setSelectedLocation({
          latitude:
            branch.location.coordinates[1],
          longitude:
            branch.location.coordinates[0],
        });
      }
    }
  }, [branch]);

  /* ================= LOAD SAVED LOCATION ================= */

  useFocusEffect(
    useCallback(() => {
      if (!STORAGE_KEY) return;

      const loadLocation = async () => {
        const stored =
          await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedLocation(parsed);
          setAddress(parsed.address || "");
        }
      };

      loadLocation();
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
      params: { institutionId },
    });
  };

  /* ================= SUBMIT ================= */

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Branch name required");
      return;
    }

    if (!selectedLocation) {
      setError("Location required");
      return;
    }

    if (!institutionId) {
      setError("Institution not found");
      return;
    }

    try {
      setError("");

      await mutateAsync({
        branchId,
        payload: {
          institutionId,
          name: name.trim(),
          address: address.trim(),
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radiusMeters,
        },
      });

      if (STORAGE_KEY) {
        await AsyncStorage.removeItem(
          STORAGE_KEY
        );
      }

      router.back();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update branch"
      );
    }
  };

  /* ================= LOADING ================= */

  if (isLoading || !branch) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color="#fff"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Update Branch
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.label}>
            Branch Name
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* ADDRESS */}
          <Text style={styles.label}>
            Address
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: "#F1F5F9" },
            ]}
            value={address}
            editable={false}
          />

          {/* LOCATION */}
          <Text style={styles.label}>
            Branch Location
          </Text>

          <Pressable
            style={styles.locationCard}
            onPress={openLocationPicker}
          >
            <Ionicons
              name="location"
              size={26}
              color="#0284C7"
            />

            <View style={{ marginLeft: 12 }}>
              {selectedLocation ? (
                <>
                  <Text
                    style={styles.locationTitle}
                  >
                    Location Selected
                  </Text>
                  <Text style={styles.coords}>
                    Lat:{" "}
                    {selectedLocation.latitude}
                  </Text>
                  <Text style={styles.coords}>
                    Lng:{" "}
                    {selectedLocation.longitude}
                  </Text>
                </>
              ) : (
                <Text
                  style={
                    styles.locationPlaceholder
                  }
                >
                  Tap to change location
                </Text>
              )}
            </View>
          </Pressable>

          {/* RADIUS */}
          <Text style={styles.label}>
            Clock-in Radius (meters)
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(radiusMeters)}
            onChangeText={(v) =>
              setRadiusMeters(
                Number(v) || 0
              )
            }
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* BUTTON */}
      <Pressable
        style={[
          styles.button,
          isPending && { opacity: 0.7 },
        ]}
        onPress={handleUpdate}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="save-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>
              Update Branch
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
    marginBottom: 18,
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

