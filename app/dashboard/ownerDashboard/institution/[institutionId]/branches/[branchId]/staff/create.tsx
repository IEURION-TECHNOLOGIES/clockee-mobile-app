import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useProfile } from "@/hooks/useProfile";
import {
  assignStaffToBranchByAdmin,
  assignStaffToShiftByAdmin,
  createShiftByAdmin,
  createStaffByAdmin,
} from "@/services/superAdminServices";

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

type StaffForm = {
  name: string;
  email: string;
  departmentOrUnit: string;
  studentOrStaffId: string;
  password: string;
  employmentType: EmploymentType;
  schedule: StaffSchedule;
};

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  showPasswordButton?: boolean;
  onTogglePassword?: () => void;
  passwordVisible?: boolean;
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

/* ================= COMPONENT ================= */

export default function CreateStaff() {
  const router = useRouter();

  const {
    branchId: rawBranchId,
  } = useLocalSearchParams<{
    branchId: string;
  }>();

  const branchId = Array.isArray(rawBranchId)
    ? rawBranchId[0]
    : rawBranchId;

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  const institutionId = profile?.institutionId;

  const [form, setForm] = useState<StaffForm>({
    name: "",
    email: "",
    departmentOrUnit: "",
    studentOrStaffId: "",
    password: "",
    employmentType: "full-time",
    schedule: createDefaultSchedule(),
  });

  const [passwordVisible, setPasswordVisible] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Institution ID:", institutionId);
    console.log("Branch ID:", branchId);
  }, [institutionId, branchId]);

  /* ================= FORM UPDATES ================= */

  const updateField = (
    field: keyof Pick<
      StaffForm,
      | "name"
      | "email"
      | "departmentOrUnit"
      | "studentOrStaffId"
      | "password"
    >,
    value: string
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setError("");
  };

  const updateEmploymentType = (
    employmentType: EmploymentType
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      employmentType,
    }));

    setError("");
  };

  const updateScheduleField = (
    day: WeekDay,
    field: keyof DaySchedule,
    value: string
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      schedule: {
        ...previousForm.schedule,
        [day]: {
          ...previousForm.schedule[day],
          [field]: value,
        },
      },
    }));

    setError("");
  };

  const toggleDay = (day: WeekDay) => {
    setForm((previousForm) => ({
      ...previousForm,
      schedule: {
        ...previousForm.schedule,
        [day]: {
          ...previousForm.schedule[day],
          enabled: !previousForm.schedule[day].enabled,
        },
      },
    }));

    setError("");
  };

  /* ================= VALIDATION ================= */

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
    const [hours, minutes] = time
      .split(":")
      .map(Number);

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

      const startMinutes = timeToMinutes(
        currentDay.startTime
      );

      const endMinutes = timeToMinutes(
        currentDay.endTime
      );

      if (endMinutes <= startMinutes) {
        return `${day.label}: end time must be later than start time.`;
      }
    }

    return "";
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Please enter the staff member's full name.";
    }

    if (!form.email.trim()) {
      return "Please enter an email address.";
    }

    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!form.departmentOrUnit.trim()) {
      return "Please enter the department or unit.";
    }

    if (!form.studentOrStaffId.trim()) {
      return "Please enter the staff ID.";
    }

    if (!form.password) {
      return "Please create a password.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!institutionId) {
      return "Institution ID was not found.";
    }

    if (!branchId) {
      return "Branch ID was not found.";
    }

    return validateSchedule();
  };

  /* ================= SHIFT PAYLOAD ================= */

  const getSelectedScheduleDays = () => {
    return weekDays.filter(
      (day) => form.schedule[day.key].enabled
    );
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
  if (loading) {
    return;
  }

  const validationError = validate();

  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);
    setError("");

    const createPayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      departmentOrUnit: form.departmentOrUnit.trim(),
      studentOrStaffId: form.studentOrStaffId.trim(),
      password: form.password,
      role: ["staff"],
      employmentType: form.employmentType,
    };

    console.log("📤 Creating staff payload:", createPayload);

    const createResponse = await createStaffByAdmin(createPayload);

    console.log("📥 Staff creation response:", createResponse);

    const createdUser =
      createResponse?.data?.user ||
      createResponse?.data;

    console.log("🔍 Extracted createdUser:", createdUser);

    if (!createdUser?._id) {
      console.error("❌ Staff creation failed - no _id:", {
        createResponse,
        createdUser,
      });
      throw new Error(
        "Staff was created but no user ID was returned."
      );
    }

    const createdUserId = createdUser._id;

    console.log("✅ Staff created with ID:", createdUserId);

    await assignStaffToBranchByAdmin(
      institutionId!,
      createdUserId,
      branchId!
    );

    console.log("✅ Staff assigned to branch:", branchId);

    /*
     * Full-time staff:
     * No shift is created. They follow branch rules.
     */

    if (form.employmentType === "part-time") {
      const selectedDays = getSelectedScheduleDays();
      const repeatDays = selectedDays.map((day) => day.apiLabel);
      const shiftTimeRange = getShiftTimeRange();

      console.log("🕐 Part-time shift config:", {
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

        console.log("📤 Creating shift payload:", shiftPayload);

        const shiftResponse = await createShiftByAdmin(shiftPayload);

        console.log("📥 Shift response:", shiftResponse);

        // ✅ FIXED: Backend returns { data: { data: {...} } }
        const createdShift = shiftResponse?.data?.data;

        console.log("🔍 Extracted createdShift:", createdShift);

        if (!createdShift?._id) {
          console.error("❌ Shift creation failed - no _id:", {
            shiftResponse,
            createdShift,
          });
          throw new Error(
            "Staff was created, but the part-time shift was not created."
          );
        }

        console.log("✅ Shift created with ID:", createdShift._id);

        await assignStaffToShiftByAdmin(
          createdShift._id,
          [createdUserId]
        );

        console.log("✅ Staff assigned to shift:", createdShift._id);
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

        console.log("🔄 Shift groups:", Array.from(shiftGroups.entries()));

        for (const [groupKey, shiftGroup] of shiftGroups.entries()) {
          console.log("📤 Creating shift group payload:", {
            groupKey,
            shiftGroup,
          });

          const shiftResponse = await createShiftByAdmin({
            name: `${form.name.trim()} Part-time Shift`,
            startTime: shiftGroup.startTime,
            endTime: shiftGroup.endTime,
            gracePeriod: 10,
            branchId: branchId!,
            repeatDays: shiftGroup.repeatDays,
          });

          console.log("📥 Shift group response:", shiftResponse);

          // ✅ FIXED: Backend returns { data: { data: {...} } }
          const createdShift = shiftResponse?.data?.data;

          console.log("🔍 Extracted createdShift:", createdShift);

          if (!createdShift?._id) {
            console.error(
              "❌ Shift group creation failed - no _id:",
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

          console.log("✅ Shift group created with ID:", createdShift._id);

          await assignStaffToShiftByAdmin(
            createdShift._id,
            [createdUserId]
          );

          console.log("✅ Staff assigned to shift group:", createdShift._id);
        }
      }
    }

    console.log("✅ Staff and schedule created successfully.");

    router.replace({
      pathname:
        "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]",
      params: {
        institutionId: institutionId!,
        branchId: branchId!,
      },
    });
  } catch (submitError: any) {
    console.error("❌ Create staff error:", {
      message: submitError?.message,
      status: submitError?.response?.status,
      data: submitError?.response?.data,
      fullError: submitError,
    });

    setError(
      submitError?.response?.data?.message ||
        submitError?.message ||
        "Failed to create and assign staff."
    );
  } finally {
    setLoading(false);
  }
};

  if (profileLoading) {
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loaderText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#075985", "#0284C7", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
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
              TEAM MANAGEMENT
            </Text>

            <Text style={styles.headerTitle}>
              Add staff member
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="person-add-outline"
              size={29}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroTitle}>
            Create new staff
          </Text>

          <Text style={styles.heroSubtitle}>
            Add a staff member and assign them to this branch.
          </Text>
        </View>

        <View style={styles.heroDecorationOne} />
        <View style={styles.heroDecorationTwo} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#0284C7"
                />
              </View>

              <View style={styles.formHeaderContent}>
                <Text style={styles.formTitle}>
                  Staff details
                </Text>

                <Text style={styles.formSubtitle}>
                  Enter the staff member's account information.
                </Text>
              </View>
            </View>

            <InputField
              label="Full name"
              placeholder="Enter full name"
              value={form.name}
              icon="person-outline"
              onChangeText={(value) =>
                updateField("name", value)
              }
            />

            <InputField
              label="Email address"
              placeholder="staff@example.com"
              value={form.email}
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={(value) =>
                updateField("email", value)
              }
            />

            <InputField
              label="Department or unit"
              placeholder="For example, Finance Department"
              value={form.departmentOrUnit}
              icon="briefcase-outline"
              onChangeText={(value) =>
                updateField(
                  "departmentOrUnit",
                  value
                )
              }
            />

            <InputField
              label="Staff ID"
              placeholder="Enter staff ID"
              value={form.studentOrStaffId}
              icon="id-card-outline"
              onChangeText={(value) =>
                updateField(
                  "studentOrStaffId",
                  value
                )
              }
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Employment type
              </Text>

              <View style={styles.typeRow}>
                <Pressable
                  style={[
                    styles.typeOption,
                    form.employmentType ===
                      "full-time" &&
                      styles.typeOptionSelected,
                  ]}
                  onPress={() =>
                    updateEmploymentType(
                      "full-time"
                    )
                  }
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={19}
                    color={
                      form.employmentType ===
                      "full-time"
                        ? "#0284C7"
                        : "#64748B"
                    }
                  />

                  <View style={styles.typeTextContent}>
                    <Text style={styles.typeTitle}>
                      Full-time
                    </Text>

                    <Text style={styles.typeSubtitle}>
                      Follows branch working hours
                    </Text>
                  </View>

                  {form.employmentType ===
                    "full-time" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0284C7"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.typeOption,
                    form.employmentType ===
                      "part-time" &&
                      styles.typeOptionSelectedPurple,
                  ]}
                  onPress={() =>
                    updateEmploymentType(
                      "part-time"
                    )
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={
                      form.employmentType ===
                      "part-time"
                        ? "#7C3AED"
                        : "#64748B"
                    }
                  />

                  <View style={styles.typeTextContent}>
                    <Text style={styles.typeTitle}>
                      Part-time
                    </Text>

                    <Text style={styles.typeSubtitle}>
                      Assign a scheduled shift
                    </Text>
                  </View>

                  {form.employmentType ===
                    "part-time" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#7C3AED"
                    />
                  )}
                </Pressable>
              </View>
            </View>

            {form.employmentType === "part-time" && (
              <View style={styles.scheduleSection}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleHeaderIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#7C3AED"
                    />
                  </View>

                  <View style={styles.scheduleHeaderContent}>
                    <Text style={styles.scheduleTitle}>
                      Part-time shift
                    </Text>

                    <Text style={styles.scheduleSubtitle}>
                      Select working days and define the hours for each day.
                    </Text>
                  </View>
                </View>

                {weekDays.map((day) => {
                  const daySchedule =
                    form.schedule[day.key];

                  return (
                    <View
                      key={day.key}
                      style={styles.dayScheduleCard}
                    >
                      <View style={styles.dayHeader}>
                        <View>
                          <Text style={styles.dayLabel}>
                            {day.label}
                          </Text>

                          <Text style={styles.dayStatus}>
                            {daySchedule.enabled
                              ? "Scheduled"
                              : "Not scheduled"}
                          </Text>
                        </View>

                        <Pressable
                          style={[
                            styles.dayToggle,
                            daySchedule.enabled &&
                              styles.dayToggleActive,
                          ]}
                          onPress={() =>
                            toggleDay(day.key)
                          }
                        >
                          <View
                            style={[
                              styles.dayToggleCircle,
                              daySchedule.enabled &&
                                styles.dayToggleCircleActive,
                            ]}
                          />
                        </Pressable>
                      </View>

                      {daySchedule.enabled && (
                        <View
                          style={styles.scheduleInputsRow}
                        >
                          <View
                            style={
                              styles.scheduleInputGroup
                            }
                          >
                            <Text
                              style={
                                styles.scheduleInputLabel
                              }
                            >
                              Start
                            </Text>

                            <View
                              style={
                                styles.smallInputWrapper
                              }
                            >
                              <Ionicons
                                name="time-outline"
                                size={15}
                                color="#7C3AED"
                              />

                              <TextInput
                                value={
                                  daySchedule.startTime
                                }
                                onChangeText={(value) =>
                                  updateScheduleField(
                                    day.key,
                                    "startTime",
                                    value
                                  )
                                }
                                placeholder="08:00"
                                placeholderTextColor="#94A3B8"
                                style={
                                  styles.smallInput
                                }
                                maxLength={5}
                              />
                            </View>
                          </View>

                          <View
                            style={
                              styles.scheduleInputGroup
                            }
                          >
                            <Text
                              style={
                                styles.scheduleInputLabel
                              }
                            >
                              End
                            </Text>

                            <View
                              style={
                                styles.smallInputWrapper
                              }
                            >
                              <Ionicons
                                name="time-outline"
                                size={15}
                                color="#7C3AED"
                              />

                              <TextInput
                                value={
                                  daySchedule.endTime
                                }
                                onChangeText={(value) =>
                                  updateScheduleField(
                                    day.key,
                                    "endTime",
                                    value
                                  )
                                }
                                placeholder="13:00"
                                placeholderTextColor="#94A3B8"
                                style={
                                  styles.smallInput
                                }
                                maxLength={5}
                              />
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            <InputField
              label="Password"
              placeholder="Create a password"
              value={form.password}
              icon="lock-closed-outline"
              secureTextEntry={!passwordVisible}
              showPasswordButton={true}
              passwordVisible={passwordVisible}
              onTogglePassword={() =>
                setPasswordVisible(
                  (previousValue) =>
                    !previousValue
                )
              }
              onChangeText={(value) =>
                updateField("password", value)
              }
            />

            <View style={styles.passwordHint}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#2563EB"
              />

              <Text style={styles.passwordHintText}>
                Use at least 6 characters for the temporary password.
              </Text>
            </View>
          </View>

          <View style={styles.assignmentCard}>
            <View style={styles.assignmentIcon}>
              <Ionicons
                name="business-outline"
                size={20}
                color="#059669"
              />
            </View>

            <View style={styles.assignmentContent}>
              <Text style={styles.assignmentTitle}>
                Automatic branch assignment
              </Text>

              <Text style={styles.assignmentText}>
                This staff member will be created and assigned to the selected branch automatically.
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#10B981"
            />
          </View>

          {error.length > 0 && (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={21}
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

      <View style={styles.footer}>
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
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="person-add-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.createButtonText}>
                Create and assign
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ================= INPUT COMPONENT ================= */

function InputField({
  label,
  placeholder,
  value,
  icon,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  showPasswordButton = false,
  onTogglePassword,
  passwordVisible = false,
}: InputFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={18}
            color="#0284C7"
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={
            keyboardType === "email-address"
              ? "none"
              : "words"
          }
          autoCorrect={false}
          style={styles.input}
        />

        {showPasswordButton && (
          <Pressable
            style={styles.passwordButton}
            onPress={onTogglePassword}
            hitSlop={8}
          >
            <Ionicons
              name={
                passwordVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={20}
              color="#64748B"
            />
          </Pressable>
        )}
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

  loaderScreen: {
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

  header: {
    minHeight: 285,
    paddingTop: Platform.OS === "ios" ? 58 : 43,
    paddingHorizontal: 20,
    paddingBottom: 38,
    overflow: "hidden",
    position: "relative",
  },

  headerTopRow: {
    zIndex: 2,
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
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
  },

  headerTitleContainer: {
    alignItems: "center",
  },

  headerEyebrow: {
    marginBottom: 3,
    color: "#BAE6FD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  heroContent: {
    zIndex: 2,
    marginTop: 32,
  },

  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 19,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    maxWidth: 350,
    marginTop: 8,
    color: "#E0F2FE",
    fontSize: 14,
    lineHeight: 21,
  },

  heroDecorationOne: {
    position: "absolute",
    width: 230,
    height: 230,
    top: -110,
    right: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 130,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    top: 38,
    right: 25,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 70,
  },

  scrollContent: {
    paddingTop: 18,
    paddingBottom: 135,
  },

  formCard: {
    marginHorizontal: 18,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 23,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  formHeaderIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  formHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  formTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  formSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 55,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
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

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  passwordButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  passwordHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -3,
    paddingHorizontal: 3,
  },

  passwordHintText: {
    flex: 1,
    marginLeft: 6,
    color: "#2563EB",
    fontSize: 11,
    lineHeight: 16,
  },

  /* ================= EMPLOYMENT TYPE ================= */

  typeRow: {
    gap: 10,
  },

  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
  },

  typeOptionSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#7DD3FC",
  },

  typeOptionSelectedPurple: {
    backgroundColor: "#FAF5FF",
    borderColor: "#D8B4FE",
  },

  typeTextContent: {
    flex: 1,
    marginLeft: 10,
  },

  typeTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },

  typeSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  /* ================= PART-TIME SCHEDULE ================= */

  scheduleSection: {
    marginTop: 4,
    marginBottom: 18,
    padding: 14,
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 18,
  },

  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  scheduleHeaderIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
  },

  scheduleHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  scheduleTitle: {
    color: "#581C87",
    fontSize: 14,
    fontWeight: "900",
  },

  scheduleSubtitle: {
    marginTop: 3,
    color: "#7E22CE",
    fontSize: 11,
    lineHeight: 16,
  },

  dayScheduleCard: {
    marginBottom: 9,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 14,
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dayLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
  },

  dayStatus: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
  },

  dayToggle: {
    width: 43,
    height: 25,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: "#CBD5E1",
    borderRadius: 20,
  },

  dayToggleActive: {
    backgroundColor: "#A855F7",
  },

  dayToggleCircle: {
    width: 19,
    height: 19,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  dayToggleCircleActive: {
    alignSelf: "flex-end",
  },

  scheduleInputsRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 12,
  },

  scheduleInputGroup: {
    flex: 1,
  },

  scheduleInputLabel: {
    marginBottom: 5,
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
  },

  smallInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
  },

  smallInput: {
    flex: 1,
    marginLeft: 5,
    padding: 0,
    color: "#0F172A",
    fontSize: 11,
  },

  /* ================= ASSIGNMENT ================= */

  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 14,
    padding: 15,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 18,
  },

  assignmentIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
  },

  assignmentContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  assignmentTitle: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "900",
  },

  assignmentText: {
    marginTop: 4,
    color: "#15803D",
    fontSize: 11,
    lineHeight: 16,
  },

  /* ================= ERROR ================= */

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 14,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
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

  /* ================= FOOTER ================= */

  footer: {
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
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});