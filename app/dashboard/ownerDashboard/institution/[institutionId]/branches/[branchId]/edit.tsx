import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useUpdateBranch } from "@/hooks/useUpdateBranch";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

type AddressSuggestion = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
};

const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || "";

export default function UpdateBranch() {
  const router = useRouter();

  const {
    branchId: rawBranchId,
    institutionId: rawInstitutionId,
  } = useLocalSearchParams<{
    branchId: string;
    institutionId: string;
  }>();

  const branchId = Array.isArray(rawBranchId)
    ? rawBranchId[0]
    : rawBranchId;

  const institutionId = Array.isArray(rawInstitutionId)
    ? rawInstitutionId[0]
    : rawInstitutionId;

  const {
    data: branches = [],
    isLoading,
  } = useInstitutionBranches(institutionId);

  const branch = branches.find(
    (item: any) => item._id === branchId
  );

  const {
    mutateAsync,
    isPending,
  } = useUpdateBranch();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [radiusMeters, setRadiusMeters] =
    useState<number>(100);

  const [suggestions, setSuggestions] = useState<
    AddressSuggestion[]
  >([]);

  const [searchingAddress, setSearchingAddress] =
    useState(false);

  const [error, setError] = useState("");

  const storageKey =
    institutionId && branchId
      ? `TEMP_BRANCH_LOCATION_${institutionId}_${branchId}`
      : null;

  /* ================= PREFILL BRANCH ================= */

  useEffect(() => {
    if (!branch) {
      return;
    }

    setName(branch.name || "");
    setAddress(branch.address || "");
    setRadiusMeters(branch.radiusMeters || 100);

    if (
      branch.location?.coordinates &&
      Array.isArray(branch.location.coordinates)
    ) {
      setSelectedLocation({
        latitude: Number(
          branch.location.coordinates[1]
        ),
        longitude: Number(
          branch.location.coordinates[0]
        ),
        address: branch.address || "",
      });
    }
  }, [branch]);

  /* ================= LOAD MAP LOCATION ================= */

  useFocusEffect(
    useCallback(() => {
      if (!storageKey) {
        return;
      }

      const loadLocation = async () => {
        try {
          const storedLocation =
            await AsyncStorage.getItem(storageKey);

          if (!storedLocation) {
            return;
          }

          const parsedLocation: SelectedLocation =
            JSON.parse(storedLocation);

          setSelectedLocation(parsedLocation);

          if (parsedLocation.address) {
            setAddress(parsedLocation.address);
          }
        } catch (loadError) {
          console.log(
            "Failed to load temporary location:",
            loadError
          );
        }
      };

      loadLocation();
    }, [storageKey])
  );

  /* ================= SEARCH ADDRESS ================= */

  useEffect(() => {
    const searchText = address.trim();

    if (searchText.length < 3) {
      setSuggestions([]);
      setSearchingAddress(false);
      return;
    }

    /*
     * Do not search again if the displayed address is already
     * the address belonging to the selected coordinates.
     */
    if (selectedLocation?.address === searchText) {
      setSuggestions([]);
      return;
    }

    if (!GEOAPIFY_API_KEY) {
      setSuggestions([]);
      setError("Geoapify API key is missing.");
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      searchAddressSuggestions(
        searchText,
        controller.signal
      );
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [address, selectedLocation]);

  const searchAddressSuggestions = async (
    searchText: string,
    signal: AbortSignal
  ) => {
    try {
      setSearchingAddress(true);
      setError("");

      const url =
        "https://api.geoapify.com/v1/geocode/autocomplete" +
        `?text=${encodeURIComponent(searchText)}` +
        `&filter=countrycode:ng` +
        `&limit=5` +
        `&apiKey=${GEOAPIFY_API_KEY}`;

      const response = await fetch(url, {
        method: "GET",
        signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Geoapify request failed: ${response.status}`
        );
      }

      const result = await response.json();

      const formattedSuggestions: AddressSuggestion[] = (
        result.features || []
      )
        .map((item: any, index: number) => {
          const properties = item.properties || {};

          const latitude = Number(properties.lat);
          const longitude = Number(properties.lon);

          if (
            !properties.formatted ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return null;
          }

          return {
            id:
              String(
                properties.place_id ||
                  properties.osm_id ||
                  index
              ),
            address: properties.formatted,
            latitude,
            longitude,
          };
        })
        .filter(
          (
            item: AddressSuggestion | null
          ): item is AddressSuggestion =>
            item !== null
        );

      setSuggestions(formattedSuggestions);
    } catch (searchError: any) {
      if (searchError?.name === "AbortError") {
        return;
      }

      console.log(
        "Address search error:",
        searchError
      );

      setSuggestions([]);
      setError("Unable to search for this address.");
    } finally {
      setSearchingAddress(false);
    }
  };

  /* ================= SELECT ADDRESS ================= */

  const handleSuggestionSelected = (
    suggestion: AddressSuggestion
  ) => {
    setAddress(suggestion.address);

    setSelectedLocation({
      address: suggestion.address,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });

    setSuggestions([]);
    setError("");
  };

  /* ================= CLEAR ADDRESS ================= */

  const clearAddress = () => {
    setAddress("");
    setSelectedLocation(null);
    setSuggestions([]);
    setError("");
  };

  /* ================= OPEN MAP ================= */

  const openLocationPicker = () => {
    if (!institutionId) {
      setError("Institution not found.");
      return;
    }

    if (!branchId) {
      setError("Branch not found.");
      return;
    }

    setSuggestions([]);
    setError("");

    router.push({
      pathname:
        "/dashboard/superAdminDashboard/institution/[institutionId]/settings/locationPicker",
      params: {
        institutionId,
        branchId,
        mode: "update",
      },
    });
  };

  /* ================= UPDATE BRANCH ================= */

  const handleUpdate = async () => {
    if (isPending) {
      return;
    }

    setError("");
    setSuggestions([]);

    if (!name.trim()) {
      setError("Please enter a branch name.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter a branch address.");
      return;
    }

    if (!selectedLocation) {
      setError(
        "Select an address suggestion or choose a location on the map."
      );
      return;
    }

    if (!institutionId) {
      setError("Institution not found.");
      return;
    }

    if (!branchId) {
      setError("Branch not found.");
      return;
    }

    if (
      !Number.isFinite(radiusMeters) ||
      radiusMeters <= 0
    ) {
      setError(
        "Clock-in radius must be greater than zero."
      );
      return;
    }

    try {
      const payload = {
        institutionId,
        name: name.trim(),
        address:
          selectedLocation.address || address.trim(),
        latitude: Number(
          selectedLocation.latitude.toFixed(4)
        ),
        longitude: Number(
          selectedLocation.longitude.toFixed(4)
        ),
        radiusMeters: Math.round(radiusMeters),
      };

      console.log("UPDATE BRANCH PAYLOAD:", payload);

      await mutateAsync({
        branchId,
        payload,
      });

      if (storageKey) {
        await AsyncStorage.removeItem(storageKey);
      }

      router.back();
    } catch (updateError: any) {
      console.log(
        "Failed to update branch:",
        updateError
      );

      setError(
        updateError?.response?.data?.message ||
          updateError?.message ||
          "Failed to update branch."
      );
    }
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loaderText}>
          Loading branch...
        </Text>
      </View>
    );
  }

  if (!branch) {
    return (
      <View style={styles.loader}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#DC2626"
        />

        <Text style={styles.notFoundTitle}>
          Branch not found
        </Text>

        <Pressable
          style={styles.backHomeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backHomeButtonText}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const hasSelectedLocation = Boolean(selectedLocation);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#075985"
      />

      {/* ================= HEADER ================= */}

      <LinearGradient
        colors={["#075985", "#0284C7", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              BRANCH SETTINGS
            </Text>

            <Text style={styles.headerTitle}>
              Update branch
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerBranchRow}>
          <View style={styles.headerBranchIcon}>
            <Ionicons
              name="business-outline"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.headerBranchInfo}>
            <Text style={styles.headerBranchName}>
              {branch.name}
            </Text>

            <Text style={styles.headerBranchSubtitle}>
              Update branch information and attendance settings
            </Text>
          </View>
        </View>

        <View style={styles.heroDecorationOne} />
        <View style={styles.heroDecorationTwo} />
      </LinearGradient>

      {/* ================= CONTENT ================= */}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* BRANCH INFORMATION */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderIcon}>
                <Ionicons
                  name="business-outline"
                  size={19}
                  color="#0284C7"
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>
                  Branch information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Update the name and address for this branch.
                </Text>
              </View>
            </View>

            {/* BRANCH NAME */}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Branch name</Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color="#0284C7"
                  />
                </View>

                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter branch name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* ADDRESS */}

            <View
              style={[
                styles.fieldGroup,
                styles.addressFieldGroup,
              ]}
            >
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Branch address
                </Text>

                <View style={styles.searchBadge}>
                  <Ionicons
                    name="sparkles-outline"
                    size={11}
                    color="#0284C7"
                  />

                  <Text style={styles.searchBadgeText}>
                    Searchable
                  </Text>
                </View>
              </View>

              <View style={styles.addressSearchContainer}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#0284C7"
                    />
                  </View>

                  <TextInput
                    value={address}
                    onChangeText={(value) => {
                      setAddress(value);

                      if (selectedLocation) {
                        setSelectedLocation(null);
                      }

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Type branch address..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  {searchingAddress && (
                    <ActivityIndicator
                      size="small"
                      color="#0284C7"
                      style={styles.searchLoader}
                    />
                  )}

                  {address.length > 0 &&
                    !searchingAddress && (
                      <Pressable
                        style={styles.clearButton}
                        onPress={clearAddress}
                      >
                        <Ionicons
                          name="close-circle"
                          size={19}
                          color="#94A3B8"
                        />
                      </Pressable>
                    )}
                </View>

                {suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((suggestion) => (
                      <Pressable
                        key={suggestion.id}
                        style={styles.suggestionRow}
                        onPress={() =>
                          handleSuggestionSelected(
                            suggestion
                          )
                        }
                      >
                        <View style={styles.suggestionIcon}>
                          <Ionicons
                            name="location-outline"
                            size={17}
                            color="#0284C7"
                          />
                        </View>

                        <Text
                          style={styles.suggestionText}
                          numberOfLines={3}
                        >
                          {suggestion.address}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.fieldHint}>
                Select a suggestion to update the address and
                coordinates together.
              </Text>
            </View>
          </View>

          {/* LOCATION */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderIcon}>
                <Ionicons
                  name="map-outline"
                  size={19}
                  color="#059669"
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>
                  Branch location
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Change the exact location on the map if needed.
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.locationCard,
                hasSelectedLocation &&
                  styles.locationCardSelected,
              ]}
              onPress={openLocationPicker}
            >
              <View
                style={[
                  styles.locationIcon,
                  hasSelectedLocation &&
                    styles.locationIconSelected,
                ]}
              >
                <Ionicons
                  name={
                    hasSelectedLocation
                      ? "checkmark"
                      : "map-outline"
                  }
                  size={24}
                  color={
                    hasSelectedLocation
                      ? "#FFFFFF"
                      : "#0284C7"
                  }
                />
              </View>

              <View style={styles.locationContent}>
                <Text
                  style={[
                    styles.locationTitle,
                    hasSelectedLocation &&
                      styles.locationTitleSelected,
                  ]}
                >
                  {hasSelectedLocation
                    ? "Location selected"
                    : "Change location on map"}
                </Text>

                {hasSelectedLocation ? (
                  <View style={styles.coordinates}>
                    <Text style={styles.coordinateText}>
                      {selectedLocation?.latitude.toFixed(5)}
                    </Text>

                    <View style={styles.coordinateDot} />

                    <Text style={styles.coordinateText}>
                      {selectedLocation?.longitude.toFixed(5)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.locationDescription}>
                    Tap to select the branch location manually.
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={
                  hasSelectedLocation
                    ? "#059669"
                    : "#94A3B8"
                }
              />
            </Pressable>

            {hasSelectedLocation && (
              <View style={styles.confirmationRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#059669"
                />

                <Text style={styles.confirmationText}>
                  The selected coordinates will be saved with this
                  branch.
                </Text>
              </View>
            )}
          </View>

          {/* ATTENDANCE SETTINGS */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderIcon}>
                <Ionicons
                  name="locate-outline"
                  size={19}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>
                  Attendance settings
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Control how close staff must be to clock in.
                </Text>
              </View>
            </View>

            <View style={styles.radiusLabelRow}>
              <Text style={styles.label}>
                Clock-in radius
              </Text>

              <View style={styles.metersBadge}>
                <Text style={styles.metersBadgeText}>
                  METERS
                </Text>
              </View>
            </View>

            <View style={styles.radiusInputWrapper}>
              <View style={styles.radiusIcon}>
                <Ionicons
                  name="radio-button-on-outline"
                  size={19}
                  color="#7C3AED"
                />
              </View>

              <TextInput
                value={String(radiusMeters)}
                onChangeText={(value) => {
                  const cleanedValue = value.replace(
                    /[^0-9]/g,
                    ""
                  );

                  setRadiusMeters(
                    cleanedValue.length > 0
                      ? Number(cleanedValue)
                      : 0
                  );

                  if (error) {
                    setError("");
                  }
                }}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#94A3B8"
                style={styles.radiusInput}
              />

              <Text style={styles.metersText}>
                meters
              </Text>
            </View>

            <View style={styles.radiusHintBox}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color="#6D28D9"
              />

              <Text style={styles.radiusHintText}>
                Staff must be within this distance from the branch
                location to clock in.
              </Text>
            </View>
          </View>

          {/* ERROR */}

          {error.length > 0 && (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================= BOTTOM BAR ================= */}

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isPending}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.updateButton,
            isPending && styles.buttonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.updateButtonText}>
                Save changes
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
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    minHeight: 245,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 31,
    overflow: "hidden",
    position: "relative",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerEyebrow: {
    marginBottom: 3,
    color: "#BAE6FD",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  headerBranchRow: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 31,
  },

  headerBranchIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },

  headerBranchInfo: {
    flex: 1,
    marginLeft: 13,
  },

  headerBranchName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  headerBranchSubtitle: {
    maxWidth: 310,
    marginTop: 5,
    color: "#E0F2FE",
    fontSize: 12,
    lineHeight: 17,
  },

  heroDecorationOne: {
    position: "absolute",
    width: 220,
    height: 220,
    top: -110,
    right: -65,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 120,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    top: 35,
    right: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 70,
  },

  scrollContent: {
    paddingTop: 18,
    paddingBottom: 135,
  },

  sectionCard: {
    zIndex: 1,
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 23,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  sectionHeaderIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },

  fieldGroup: {
    marginBottom: 4,
  },

  addressFieldGroup: {
    zIndex: 30,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  inputIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  searchBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },

  searchBadgeText: {
    marginLeft: 4,
    color: "#0284C7",
    fontSize: 10,
    fontWeight: "700",
  },

  addressSearchContainer: {
    position: "relative",
    zIndex: 30,
  },

  searchLoader: {
    marginRight: 12,
  },

  clearButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  suggestionsContainer: {
    position: "absolute",
    top: 61,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    elevation: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  suggestionIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
  },

  suggestionText: {
    flex: 1,
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
  },

  fieldHint: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
    padding: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 17,
  },

  locationCardSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },

  locationIcon: {
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 15,
  },

  locationIconSelected: {
    backgroundColor: "#10B981",
  },

  locationContent: {
    flex: 1,
    marginLeft: 12,
  },

  locationTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  locationTitleSelected: {
    color: "#047857",
  },

  locationDescription: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  coordinates: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  coordinateText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
  },

  coordinateDot: {
    width: 4,
    height: 4,
    marginHorizontal: 7,
    backgroundColor: "#94A3B8",
    borderRadius: 2,
  },

  confirmationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    paddingHorizontal: 3,
  },

  confirmationText: {
    flex: 1,
    marginLeft: 5,
    color: "#047857",
    fontSize: 11,
  },

  radiusLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  metersBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
  },

  metersBadgeText: {
    color: "#7C3AED",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  radiusInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  radiusIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: "#F5F3FF",
    borderRadius: 11,
  },

  radiusInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  metersText: {
    marginRight: 15,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  radiusHintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    padding: 11,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
  },

  radiusHintText: {
    flex: 1,
    marginLeft: 7,
    color: "#6D28D9",
    fontSize: 11,
    lineHeight: 16,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 13,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 17,
  },

  bottomSpace: {
    height: 20,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  cancelButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 15,
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "800",
  },

  updateButton: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#0284C7",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  updateButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  buttonDisabled: {
    opacity: 0.65,
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

  notFoundTitle: {
    marginTop: 12,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  backHomeButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#0284C7",
    borderRadius: 12,
  },

  backHomeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});

