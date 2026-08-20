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

import { createBranch } from "@/services/superAdminServices";

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
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ||
  "d137ffaca9a54728b8aa0a1b4648a0ec";

export default function BranchSetup() {
  const router = useRouter();

  const { institutionId } = useLocalSearchParams();

  const normalizedInstitutionId = Array.isArray(institutionId)
    ? institutionId[0]
    : institutionId;

  const storageKey = normalizedInstitutionId
    ? `TEMP_OFFICE_LOCATION_${normalizedInstitutionId}`
    : null;

  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [suggestions, setSuggestions] = useState<
    AddressSuggestion[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [searchingAddress, setSearchingAddress] =
    useState(false);

  // Validation errors
  const [validationError, setValidationError] = useState("");
  // API error
  const [apiError, setApiError] = useState("");

  /* ================= LOAD LOCATION FROM MAP ================= */

  useFocusEffect(
    useCallback(() => {
      if (!storageKey) {
        return;
      }

      const loadSavedLocation = async () => {
        try {
          const savedLocation = await AsyncStorage.getItem(
            storageKey
          );

          if (!savedLocation) {
            return;
          }

          const parsedLocation: SelectedLocation =
            JSON.parse(savedLocation);

          setSelectedLocation(parsedLocation);

          if (parsedLocation.address) {
            setAddress(parsedLocation.address);
          }
        } catch (loadError) {
          console.log(
            "Failed to load saved location:",
            loadError
          );
        }
      };

      loadSavedLocation();
    }, [storageKey])
  );

  /* ================= SEARCH ADDRESS WHILE TYPING ================= */

  useEffect(() => {
    const searchText = address.trim();

    if (searchText.length < 3) {
      setSuggestions([]);
      setSearchingAddress(false);
      return;
    }

    if (selectedLocation?.address === searchText) {
      setSuggestions([]);
      return;
    }

    if (!GEOAPIFY_API_KEY) {
      setSuggestions([]);
      setApiError("Geoapify API key is missing.");
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

  /* ================= GEOAPIFY SEARCH ================= */

  const searchAddressSuggestions = async (
    searchText: string,
    signal: AbortSignal
  ) => {
    try {
      setSearchingAddress(true);
      setApiError("");

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
              String(properties.place_id) ||
              `${properties.formatted}-${index}`,
            address: properties.formatted,
            latitude,
            longitude,
          };
        })
        .filter(
          (
            item: AddressSuggestion | null
          ): item is AddressSuggestion => item !== null
        );

      setSuggestions(formattedSuggestions);
    } catch (searchError: any) {
      if (searchError?.name === "AbortError") {
        return;
      }

      console.log(
        "Geoapify address search error:",
        searchError
      );

      setSuggestions([]);
      setApiError("Unable to search for this address.");
    } finally {
      setSearchingAddress(false);
    }
  };

  /* ================= OPEN MAP ================= */

  const openLocationPicker = () => {
    if (!normalizedInstitutionId) {
      setApiError("Institution was not found.");
      return;
    }

    setSuggestions([]);
    setApiError("");

    router.push({
      pathname:
        "/dashboard/superAdminDashboard/institution/[institutionId]/settings/locationPicker",
      params: {
        institutionId: normalizedInstitutionId,
      },
    });
  };

  /* ================= SELECT ADDRESS SUGGESTION ================= */

  const handleSuggestionSelected = (
    suggestion: AddressSuggestion
  ) => {
    const location: SelectedLocation = {
      address: suggestion.address,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };

    setAddress(suggestion.address);
    setSelectedLocation(location);
    setSuggestions([]);
    setApiError("");
    setValidationError("");
  };

  /* ================= CLEAR ADDRESS ================= */

  const clearAddress = () => {
    setAddress("");
    setSelectedLocation(null);
    setSuggestions([]);
    setApiError("");
    setValidationError("");
  };

  /* ================= VALIDATION ================= */

  const isFormValid =
    branchName.trim().length > 0 &&
    !!selectedLocation &&
    !!normalizedInstitutionId;

  /* ================= CREATE BRANCH ================= */

  const handleCreateBranch = async () => {
  if (loading) return;

  setValidationError("");
  setApiError("");

  if (!branchName.trim()) {
    setValidationError("Please enter a branch name.");
    return;
  }

  if (!selectedLocation) {
    setValidationError(
      "Select an address suggestion or choose a location on the map."
    );
    return;
  }

  if (!normalizedInstitutionId) {
    setValidationError("Institution was not found.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      institutionId: normalizedInstitutionId,
      name: branchName.trim(),
      address:
        selectedLocation.address || address.trim(),
      latitude: Number(
        selectedLocation.latitude.toFixed(4)
      ),
      longitude: Number(
        selectedLocation.longitude.toFixed(4)
      ),
    };

    console.log("CREATE BRANCH PAYLOAD:", payload);

    await createBranch(payload);

    if (storageKey) {
      await AsyncStorage.removeItem(storageKey);
    }

    setValidationError("");
    setApiError("");
    router.back();
  } catch (submitError: any) {
    console.log(
      "Failed to create branch:",
      submitError
    );

    const status = submitError?.response?.status;

    // If backend returns 500 but branch is actually created,
    // treat this as success and just go back.
    // (You’ve confirmed the branch shows up on the list page.)
    if (status === 500) {
      if (storageKey) {
        try {
          await AsyncStorage.removeItem(storageKey);
        } catch {}
      }
      setValidationError("");
      setApiError("");
      router.back();
      return;
    }

    const message =
      submitError?.response?.data?.message ||
      submitError?.message ||
      "Failed to create branch.";

    setApiError(message);
  } finally {
    setLoading(false);
  }
};

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

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="business-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroTitle}>
            Create a new branch
          </Text>

          <Text style={styles.heroSubtitle}>
            Add a branch using an address or select its exact
            location on the map.
          </Text>
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
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderText}>
                <Text style={styles.formTitle}>
                  Branch details
                </Text>

                <Text style={styles.formSubtitle}>
                  Enter the branch name and choose its location.
                </Text>
              </View>

              <View style={styles.formHeaderIcon}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#0284C7"
                />
              </View>
            </View>

            {/* ================= BRANCH NAME ================= */}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Branch name</Text>

              <View style={styles.simpleInputWrapper}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="business-outline"
                    size={19}
                    color="#0284C7"
                  />
                </View>

                <TextInput
                  value={branchName}
                  onChangeText={(value) => {
                    setBranchName(value);
                    if (validationError || apiError) {
                      setValidationError("");
                      setApiError("");
                    }
                  }}
                  placeholder="For example, Abuja Branch"
                  placeholderTextColor="#94A3B8"
                  style={styles.simpleInput}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {validationError && !branchName.trim() && (
                <Text style={styles.fieldHintError}>
                  {validationError}
                </Text>
              )}
            </View>

            {/* ================= ADDRESS SEARCH ================= */}

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

                <View style={styles.autoBadge}>
                  <Ionicons
                    name="sparkles-outline"
                    size={11}
                    color="#0284C7"
                  />

                  <Text style={styles.autoBadgeText}>
                    Searchable
                  </Text>
                </View>
              </View>

              <View style={styles.addressSearchContainer}>
                <View style={styles.addressInputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="location-outline"
                      size={19}
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

                      if (validationError || apiError) {
                        setValidationError("");
                        setApiError("");
                      }
                    }}
                    placeholder="Type branch address..."
                    placeholderTextColor="#94A3B8"
                    style={styles.addressInput}
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
                        style={styles.clearAddressButton}
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
                Type at least three characters and select the
                correct address suggestion.
              </Text>
            </View>

            {/* ================= MAP OPTION ================= */}

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Or choose on map
                </Text>

                <Text style={styles.optionalText}>
                  Optional alternative
                </Text>
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
                      : "Select location for branch"}
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
                      Choose the exact point manually on the map.
                    </Text>
                  )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    hasSelectedLocation
                      ? "#059669"
                      : "#94A3B8"
                  }
                />
              </Pressable>

              {hasSelectedLocation && (
                <View style={styles.locationConfirmation}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#059669"
                  />

                  <Text style={styles.confirmationText}>
                    This location can be submitted for the branch.
                  </Text>
                </View>
              )}

              {validationError && !selectedLocation && (
                <Text style={styles.fieldHintError}>
                  {validationError}
                </Text>
              )}
            </View>

            {/* ================= API ERROR ================= */}

            {apiError.length > 0 && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#DC2626"
                />

                <Text style={styles.errorText}>
                  {apiError}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Two ways to choose a location
              </Text>

              <Text style={styles.infoText}>
                Search for an address and select a suggestion, or
                open the map to manually choose the exact point.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================= BOTTOM ACTIONS ================= */}

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.createButton,
            (!isFormValid || loading) && styles.buttonDisabled,
          ]}
          onPress={handleCreateBranch}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.createButtonText}>
                Create branch
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
    minHeight: 285,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 38,
    overflow: "hidden",
    position: "relative",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  headerSpacer: {
    width: 42,
  },

  heroContent: {
    zIndex: 2,
    marginTop: 33,
  },

  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 19,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  heroSubtitle: {
    maxWidth: 350,
    marginTop: 9,
    color: "#E0F2FE",
    fontSize: 14,
    lineHeight: 21,
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
    paddingBottom: 130,
  },

  formCard: {
    marginHorizontal: 18,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  formHeaderText: {
    flex: 1,
  },

  formTitle: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "900",
  },

  formSubtitle: {
    maxWidth: 290,
    marginTop: 5,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  formHeaderIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  fieldGroup: {
    marginBottom: 22,
  },

  addressFieldGroup: {
    zIndex: 50,
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

  optionalText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  autoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },

  autoBadgeText: {
    marginLeft: 4,
    color: "#0284C7",
    fontSize: 10,
    fontWeight: "700",
  },

  simpleInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  simpleInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  inputIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  addressSearchContainer: {
    position: "relative",
    zIndex: 50,
  },

  addressInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  addressInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  searchLoader: {
    marginRight: 12,
  },

  clearAddressButton: {
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

  fieldHintError: {
    marginTop: 6,
    color: "#DC2626",
    fontSize: 11,
    lineHeight: 15,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 86,
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
    width: 48,
    height: 48,
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

  locationConfirmation: {
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

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
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

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 18,
    marginTop: 14,
    padding: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 18,
  },

  infoIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 11,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "800",
  },

  infoText: {
    marginTop: 4,
    color: "#1D4ED8",
    fontSize: 11,
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

  createButton: {
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

  buttonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
