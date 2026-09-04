// CreateStaff.tsx

import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
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

import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  assignStaffToBranchByAdmin,
  assignStaffToShiftByAdmin,
  createShiftByAdmin,
  createStaffByAdmin,
} from "@/services/superAdminServices";

/* ================= COLORS ================= */

const PRIMARY = "#0284C7";
const PRIMARY_DARK = "#075985";
const PRIMARY_SOFT = "#E0F2FE";
const PRIMARY_BORDER = "#BAE6FD";
const BORDER = "#CBD5E1";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const ERROR = "#DC2626";

/* ================= TYPES ================= */

type EmploymentType = "full-time" | "part-time";

type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type StaffSchedule = Record<WeekDay, DaySchedule>;

type FormState = {
  name: string;
  email: string;
  departmentOrUnit: string;
  studentOrStaffId: string;
  password: string;
  employmentType: EmploymentType;
  schedule: StaffSchedule;
};

type FieldName =
  | "name"
  | "email"
  | "departmentOrUnit"
  | "studentOrStaffId"
  | "password";

type FieldProps = {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

/* ================= CONSTANTS ================= */

const weekDays: {
  key: WeekDay;
  label: string;
  apiLabel: string;
}[] = [
  {
    key: "monday",
    label: "Monday",
    apiLabel: "Mon",
  },
  {
    key: "tuesday",
    label: "Tuesday",
    apiLabel: "Tue",
  },
  {
    key: "wednesday",
    label: "Wednesday",
    apiLabel: "Wed",
  },
  {
    key: "thursday",
    label: "Thursday",
    apiLabel: "Thu",
  },
  {
    key: "friday",
    label: "Friday",
    apiLabel: "Fri",
  },
  {
    key: "saturday",
    label: "Saturday",
    apiLabel: "Sat",
  },
  {
    key: "sunday",
    label: "Sunday",
    apiLabel: "Sun",
  },
];

const createDefaultSchedule = (): StaffSchedule => ({
  monday: {
    enabled: true,
    startTime: "08:00",
    endTime: "13:00",
  },
  tuesday: {
    enabled: false,
    startTime: "08:00",
    endTime: "13:00",
  },
  wednesday: {
    enabled: true,
    startTime: "08:00",
    endTime: "13:00",
  },
  thursday: {
    enabled: false,
    startTime: "08:00",
    endTime: "13:00",
  },
  friday: {
    enabled: true,
    startTime: "08:00",
    endTime: "13:00",
  },
  saturday: {
    enabled: false,
    startTime: "08:00",
    endTime: "13:00",
  },
  sunday: {
    enabled: false,
    startTime: "08:00",
    endTime: "13:00",
  },
});

/* ================= SCREEN ================= */

export default function CreateStaff() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    institutionId?: string | string[];
    branchId?: string | string[];
    branchName?: string | string[];
  }>();

  const {
    user,
    loading: authLoading,
    initialized: authInitialized,
  } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  const institutionId = getParam(
    params.institutionId
  ) ||
    profile?.institutionId ||
    user?.institutionId ||
    undefined;

  const branchId = getParam(
    params.branchId
  ) ||
    user?.branchId ||
    undefined;

  const branchName =
    getParam(params.branchName) ||
    "Selected branch";

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    departmentOrUnit: "",
    studentOrStaffId: "",
    password: "",
    employmentType: "full-time",
    schedule: createDefaultSchedule(),
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    Boolean(institutionId) &&
    Boolean(branchId) &&
    !loading;

  const completion = useMemo(() => {
    const fields = Object.values(form).filter(
      (_, key) => key !== "schedule"
    );

    const completed = fields.filter(
      (value) => typeof value === "string" && value.trim().length > 0
    ).length;

    return Math.round((completed / fields.length) * 100);
  }, [form]);

  console.log(
    "[CreateStaff] Identifiers:",
    {
      institutionId,
      branchId,
      branchName,
      userId: user?.id,
      completion,
    }
  );

  const updateField = (
    field: FieldName,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");

    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const updateEmploymentType = (employmentType: EmploymentType) => {
    setForm((previous) => ({
      ...previous,
      employmentType,
    }));

    setError("");
  };

  const updateScheduleField = (
    day: WeekDay,
    field: keyof DaySchedule,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      schedule: {
        ...previous.schedule,
        [day]: {
          ...previous.schedule[day],
          [field]: value,
        },
      },
    }));

    setError("");
  };

  const toggleDay = (day: WeekDay) => {
    setForm((previous) => ({
      ...previous,
      schedule: {
        ...previous.schedule,
        [day]: {
          ...previous.schedule[day],
          enabled: !previous.schedule[day].enabled,
        },
      },
    }));

    setError("");
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Enter the staff member's full name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Enter an email address.";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.departmentOrUnit.trim()) {
      nextErrors.departmentOrUnit = "Enter a department or unit.";
    }

    if (!form.studentOrStaffId.trim()) {
      nextErrors.studentOrStaffId = "Enter a staff ID.";
    }

    if (!form.password) {
      nextErrors.password = "Create a temporary password.";
    } else if (form.password.length < 6) {
      nextErrors.password =
        "Password must contain at least 6 characters.";
    }

    if (!institutionId) {
      setError("Institution information is missing.");
    }

    if (!branchId) {
      setError("Branch information is missing.");
    }

    setFieldErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0 &&
      Boolean(institutionId) &&
      Boolean(branchId)
    );
  };

  /* ================= SHIFT HELPERS ================= */

  const isValidTime = (time: string) => {
    const timeParts = time.split(":");

    if (timeParts.length !== 2) {
      return false;
    }

    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    return (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    );
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const validateSchedule = () => {
    if (form.employmentType === "full-time") {
      return "";
    }

    const selectedDays = weekDays.filter(
      (day) => form.schedule[day.key].enabled
    );

    if (selectedDays.length === 0) {
      return "Please select at least one part-time working day.";
    }

    for (const day of selectedDays) {
      const currentDay = form.schedule[day.key];

      if (!isValidTime(currentDay.startTime)) {
        return `${day.label}: enter a valid start time using HH:mm.`;
      }

      if (!isValidTime(currentDay.endTime)) {
        return `${day.label}: enter a valid end time using HH:mm.`;
      }

      const startMinutes = timeToMinutes(currentDay.startTime);
      const endMinutes = timeToMinutes(currentDay.endTime);

      if (endMinutes <= startMinutes) {
        return `${day.label}: end time must be later than start time.`;
      }
    }

    return "";
  };

  const getSelectedScheduleDays = () => {
    return weekDays.filter((day) => form.schedule[day.key].enabled);
  };

  const getShiftTimeRange = () => {
    const selectedDays = getSelectedScheduleDays();

    if (selectedDays.length === 0) {
      return null;
    }

    const firstDay = form.schedule[selectedDays[0].key];

    const allSameTime = selectedDays.every((day) => {
      const currentDay = form.schedule[day.key];
      return (
        currentDay.startTime === firstDay.startTime &&
        currentDay.endTime === firstDay.endTime
      );
    });

    if (!allSameTime) {
      return null;
    }

    return {
      startTime: firstDay.startTime,
      endTime: firstDay.endTime,
    };
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const scheduleError = validateSchedule();
    if (scheduleError) {
      setError(scheduleError);
      return;
    }

    if (!institutionId || !branchId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        departmentOrUnit: form.departmentOrUnit.trim(),
        studentOrStaffId: form.studentOrStaffId.trim(),
        password: form.password,
        role: ["staff"],
        employmentType: form.employmentType,
      };

      console.log(
        "📤 [CreateStaff] Creating staff payload:",
        {
          ...payload,
          institutionId,
          branchId,
        }
      );

      const createResponse = await createStaffByAdmin(payload);

      console.log(
        "📥 [CreateStaff] Staff creation response:",
        createResponse
      );

      const createdUser =
        createResponse?.data?.user ||
        createResponse?.data?.data?.user ||
        createResponse?.data?.data ||
        createResponse?.data;

      console.log(
        "🔍 [CreateStaff] Extracted createdUser:",
        createdUser
      );

      if (!createdUser?._id) {
        console.error(
          "❌ [CreateStaff] Staff creation failed - no _id:",
          {
            createResponse,
            createdUser,
          }
        );
        throw new Error(
          "Staff was created but no user ID was returned."
        );
      }

      const createdUserId = createdUser._id;

      console.log(
        "✅ [CreateStaff] Staff created with ID:",
        {
          staffId: createdUserId,
          name: createdUser.name,
        }
      );

      await assignStaffToBranchByAdmin(
        institutionId,
        createdUserId,
        branchId
      );

      console.log(
        "✅ [CreateStaff] Staff assigned to branch:",
        {
          staffId: createdUserId,
          branchId,
        }
      );

      /*
       * Full-time staff:
       * No shift is created. They follow branch rules.
       */

      if (form.employmentType === "part-time") {
        const selectedDays = getSelectedScheduleDays();
        const repeatDays = selectedDays.map((day) => day.apiLabel);
        const shiftTimeRange = getShiftTimeRange();

        console.log("🕐 [CreateStaff] Part-time shift config:", {
          selectedDays,
          repeatDays,
          shiftTimeRange,
        });

        if (shiftTimeRange) {
          /*
           * All selected days use the same time range,
           * so one shift is enough.
           */
          const shiftPayload = {
            name: `${form.name.trim()} Part-time Shift`,
            startTime: shiftTimeRange.startTime,
            endTime: shiftTimeRange.endTime,
            gracePeriod: 10,
            branchId: branchId!,
            repeatDays,
          };

          console.log(
            "📤 [CreateStaff] Creating shift payload:",
            shiftPayload
          );

          const shiftResponse = await createShiftByAdmin(shiftPayload);

          console.log(
            "📥 [CreateStaff] Shift response:",
            shiftResponse
          );

          // ✅ FIXED: Backend returns { data: { data: {...} } }
          const createdShift = shiftResponse?.data?.data;

          console.log(
            "🔍 [CreateStaff] Extracted createdShift:",
            createdShift
          );

          if (!createdShift?._id) {
            console.error(
              "❌ [CreateStaff] Shift creation failed - no _id:",
              {
                shiftResponse,
                createdShift,
              }
            );
            throw new Error(
              "Staff was created, but the part-time shift was not created."
            );
          }

          console.log(
            "✅ [CreateStaff] Shift created with ID:",
            createdShift._id
          );

          await assignStaffToShiftByAdmin(
            createdShift._id,
            [createdUserId]
          );

          console.log(
            "✅ [CreateStaff] Staff assigned to shift:",
            createdShift._id
          );
        } else {
          /*
           * Different days have different times.
           * Create one shift per unique time range.
           */
          const shiftGroups = new Map<
            string,
            {
              startTime: string;
              endTime: string;
              repeatDays: string[];
            }
          >();

          selectedDays.forEach((day) => {
            const currentDay = form.schedule[day.key];

            const groupKey = `${currentDay.startTime}-${currentDay.endTime}`;

            const existingGroup = shiftGroups.get(groupKey);

            if (existingGroup) {
              existingGroup.repeatDays.push(day.apiLabel);
            } else {
              shiftGroups.set(groupKey, {
                startTime: currentDay.startTime,
                endTime: currentDay.endTime,
                repeatDays: [day.apiLabel],
              });
            }
          });

          console.log(
            "🔄 [CreateStaff] Shift groups:",
            Array.from(shiftGroups.entries())
          );

          for (const [groupKey, shiftGroup] of shiftGroups.entries()) {
            console.log(
              "📤 [CreateStaff] Creating shift group payload:",
              {
                groupKey,
                shiftGroup,
              }
            );

            const shiftResponse = await createShiftByAdmin({
              name: `${form.name.trim()} Part-time Shift`,
              startTime: shiftGroup.startTime,
              endTime: shiftGroup.endTime,
              gracePeriod: 10,
              branchId: branchId!,
              repeatDays: shiftGroup.repeatDays,
            });

            console.log(
              "📥 [CreateStaff] Shift group response:",
              shiftResponse
            );

            // ✅ FIXED: Backend returns { data: { data: {...} } }
            const createdShift = shiftResponse?.data?.data;

            console.log(
              "🔍 [CreateStaff] Extracted createdShift:",
              createdShift
            );

            if (!createdShift?._id) {
              console.error(
                "❌ [CreateStaff] Shift group creation failed - no _id:",
                {
                  groupKey,
                  shiftResponse,
                  createdShift,
                }
              );
              throw new Error(
                "Staff was created, but one of the part-time shifts was not created."
              );
            }

            console.log(
              "✅ [CreateStaff] Shift group created with ID:",
              createdShift._id
            );

            await assignStaffToShiftByAdmin(
              createdShift._id,
              [createdUserId]
            );

            console.log(
              "✅ [CreateStaff] Staff assigned to shift group:",
              createdShift._id
            );
          }
        }
      }

      console.log(
        "✅ [CreateStaff] Staff and schedule created successfully."
      );

      Alert.alert(
        "Staff created",
        `${payload.name} has been created and assigned to ${branchName}.`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace({
                pathname:
                  "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]",
                params: {
                  institutionId,
                  branchId,
                },
              });
            },
          },
        ]
      );
    } catch (submitError: any) {
      console.error(
        "❌ [CreateStaff] Failed:",
        {
          message: submitError?.message,
          status: submitError?.response?.status,
          data: submitError?.response?.data,
          fullError: submitError,
        }
      );

      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.error ||
          submitError?.message ||
          "Failed to create staff."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !authInitialized || profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />

        <Text style={styles.loadingText}>
          Preparing staff form...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color={TEXT} />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>STAFF MANAGEMENT</Text>

              <Text style={styles.headerTitle}>Add staff member</Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="person-add-outline"
                size={21}
                color={PRIMARY}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* INTRO */}

            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Ionicons name="people-outline" size={25} color={PRIMARY} />
              </View>

              <View style={styles.introText}>
                <Text style={styles.introTitle}>Create a team account</Text>

                <Text style={styles.introDescription}>
                  Add a staff member and assign them to the selected branch.
                </Text>
              </View>
            </View>

            {/* BRANCH CARD */}

            <View style={styles.branchCard}>
              <View style={styles.branchIcon}>
                <Ionicons
                  name="business-outline"
                  size={21}
                  color={PRIMARY}
                />
              </View>

              <View style={styles.branchText}>
                <Text style={styles.branchLabel}>ASSIGNING TO</Text>

                <Text style={styles.branchName}>{branchName}</Text>

                <Text style={styles.branchId}>
                  Branch ID: {branchId || "Missing"}
                </Text>
              </View>

              <View style={styles.assignedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#047857" />

                <Text style={styles.assignedText}>Ready</Text>
              </View>
            </View>

            {/* EMPLOYMENT TYPE */}

            <View style={styles.employmentCard}>
              <Text style={styles.employmentLabel}>Employment type</Text>

              <View style={styles.employmentOptions}>
                <Pressable
                  style={[
                    styles.employmentOption,
                    form.employmentType === "full-time" &&
                      styles.employmentOptionActive,
                  ]}
                  onPress={() => updateEmploymentType("full-time")}
                >
                  <Text
                    style={[
                      styles.employmentOptionText,
                      form.employmentType === "full-time" &&
                        styles.employmentOptionTextActive,
                    ]}
                  >
                    Full-time
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.employmentOption,
                    form.employmentType === "part-time" &&
                      styles.employmentOptionActive,
                  ]}
                  onPress={() => updateEmploymentType("part-time")}
                >
                  <Text
                    style={[
                      styles.employmentOptionText,
                      form.employmentType === "part-time" &&
                        styles.employmentOptionTextActive,
                    ]}
                  >
                    Part-time
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* SCHEDULE (Part-time only) */}

            {form.employmentType === "part-time" && (
              <View style={styles.scheduleCard}>
                <Text style={styles.scheduleTitle}>Working days</Text>

                <Text style={styles.scheduleSubtitle}>
                  Select the days this staff member will work.
                </Text>

                {weekDays.map((day) => {
                  const daySchedule = form.schedule[day.key];

                  return (
                    <View key={day.key} style={styles.dayRow}>
                      <Pressable
                        style={[
                          styles.dayToggle,
                          daySchedule.enabled && styles.dayToggleActive,
                        ]}
                        onPress={() => toggleDay(day.key)}
                      >
                        <Ionicons
                          name={
                            daySchedule.enabled
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={20}
                          color={
                            daySchedule.enabled ? "#FFFFFF" : PRIMARY
                          }
                        />

                        <Text
                          style={[
                            styles.dayLabel,
                            daySchedule.enabled && styles.dayLabelActive,
                          ]}
                        >
                          {day.label}
                        </Text>
                      </Pressable>

                      {daySchedule.enabled && (
                        <View style={styles.dayTimes}>
                          <TextInput
                            style={styles.timeInput}
                            value={daySchedule.startTime}
                            onChangeText={(value) =>
                              updateScheduleField(
                                day.key,
                                "startTime",
                                value
                              )
                            }
                            placeholder="08:00"
                            keyboardType="numeric"
                            maxLength={5}
                          />

                          <Text style={styles.timeSeparator}>to</Text>

                          <TextInput
                            style={styles.timeInput}
                            value={daySchedule.endTime}
                            onChangeText={(value) =>
                              updateScheduleField(
                                day.key,
                                "endTime",
                                value
                              )
                            }
                            placeholder="17:00"
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* PROGRESS */}

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Form completion</Text>

              <Text style={styles.progressValue}>{completion}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completion}%` },
                ]}
              />
            </View>

            {/* FORM */}

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Staff information</Text>

              <Text style={styles.formSubtitle}>
                Enter the staff member's account details.
              </Text>

              <Field
                label="Full name"
                placeholder="e.g. Sarah Johnson"
                icon="person-outline"
                value={form.name}
                onChangeText={(value) => updateField("name", value)}
                error={fieldErrors.name}
              />

              <Field
                label="Email address"
                placeholder="e.g. sarah@example.com"
                icon="mail-outline"
                value={form.email}
                keyboardType="email-address"
                onChangeText={(value) => updateField("email", value)}
                error={fieldErrors.email}
              />

              <Field
                label="Department or unit"
                placeholder="e.g. Finance"
                icon="briefcase-outline"
                value={form.departmentOrUnit}
                onChangeText={(value) =>
                  updateField("departmentOrUnit", value)
                }
                error={fieldErrors.departmentOrUnit}
              />

              <Field
                label="Staff ID"
                placeholder="e.g. STF-001"
                icon="card-outline"
                value={form.studentOrStaffId}
                onChangeText={(value) =>
                  updateField("studentOrStaffId", value)
                }
                error={fieldErrors.studentOrStaffId}
              />

              <Field
                label="Temporary password"
                placeholder="Minimum 6 characters"
                icon="lock-closed-outline"
                value={form.password}
                secureTextEntry={!showPassword}
                onChangeText={(value) => updateField("password", value)}
                error={fieldErrors.password}
                rightIcon={
                  showPassword ? "eye-off-outline" : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowPassword((previous) => !previous)
                }
              />
            </View>

            {/* ROLE NOTICE */}

            <View style={styles.roleNotice}>
              <View style={styles.roleIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={PRIMARY}
                />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>Staff access</Text>

                <Text style={styles.roleDescription}>
                  This account will be created with staff permissions and
                  will not have admin access.
                </Text>
              </View>
            </View>

            {error.length > 0 && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={ERROR}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.bottomGap} />
          </ScrollView>

          {/* FOOTER BUTTON */}

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.submitText}>
                    Create and assign staff
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= FIELD ================= */

function Field({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          error && styles.inputWrapperError,
        ]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={error ? ERROR : PRIMARY}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        {rightIcon && (
          <Pressable
            style={styles.inputRightButton}
            onPress={onRightIconPress}
            hitSlop={8}
          >
            <Ionicons name={rightIcon} size={20} color={MUTED} />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

/* ================= HELPERS ================= */

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitle: {
    marginTop: 3,
    color: TEXT,
    fontSize: 20,
    fontWeight: "900",
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 14,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 115,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 18,
  },

  introIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
  },

  introText: {
    flex: 1,
    marginLeft: 11,
  },

  introTitle: {
    color: PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "900",
  },

  introDescription: {
    marginTop: 4,
    color: "#0369A1",
    fontSize: 11,
    lineHeight: 16,
  },

  branchCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
  },

  branchIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 14,
  },

  branchText: {
    flex: 1,
    marginLeft: 10,
  },

  branchLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  branchName: {
    marginTop: 4,
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },

  branchId: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
  },

  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#ECFDF5",
    borderRadius: 9,
  },

  assignedText: {
    marginLeft: 4,
    color: "#047857",
    fontSize: 9,
    fontWeight: "900",
  },

  employmentCard: {
    marginTop: 19,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
  },

  employmentLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },

  employmentOptions: {
    flexDirection: "row",
    gap: 10,
  },

  employmentOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    alignItems: "center",
  },

  employmentOptionActive: {
    backgroundColor: PRIMARY_SOFT,
    borderColor: PRIMARY,
  },

  employmentOptionText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },

  employmentOptionTextActive: {
    color: PRIMARY_DARK,
    fontWeight: "900",
  },

  scheduleCard: {
    marginTop: 15,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
  },

  scheduleTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },

  scheduleSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: MUTED,
    fontSize: 11,
  },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  dayToggle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dayToggleActive: {
    opacity: 1,
  },

  dayLabel: {
    marginLeft: 8,
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
  },

  dayLabelActive: {
    color: TEXT,
    fontWeight: "700",
  },

  dayTimes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timeInput: {
    width: 60,
    height: 36,
    paddingHorizontal: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    color: TEXT,
    fontSize: 12,
    textAlign: "center",
  },

  timeSeparator: {
    color: MUTED,
    fontSize: 11,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 7,
  },

  progressLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
  },

  progressValue: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
  },

  progressTrack: {
    height: 7,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },

  formCard: {
    marginTop: 19,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
  },

  formTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  formSubtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: MUTED,
    fontSize: 11,
  },

  fieldGroup: {
    marginBottom: 15,
  },

  fieldLabel: {
    marginBottom: 7,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 53,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
  },

  inputWrapperError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF7F7",
  },

  inputIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 11,
  },

  input: {
    flex: 1,
    minHeight: 51,
    paddingHorizontal: 11,
    color: TEXT,
    fontSize: 13,
  },

  inputRightButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldError: {
    marginTop: 5,
    color: ERROR,
    fontSize: 10,
  },

  roleNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
  },

  roleIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 10,
  },

  roleText: {
    flex: 1,
    marginLeft: 9,
  },

  roleTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "900",
  },

  roleDescription: {
    marginTop: 3,
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 16,
  },

  bottomGap: {
    height: 20,
  },

  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_DARK,
    borderRadius: 15,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitText: {
    marginHorizontal: 9,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
