// ======================= EditProfile.tsx =======================

import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  getProfile,
  updateProfile,
} from "../../../../services/authService";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryDark: "#0369A1",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
};

type IconName = keyof typeof Ionicons.glyphMap;

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
};

type FormErrors = Partial<
  Record<keyof ProfileForm, string>
>;

export default function EditProfile() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      const profile =
        response?.data?.data;

      if (response?.data?.success && profile) {
        setForm({
          name: profile.name || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
      }
    } catch (error: any) {
      console.error(
        "[EditProfile] Load error:",
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        "Profile unavailable",
        "We could not load your profile information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Full name is required.";
    }

    if (
      form.phone.trim() &&
      form.phone.trim().length < 7
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

    if (
      form.address.trim() &&
      form.address.trim().length < 5
    ) {
      nextErrors.address =
        "Enter a more complete address.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (saving) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      Alert.alert(
        "Profile updated",
        "Your profile has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "[EditProfile] Update error:",
        error?.response?.data ||
          error?.message
      );

      const message =
        error?.response?.data?.message ||
        "Failed to update your profile.";

      Alert.alert(
        "Update failed",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading your profile
          </Text>

          <Text style={styles.loadingText}>
            Please wait a moment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.headerEyebrow}>
                ACCOUNT SETTINGS
              </Text>

              <Text style={styles.headerTitle}>
                Edit profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Keep your account information up to date.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* INTRO CARD */}

          <View style={styles.introCard}>
            <View style={styles.personIcon}>
              <Ionicons
                name="person"
                size={31}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>
                Personal information
              </Text>

              <Text style={styles.introText}>
                Update the information connected to your account.
              </Text>
            </View>
          </View>

          {/* FORM CARD */}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Your details
            </Text>

            <Text style={styles.formSubtitle}>
              Make your changes below and save when finished.
            </Text>

            <FormField
              icon="person-outline"
              label="Full name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={(value) =>
                updateField("name", value)
              }
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <FormField
              icon="call-outline"
              label="Phone number"
              placeholder="Enter your phone number"
              value={form.phone}
              onChangeText={(value) =>
                updateField("phone", value)
              }
              error={errors.phone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <FormField
              icon="location-outline"
              label="Address"
              placeholder="Enter your address"
              value={form.address}
              onChangeText={(value) =>
                updateField("address", value)
              }
              error={errors.address}
              multiline
              textArea
              autoCapitalize="sentences"
              returnKeyType="done"
            />

            <Text style={styles.formHint}>
              Full name is required. Phone number and address are optional.
            </Text>
          </View>

          {/* SECURITY CARD */}

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={COLORS.success}
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>
                Your information is protected
              </Text>

              <Text style={styles.securityText}>
                Changes are securely saved to your account.
              </Text>
            </View>
          </View>

          {/* SAVE */}

          <Pressable
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />

                <Text style={styles.saveText}>
                  Saving changes...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={COLORS.white}
                />

                <Text style={styles.saveText}>
                  Save changes
                </Text>
              </>
            )}
          </Pressable>

          {/* CANCEL */}

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= FORM FIELD ================= */

function FormField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  textArea = false,
  keyboardType = "default",
  autoCapitalize = "none",
  returnKeyType = "done",
}: {
  icon: IconName;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  textArea?: boolean;
  keyboardType?: "default" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  returnKeyType?: "done" | "next";
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          textArea && styles.textAreaContainer,
          hasError &&
            styles.inputContainerError,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            hasError
              ? COLORS.danger
              : COLORS.muted
          }
          style={styles.inputIcon}
        />

        <TextInput
          style={[
            styles.input,
            textArea && styles.textArea,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.subtle}
          multiline={multiline}
          numberOfLines={textArea ? 4 : 1}
          textAlignVertical={
            textArea ? "top" : "center"
          }
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
        />
      </View>

      {hasError && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={COLORS.danger}
          />

          <Text style={styles.errorMessage}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 23,
  },

  loadingTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 21,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
  },

  headerSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  headerIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 20,
  },

  personIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 19,
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: "900",
  },

  introText: {
    marginTop: 4,
    color: "#075985",
    fontSize: 10,
    lineHeight: 15,
  },

  formCard: {
    marginTop: 16,
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
  },

  formTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  formSubtitle: {
    marginTop: 4,
    marginBottom: 20,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  fieldWrapper: {
    marginBottom: 17,
  },

  fieldLabel: {
    marginBottom: 7,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 105,
    paddingTop: 14,
  },

  inputContainerError: {
    backgroundColor: COLORS.dangerLight,
    borderColor: "#FCA5A5",
  },

  inputIcon: {
    marginRight: 9,
  },

  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 13,
  },

  textArea: {
    minHeight: 80,
    paddingTop: 0,
    lineHeight: 19,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  errorMessage: {
    marginLeft: 4,
    color: COLORS.danger,
    fontSize: 10,
  },

  formHint: {
    color: COLORS.subtle,
    fontSize: 10,
    lineHeight: 15,
  },

  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 14,
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 17,
  },

  securityIcon: {
    width: 41,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 13,
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "900",
  },

  securityText: {
    marginTop: 3,
    color: "#166534",
    fontSize: 10,
    lineHeight: 14,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 53,
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 15,
  },

  cancelText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "900",
  },

  bottomSpace: {
    height: 15,
  },
});
