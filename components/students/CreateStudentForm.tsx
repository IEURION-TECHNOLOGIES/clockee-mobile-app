// components/students/CreateStudentForm.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCreateStudent } from "@/hooks/students";

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  text: "#102A43",
  muted: "#64748B",
  border: "#DCEAF2",
  danger: "#DC2626",
};

type FormState = {
  name: string;
  email: string;
  studentId: string;
  phone: string;

  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentPassword: string;

  parent2Name: string;
  parent2Email: string;
  parent2Phone: string;
  parent2Password: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  studentId: "",
  phone: "",

  parentName: "",
  parentEmail: "",
  parentPhone: "",
  parentPassword: "",

  parent2Name: "",
  parent2Email: "",
  parent2Phone: "",
  parent2Password: "",
};

type Props = {
  onSuccess?: () => void;
};

type InputProps = {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words" | "characters";
  secureTextEntry?: boolean;
};

function Input({
  label,
  value,
  placeholder,
  required,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
}: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required ? (
          <Text style={styles.required}> *</Text>
        ) : null}
      </Text>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

export default function CreateStudentForm({
  onSuccess,
}: Props) {
  const createStudent = useCreateStudent();

  const [form, setForm] =
    useState<FormState>(INITIAL_FORM);

  const [secondParentEnabled, setSecondParentEnabled] =
    useState(false);

  const [showPasswords, setShowPasswords] =
    useState(false);

  console.log("[CreateStudentForm] Rendered");

  console.log(
    "[CreateStudentForm] Mutation:",
    {
      pending: createStudent.isPending,
      success: createStudent.isSuccess,
      error: createStudent.isError,
    }
  );

  const update = (
    key: keyof FormState,
    value: string
  ) => {
    console.log(
      "[CreateStudentForm] Updated field:",
      key
    );

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clear = () => {
    console.log(
      "[CreateStudentForm] Clearing form"
    );

    setForm(INITIAL_FORM);
    setSecondParentEnabled(false);
    setShowPasswords(false);
  };

  const validate = () => {
    const requiredFields = [
      ["name", "Student name"],
      ["email", "Student email"],
      ["studentId", "Student ID"],
      ["phone", "Student phone"],
      ["parentName", "Parent name"],
      ["parentEmail", "Parent email"],
      ["parentPhone", "Parent phone"],
    ] as const;

    const missing = requiredFields.find(
      ([key]) => !form[key].trim()
    );

    if (missing) {
      Alert.alert(
        "Missing information",
        `${missing[1]} is required.`
      );

      return false;
    }

    if (!form.email.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Enter a valid student email address."
      );

      return false;
    }

    if (!form.parentEmail.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Enter a valid parent email address."
      );

      return false;
    }

    if (
      secondParentEnabled &&
      form.parent2Email.trim() &&
      !form.parent2Email.includes("@")
    ) {
      Alert.alert(
        "Invalid email",
        "Enter a valid second parent email address."
      );

      return false;
    }

    return true;
  };

  const submit = async () => {
    console.log(
      "[CreateStudentForm] Submit pressed"
    );

    if (!validate()) {
      console.warn(
        "[CreateStudentForm] Validation failed"
      );

      return;
    }

    /*
     * =======================================================
     * STUDENT PAYLOAD
     * =======================================================
     *
     * Removed:
     * - departmentId
     * - branchId
     * - password
     *
     * The backend can determine the institution/branch
     * from the authenticated account/context.
     */

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      studentId: form.studentId.trim(),
      phone: form.phone.trim(),

      parentName: form.parentName.trim(),
      parentEmail:
        form.parentEmail.trim().toLowerCase(),
      parentPhone: form.parentPhone.trim(),

      ...(form.parentPassword.trim()
        ? {
            parentPassword:
              form.parentPassword,
          }
        : {}),

      ...(secondParentEnabled &&
      form.parent2Name.trim()
        ? {
            parent2Name:
              form.parent2Name.trim(),
          }
        : {}),

      ...(secondParentEnabled &&
      form.parent2Email.trim()
        ? {
            parent2Email:
              form.parent2Email
                .trim()
                .toLowerCase(),
          }
        : {}),

      ...(secondParentEnabled &&
      form.parent2Phone.trim()
        ? {
            parent2Phone:
              form.parent2Phone.trim(),
          }
        : {}),

      ...(secondParentEnabled &&
      form.parent2Password.trim()
        ? {
            parent2Password:
              form.parent2Password,
          }
        : {}),
    };

    console.log(
      "[CreateStudentForm] POST /admin/students:",
      {
        ...payload,

        parentPassword:
          payload.parentPassword
            ? "***hidden***"
            : undefined,

        parent2Password:
          payload.parent2Password
            ? "***hidden***"
            : undefined,
      }
    );

    try {
      const response =
        await createStudent.mutateAsync(
          payload
        );

      console.log(
        "[CreateStudentForm] Success:",
        response
      );

      Alert.alert(
        "Student created",
        "Student and linked parent account(s) created successfully.",
        [
          {
            text: "Done",

            onPress: () => {
              clear();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "[CreateStudentForm] Failed:",
        error
      );

      console.error(
        "[CreateStudentForm] Status:",
        error?.response?.status
      );

      console.error(
        "[CreateStudentForm] Backend response:",
        error?.response?.data
      );

      Alert.alert(
        "Could not create student",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create the student."
      );
    }
  };

  return (
    <View style={styles.container}>

      {/* =====================================================
          STUDENT DETAILS
      ===================================================== */}

      <View style={styles.sectionHeader}>
        <View style={styles.iconBox}>
          <Ionicons
            name="school-outline"
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>
            Student details
          </Text>

          <Text style={styles.sectionSubtitle}>
            Enter the student account information.
          </Text>
        </View>
      </View>

      <Input
        label="Student full name"
        value={form.name}
        placeholder="e.g. John Doe"
        required
        autoCapitalize="words"
        onChangeText={(value) =>
          update("name", value)
        }
      />

      <Input
        label="Student email"
        value={form.email}
        placeholder="john@example.com"
        required
        keyboardType="email-address"
        onChangeText={(value) =>
          update("email", value)
        }
      />

      <Input
        label="Student ID"
        value={form.studentId}
        placeholder="e.g. STU001"
        required
        autoCapitalize="characters"
        onChangeText={(value) =>
          update("studentId", value)
        }
      />

      <Input
        label="Student phone"
        value={form.phone}
        placeholder="08000000000"
        required
        keyboardType="phone-pad"
        onChangeText={(value) =>
          update("phone", value)
        }
      />

      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <View style={styles.divider} />

      {/* =====================================================
          PARENT / GUARDIAN
      ===================================================== */}

      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.iconBox,
            styles.parentIcon,
          ]}
        >
          <Ionicons
            name="people-outline"
            size={21}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>
            Parent or guardian
          </Text>

          <Text style={styles.sectionSubtitle}>
            Parent accounts are read-only portal
            accounts.
          </Text>
        </View>
      </View>

      <Input
        label="Parent name"
        value={form.parentName}
        placeholder="e.g. Jane Doe"
        required
        autoCapitalize="words"
        onChangeText={(value) =>
          update("parentName", value)
        }
      />

      <Input
        label="Parent email"
        value={form.parentEmail}
        placeholder="jane@example.com"
        required
        keyboardType="email-address"
        onChangeText={(value) =>
          update("parentEmail", value)
        }
      />

      <Input
        label="Parent phone"
        value={form.parentPhone}
        placeholder="08000000001"
        required
        keyboardType="phone-pad"
        onChangeText={(value) =>
          update("parentPhone", value)
        }
      />

      {/* =====================================================
          PARENT PASSWORD
      ===================================================== */}

      <View style={styles.passwordWrapper}>
        <Input
          label="Parent password"
          value={form.parentPassword}
          placeholder="Optional password"
          secureTextEntry={!showPasswords}
          onChangeText={(value) =>
            update("parentPassword", value)
          }
        />

        <Pressable
          style={styles.eyeButton}
          onPress={() =>
            setShowPasswords(
              (value) => !value
            )
          }
        >
          <Ionicons
            name={
              showPasswords
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={20}
            color={COLORS.primary}
          />
        </Pressable>
      </View>

      {/* =====================================================
          SECOND PARENT TOGGLE
      ===================================================== */}

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>
            Add second parent
          </Text>

          <Text style={styles.toggleDescription}>
            Optional second parent or guardian.
          </Text>
        </View>

        <Switch
          value={secondParentEnabled}
          onValueChange={
            setSecondParentEnabled
          }
          trackColor={{
            false: "#CBD5E1",
            true: "#8BD8F7",
          }}
          thumbColor={
            secondParentEnabled
              ? COLORS.primary
              : "#F8FAFC"
          }
        />
      </View>

      {/* =====================================================
          SECOND PARENT
      ===================================================== */}

      {secondParentEnabled ? (
        <View
          style={styles.secondParentCard}
        >
          <Input
            label="Second parent name"
            value={form.parent2Name}
            placeholder="e.g. John Doe Sr"
            autoCapitalize="words"
            onChangeText={(value) =>
              update(
                "parent2Name",
                value
              )
            }
          />

          <Input
            label="Second parent email"
            value={form.parent2Email}
            placeholder="john.sr@example.com"
            keyboardType="email-address"
            onChangeText={(value) =>
              update(
                "parent2Email",
                value
              )
            }
          />

          <Input
            label="Second parent phone"
            value={form.parent2Phone}
            placeholder="08000000002"
            keyboardType="phone-pad"
            onChangeText={(value) =>
              update(
                "parent2Phone",
                value
              )
            }
          />

          <View
            style={styles.passwordWrapper}
          >
            <Input
              label="Second parent password"
              value={
                form.parent2Password
              }
              placeholder="Optional password"
              secureTextEntry={
                !showPasswords
              }
              onChangeText={(value) =>
                update(
                  "parent2Password",
                  value
                )
              }
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() =>
                setShowPasswords(
                  (value) => !value
                )
              }
            >
              <Ionicons
                name={
                  showPasswords
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={20}
                color={
                  COLORS.primary
                }
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* =====================================================
          CREATE BUTTON
      ===================================================== */}

      <Pressable
        onPress={submit}
        disabled={
          createStudent.isPending
        }
        style={({ pressed }) => [
          styles.submitButton,

          createStudent.isPending &&
            styles.disabled,

          pressed &&
            !createStudent.isPending &&
            styles.pressed,
        ]}
      >
        {createStudent.isPending ? (
          <>
            <ActivityIndicator
              color={COLORS.white}
            />

            <Text
              style={
                styles.submitText
              }
            >
              Creating student...
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="person-add-outline"
              size={21}
              color={COLORS.white}
            />

            <Text
              style={
                styles.submitText
              }
            >
              Create student account
            </Text>
          </>
        )}
      </Pressable>

      {/* =====================================================
          CLEAR
      ===================================================== */}

      <Pressable
        onPress={clear}
        style={styles.clearButton}
      >
        <Text style={styles.clearText}>
          Clear form
        </Text>
      </Pressable>

    </View>
  );
}

/* ===========================================================
   STYLES
=========================================================== */

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F7FD",
  },

  parentIcon: {
    backgroundColor: "#E6F8FF",
  },

  sectionText: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  inputGroup: {
    marginTop: 1,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  required: {
    color: COLORS.danger,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },

  passwordWrapper: {
    position: "relative",
  },

  eyeButton: {
    position: "absolute",
    right: 5,
    bottom: 4,
    width: 43,
    height: 43,
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 9,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#BCE9FA",
    backgroundColor: "#E9F7FD",
    padding: 14,
  },

  toggleText: {
    flex: 1,
    paddingRight: 10,
  },

  toggleTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  toggleDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  secondParentCard: {
    gap: 14,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFDFF",
  },

  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    elevation: 4,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  clearButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.58,
  },

  pressed: {
    opacity: 0.84,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});
