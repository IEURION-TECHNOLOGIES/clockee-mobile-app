import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  Region,
  UrlTile,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

type StoredLocation = {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number | null;
  radius: number;
};

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DEFAULT_REGION: Region = {
  latitude: 9.082,
  longitude: 8.6753,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function LocationPicker() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    radius?: string;
    institutionId?: string;
    branchId?: string;
    mode?: string;
  }>();

  const institutionId = Array.isArray(
    params.institutionId
  )
    ? params.institutionId[0]
    : params.institutionId;

  const branchId = Array.isArray(params.branchId)
    ? params.branchId[0]
    : params.branchId;

  const radius = Array.isArray(params.radius)
    ? params.radius[0]
    : params.radius;

  const mode = Array.isArray(params.mode)
    ? params.mode[0]
    : params.mode;

  /*
   * Create branch:
   * TEMP_OFFICE_LOCATION_institutionId
   *
   * Update branch:
   * TEMP_BRANCH_LOCATION_institutionId_branchId
   */
  const storageKey =
    mode === "update" && institutionId && branchId
      ? `TEMP_BRANCH_LOCATION_${institutionId}_${branchId}`
      : institutionId
        ? `TEMP_OFFICE_LOCATION_${institutionId}`
        : null;

  const mapRef = useRef<MapView | null>(null);

  const [mapRegion, setMapRegion] =
    useState<Region>(DEFAULT_REGION);

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [address, setAddress] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [findingLocation, setFindingLocation] =
    useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD SAVED LOCATION ================= */

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      if (storageKey) {
        const storedLocation =
          await AsyncStorage.getItem(storageKey);

        if (storedLocation) {
          const parsedLocation: StoredLocation =
            JSON.parse(storedLocation);

          const restoredLocation: SelectedLocation = {
            latitude: parsedLocation.latitude,
            longitude: parsedLocation.longitude,
            address: parsedLocation.address,
          };

          const restoredRegion: Region = {
            latitude: parsedLocation.latitude,
            longitude: parsedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setSelectedLocation(restoredLocation);
          setAddress(parsedLocation.address || "");
          setAccuracy(parsedLocation.accuracy || null);
          setMapRegion(restoredRegion);

          setTimeout(() => {
            mapRef.current?.animateToRegion(
              restoredRegion,
              700
            );
          }, 400);

          setLoading(false);
          return;
        }
      }

      /*
       * Do not automatically request location permission.
       * The user can choose any branch location manually.
       */
      setLoading(false);
    } catch (loadError) {
      console.log(
        "Failed to load saved location:",
        loadError
      );

      setLoading(false);
    }
  };

  /* ================= MAP PRESSED ================= */

  const handleMapPressed = async (
    event: MapPressEvent
  ) => {
    const { latitude, longitude } =
      event.nativeEvent.coordinate;

    await selectLocation(latitude, longitude);
  };

  /* ================= SELECT LOCATION ================= */

  const selectLocation = async (
    latitude: number,
    longitude: number
  ) => {
    const roundedLatitude = Number(
      latitude.toFixed(5)
    );

    const roundedLongitude = Number(
      longitude.toFixed(5)
    );

    const location: SelectedLocation = {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
    };

    setSelectedLocation(location);
    setAccuracy(null);

    const selectedRegion: Region = {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(selectedRegion);

    mapRef.current?.animateToRegion(
      selectedRegion,
      500
    );

    await reverseGeocode(
      roundedLatitude,
      roundedLongitude
    );
  };

  /* ================= REVERSE GEOCODE (Expo) ================= */

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const result =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (!result.length) {
        setAddress("Address not available");
        return;
      }

      const place = result[0];

      const addressParts = [
        place.name,
        place.street,
        place.district,
        place.city,
        place.region,
        place.country,
      ].filter(Boolean);

      const formattedAddress =
        addressParts.join(", ");

      setAddress(
        formattedAddress || "Address not available"
      );

      setSelectedLocation((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          address: formattedAddress,
        };
      });
    } catch (reverseError) {
      console.log(
        "Reverse geocode error:",
        reverseError
      );

      setAddress("Address not available");
    }
  };

  /* ================= REVERSE GEOCODE (Google – optional) ================= 
   * If you want Google-quality addresses instead of Expo’s geocoder,
   * replace the reverseGeocode function above with this one and
   * ensure Geocoding API is enabled for your key.
   */

  // const reverseGeocode = async (
  //   latitude: number,
  //   longitude: number
  // ) => {
  //   try {
  //     const url =
  //       `https://maps.googleapis.com/maps/api/geocode/json` +
  //       `?latlng=${latitude},${longitude}` +
  //       `&key=${GOOGLE_MAPS_API_KEY}`;

  //     const res = await fetch(url);
  //     const data = await res.json();

  //     if (data.status !== "OK" || !data.results?.length) {
  //       setAddress("Address not available");
  //       return;
  //     }

  //     const formattedAddress = data.results[0].formatted_address;

  //     setAddress(formattedAddress);

  //     setSelectedLocation((previous) => {
  //       if (!previous) return previous;
  //       return { ...previous, address: formattedAddress };
  //     });
  //   } catch (e) {
  //     console.log("Google reverse geocode error:", e);
  //     setAddress("Address not available");
  //   }
  // };

  /* ================= CURRENT LOCATION ================= */

  const useCurrentLocation = async () => {
    try {
      setFindingLocation(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow location permission if you want to use your current location."
        );

        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const {
        latitude,
        longitude,
        accuracy: currentAccuracy,
      } = currentLocation.coords;

      setAccuracy(currentAccuracy || null);

      await selectLocation(latitude, longitude);
    } catch (locationError) {
      console.log(
        "Current location error:",
        locationError
      );

      Alert.alert(
        "Unable to get location",
        "We could not detect your current location."
      );
    } finally {
      setFindingLocation(false);
    }
  };

  /* ================= SAVE LOCATION ================= */

  const saveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert(
        "Location required",
        "Tap the map to select a location first."
      );

      return;
    }

    if (!storageKey) {
      Alert.alert(
        "Unable to save",
        "The institution or branch reference is missing."
      );

      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.log(
        "Google Maps API key is missing. Map tiles may not load correctly."
      );
    }

    try {
      setSaving(true);

      const locationData: StoredLocation = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address:
          selectedLocation.address ||
          address ||
          "Address not available",
        accuracy,
        radius: Number(radius) || 100,
      };

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(locationData)
      );

      router.back();
    } catch (saveError) {
      console.log(
        "Failed to save location:",
        saveError
      );

      Alert.alert(
        "Save failed",
        "The selected location could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loaderText}>
          Preparing map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ================= MAP ================= */}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        region={mapRegion}
        onPress={handleMapPressed}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        mapType={
          Platform.OS === "android"
            ? "none"
            : "standard"
        }
      >
        {/* GOOGLE MAPS TILES */}

        <UrlTile
          urlTemplate={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`}
          maximumZ={20}
          flipY={false}
        />

        {/* SELECTED MARKER */}

        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable
            onDragEnd={async (event) => {
              const {
                latitude,
                longitude,
              } = event.nativeEvent.coordinate;

              await selectLocation(
                latitude,
                longitude
              );
            }}
            title="Branch location"
            description={
              address || "Selected branch location"
            }
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerCircle}>
                <Ionicons
                  name="business"
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.markerPointer} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ================= TOP HEADER ================= */}

      <View style={styles.topOverlay}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.topTitleCard}>
          <Text style={styles.topEyebrow}>
            BRANCH LOCATION
          </Text>

          <Text style={styles.topTitle}>
            Select location
          </Text>
        </View>

        <View style={styles.topSpacer} />
      </View>

      {/* ================= INSTRUCTION CARD ================= */}

      <View style={styles.instructionCard}>
        <View style={styles.instructionIcon}>
          <Ionicons
            name="hand-left-outline"
            size={19}
            color="#0284C7"
          />
        </View>

        <View style={styles.instructionContent}>
          <Text style={styles.instructionTitle}>
            Tap or drag the marker
          </Text>

          <Text style={styles.instructionText}>
            Select the exact branch location. You do not need to
            be physically there.
          </Text>
        </View>
      </View>

      {/* ================= CURRENT LOCATION ================= */}

      <Pressable
        style={styles.currentLocationButton}
        onPress={useCurrentLocation}
        disabled={findingLocation}
      >
        {findingLocation ? (
          <ActivityIndicator
            size="small"
            color="#0284C7"
          />
        ) : (
          <Ionicons
            name="locate-outline"
            size={21}
            color="#0284C7"
          />
        )}

        <Text style={styles.currentLocationText}>
          Use my current location
        </Text>
      </Pressable>

      {/* ================= MAP ATTRIBUTION ================= */}

      <View style={styles.mapAttribution}>
        <Text style={styles.mapAttributionText}>
          © Google
        </Text>
      </View>

      {/* ================= BOTTOM PANEL ================= */}

      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />

        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>
              Selected location
            </Text>

            <Text style={styles.panelSubtitle}>
              Review the location before saving.
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              selectedLocation
                ? styles.statusBadgeSuccess
                : styles.statusBadgeEmpty,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                selectedLocation
                  ? styles.statusDotSuccess
                  : styles.statusDotEmpty,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                selectedLocation
                  ? styles.statusTextSuccess
                  : styles.statusTextEmpty,
              ]}
            >
              {selectedLocation
                ? "Selected"
                : "Required"}
            </Text>
          </View>
        </View>

        {/* ADDRESS */}

        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons
              name="location-outline"
              size={20}
              color={
                selectedLocation
                  ? "#059669"
                  : "#94A3B8"
              }
            />
          </View>

          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>
              Address
            </Text>

            <Text
              style={[
                styles.addressText,
                !address && styles.addressTextEmpty,
              ]}
              numberOfLines={2}
            >
              {address || "Tap the map to select a location"}
            </Text>
          </View>
        </View>

        {/* COORDINATES */}

        <View style={styles.coordinatesRow}>
          <View style={styles.coordinateCard}>
            <Text style={styles.coordinateLabel}>
              LATITUDE
            </Text>

            <Text style={styles.coordinateValue}>
              {selectedLocation
                ? selectedLocation.latitude.toFixed(5)
                : "--"}
            </Text>
          </View>

          <View style={styles.coordinateCard}>
            <Text style={styles.coordinateLabel}>
              LONGITUDE
            </Text>

            <Text style={styles.coordinateValue}>
              {selectedLocation
                ? selectedLocation.longitude.toFixed(5)
                : "--"}
            </Text>
          </View>

          <View
            style={[
              styles.coordinateCard,
              styles.coordinateCardLast,
            ]}
          >
            <Text style={styles.coordinateLabel}>
              ACCURACY
            </Text>

            <Text style={styles.coordinateValue}>
              {accuracy
                ? `±${accuracy.toFixed(0)}m`
                : "Manual"}
            </Text>
          </View>
        </View>

        {/* SAVE */}

        <Pressable
          style={[
            styles.saveButton,
            (!selectedLocation || saving) &&
              styles.saveButtonDisabled,
          ]}
          onPress={saveLocation}
          disabled={!selectedLocation || saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Save location
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  loaderText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },

  topOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 42,
    left: 18,
    right: 18,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 7,
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  topTitleCard: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 7,
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  topEyebrow: {
    color: "#0284C7",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  topTitle: {
    marginTop: 2,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  topSpacer: {
    width: 44,
  },

  instructionCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 120 : 104,
    left: 18,
    right: 18,
    zIndex: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  instructionIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  instructionContent: {
    flex: 1,
    marginLeft: 9,
  },

  instructionTitle: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
  },

  instructionText: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 15,
  },

  currentLocationButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 218 : 202,
    right: 18,
    zIndex: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  currentLocationText: {
    marginLeft: 6,
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "800",
  },

  markerContainer: {
    alignItems: "center",
  },

  markerCircle: {
    width: 47,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 25,
    elevation: 7,
    shadowColor: "#0F172A",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  markerPointer: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 13,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#0284C7",
  },

  mapAttribution: {
    position: "absolute",
    left: 10,
    bottom: 270,
    zIndex: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 7,
  },

  mapAttributionText: {
    color: "#475569",
    fontSize: 9,
    fontWeight: "600",
  },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 17,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 15,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: -5,
    },
  },

  panelHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    marginBottom: 15,
    backgroundColor: "#CBD5E1",
    borderRadius: 5,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  panelTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  panelSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statusBadgeSuccess: {
    backgroundColor: "#ECFDF5",
  },

  statusBadgeEmpty: {
    backgroundColor: "#FFF7ED",
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 4,
  },

  statusDotSuccess: {
    backgroundColor: "#10B981",
  },

  statusDotEmpty: {
    backgroundColor: "#F97316",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  statusTextSuccess: {
    color: "#047857",
  },

  statusTextEmpty: {
    color: "#C2410C",
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
  },

  addressIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  addressContent: {
    flex: 1,
    marginLeft: 9,
  },

  addressLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  addressText: {
    marginTop: 3,
    color: "#0F172A",
    fontSize: 12,
    lineHeight: 17,
  },

  addressTextEmpty: {
    color: "#94A3B8",
  },

  coordinatesRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  coordinateCard: {
    flex: 1,
    padding: 9,
    marginRight: 7,
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
  },

  coordinateCardLast: {
    marginRight: 0,
  },

  coordinateLabel: {
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  coordinateValue: {
    marginTop: 4,
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
  },

  saveButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    backgroundColor: "#0284C7",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#0284C7",
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
