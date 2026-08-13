import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import ResponseModal from "../../../../../../components/ResponseModal";

export default function LocationPicker() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const { radius, institutionId } = params;

  const STORAGE_KEY = `TEMP_OFFICE_LOCATION_${institutionId}`;

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  /* ================= AUTO DETECT ================= */

  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setModalType("error");
          setModalMessage("Location permission denied");
          setModalVisible(true);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude, accuracy } = location.coords;

        const roundedLat = parseFloat(latitude.toFixed(4));
        const roundedLng = parseFloat(longitude.toFixed(4));

        setAccuracy(accuracy || null);
        setSelectedLocation({
          latitude: roundedLat,
          longitude: roundedLng,
        });

        reverseGeocode(roundedLat, roundedLng);
      } catch (err) {
        setModalType("error");
        setModalMessage("Failed to detect location");
        setModalVisible(true);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  /* ================= REVERSE GEOCODE ================= */

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (result.length > 0) {
        const place = result[0];

        const formatted = `${place.name || ""} ${place.street || ""}, ${
          place.city || ""
        }`;

        setAddress(formatted);
      }
    } catch (err) {
      console.log("Reverse Geocode Error:", err);
    }
  };

  /* ================= SAVE LOCATION ================= */

  const saveLocationAndGoBack = async () => {
    if (!selectedLocation) return;

    try {
      const locationData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address,
        accuracy,
        radius: Number(radius) || 100,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(locationData)
      );

      router.back();
    } catch (error) {
      console.log("Storage Error:", error);
    }
  };

  /* ================= CONFIRM ================= */

  const handleConfirm = () => {
    if (!selectedLocation) {
      setModalType("error");
      setModalMessage("Location not available");
      setModalVisible(true);
      return;
    }

    setModalType("success");
    setModalMessage("Location selected successfully");
    setModalVisible(true);
  };

  /* ================= REFRESH LOCATION ================= */

  const refreshLocation = async () => {
    setLoadingLocation(true);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = location.coords;

      const roundedLat = parseFloat(latitude.toFixed(4));
      const roundedLng = parseFloat(longitude.toFixed(4));

      setAccuracy(accuracy || null);
      setSelectedLocation({
        latitude: roundedLat,
        longitude: roundedLng,
      });

      reverseGeocode(roundedLat, roundedLng);
    } catch (err) {
      setModalType("error");
      setModalMessage("Failed to refresh location");
      setModalVisible(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  /* ================= LOADING ================= */

  if (loadingLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Detecting current location...</Text>
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Detected Location</Text>

          <Text style={styles.address}>
            {address || "Address not available"}
          </Text>

          {selectedLocation && (
            <>
              <Text style={styles.coords}>
                Latitude: {selectedLocation.latitude}
              </Text>
              <Text style={styles.coords}>
                Longitude: {selectedLocation.longitude}
              </Text>
            </>
          )}

          {accuracy && (
            <Text style={styles.accuracy}>
              GPS Accuracy: ±{accuracy.toFixed(1)} meters
            </Text>
          )}

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refreshLocation}
          >
            <Text style={styles.refreshText}>Refresh Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalType === "success" ? "Success" : "Error"}
        message={modalMessage}
        onClose={async () => {
          setModalVisible(false);

          if (modalType === "success") {
            await saveLocationAndGoBack();
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 10,
  },
  address: {
    fontWeight: "600",
    marginBottom: 10,
  },
  coords: {
    fontSize: 13,
    marginBottom: 5,
  },
  accuracy: {
    fontSize: 13,
    color: "green",
    marginBottom: 15,
  },
  refreshBtn: {
    backgroundColor: "#64748b",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#0284C7",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
