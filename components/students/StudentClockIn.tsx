// components/students/StudentClockIn.tsx

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useStudentsList,
  useStudentClockIn,
} from "@/hooks/students";

const COLORS = {
  primary: "#0093DD",
  primaryDark: "#0077B6",
  white: "#FFFFFF",
  background: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  border: "#E2E8F0",
  softBlue: "#E8F7FD",
  softBlueDark: "#D9F2FC",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  success: "#16A34A",
};

type Props = {
  institutionId?: string;
  onClose?: () => void;
};

type StudentListItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentOrStaffId: string;
  departmentName?: string;
};

export default function StudentClockIn({
  institutionId,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentListItem | null>(null);
  const [isClocking, setIsClocking] = useState(false);

  /*
   * The backend scopes the request using the
   * authenticated JWT.
   */
  void institutionId;

  /*
   * =========================================================
   * STUDENTS
   * =========================================================
   */

  const studentsList = useStudentsList({
    search: search.trim() || undefined,
  });

  const studentClockIn = useStudentClockIn();

  const students =
    (studentsList.data?.data || []) as StudentListItem[];

  /*
   * =========================================================
   * CLOCK-IN
   * =========================================================
   */

  const requestLocationAndClockIn = async () => {
    if (!selectedStudent) {
      console.warn(
        "[StudentClockIn] No student selected."
      );

      Alert.alert(
        "No student selected",
        "Please select a student before clocking in."
      );

      return;
    }

    if (isClocking) {
      return;
    }

    setIsClocking(true);

    console.log(
      "================================================="
    );

    console.log(
      "[StudentClockIn] START CLOCK-IN"
    );

    console.log(
      "================================================="
    );

    console.log(
      "[StudentClockIn] Student:",
      selectedStudent.name
    );

    console.log(
      "[StudentClockIn] Student ID:",
      selectedStudent._id
    );

    try {
      /*
       * =======================================================
       * LOCATION PERMISSION
       * =======================================================
       */

      console.log(
        "[StudentClockIn] Requesting location permission..."
      );

      const permission =
        await Location.requestForegroundPermissionsAsync();

      console.log(
        "[StudentClockIn] Location permission:",
        permission.status
      );

      if (permission.status !== "granted") {
        console.warn(
          "[StudentClockIn] Location permission denied."
        );

        Alert.alert(
          "Location permission required",
          "Enable location access to clock in this student."
        );

        return;
      }

      /*
       * =======================================================
       * CURRENT LOCATION
       * =======================================================
       */

      console.log(
        "[StudentClockIn] Getting current location..."
      );

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const latitude =
        location.coords.latitude;

      const longitude =
        location.coords.longitude;

      console.log(
        "[StudentClockIn] GPS latitude:",
        latitude
      );

      console.log(
        "[StudentClockIn] GPS longitude:",
        longitude
      );

      console.log(
        "[StudentClockIn] GPS accuracy:",
        location.coords.accuracy
      );

      /*
       * =======================================================
       * API PAYLOAD
       * =======================================================
       *
       * IMPORTANT:
       *
       * The backend only allows:
       *
       * qr
       * silent
       *
       * We are explicitly using silent.
       */

      const clockInPayload = {
        gps: {
          lat: latitude,
          lng: longitude,
        },

        deviceInfo: "Expo mobile device",

        mode: "silent" as const,
      };

      console.log(
        "[StudentClockIn] Clock-in mode:",
        clockInPayload.mode
      );

      console.log(
        "[StudentClockIn] Student ID:",
        selectedStudent._id
      );

      console.log(
        "[StudentClockIn] Clock-in payload:",
        JSON.stringify(
          clockInPayload,
          null,
          2
        )
      );

      console.log(
        "[StudentClockIn] Endpoint:",
        `/clock/students/${selectedStudent._id}/clock-in`
      );

      /*
       * =======================================================
       * SEND REQUEST
       * =======================================================
       */

      console.log(
        "[StudentClockIn] Sending request..."
      );

      const response =
        await studentClockIn.mutateAsync({
          studentId: selectedStudent._id,

          payload: clockInPayload,
        });

      /*
       * =======================================================
       * RESPONSE
       * =======================================================
       */

      console.log(
        "[StudentClockIn] Request successful."
      );

      console.log(
        "[StudentClockIn] Full response:",
        JSON.stringify(
          response,
          null,
          2
        )
      );

      console.log(
        "[StudentClockIn] Success:",
        response?.success
      );

      console.log(
        "[StudentClockIn] Message:",
        response?.message
      );

      console.log(
        "[StudentClockIn] Attendance log:",
        response?.data?.log
      );

      /*
       * =======================================================
       * PARENT NOTIFICATION
       * =======================================================
       */

      const sent =
        response?.data?.parentNotification?.sent ?? 0;

      const failed =
        response?.data?.parentNotification?.failed ?? 0;

      console.log(
        "[StudentClockIn] Parent notifications sent:",
        sent
      );

      console.log(
        "[StudentClockIn] Parent notifications failed:",
        failed
      );

      console.log(
        "================================================="
      );

      console.log(
        "[StudentClockIn] CLOCK-IN SUCCESS"
      );

      console.log(
        "================================================="
      );

      /*
       * =======================================================
       * SUCCESS ALERT
       * =======================================================
       */

      Alert.alert(
        "Student clocked in",
        `${
          response?.message ||
          "Clock-in successful."
        }\n\nParent notifications: ${sent} sent, ${failed} failed.`,
        [
          {
            text: "Done",

            onPress: () => {
              setSelectedStudent(null);
              setSearch("");

              onClose?.();
            },
          },
        ]
      );
    } catch (error: any) {
      /*
       * =======================================================
       * ERROR LOGGING
       * =======================================================
       */

      console.log(
        "================================================="
      );

      console.error(
        "[StudentClockIn] CLOCK-IN FAILED"
      );

      console.log(
        "================================================="
      );

      console.error(
        "[StudentClockIn] Error:",
        error
      );

      console.error(
        "[StudentClockIn] Error message:",
        error?.message
      );

      console.error(
        "[StudentClockIn] HTTP status:",
        error?.response?.status
      );

      console.error(
        "[StudentClockIn] HTTP status text:",
        error?.response?.statusText
      );

      console.error(
        "[StudentClockIn] Backend response:",
        error?.response?.data
      );

      console.error(
        "[StudentClockIn] Backend message:",
        error?.response?.data?.message
      );

      console.error(
        "[StudentClockIn] Request URL:",
        error?.config?.url
      );

      console.error(
        "[StudentClockIn] Request method:",
        error?.config?.method
      );

      console.error(
        "[StudentClockIn] Request body:",
        error?.config?.data
      );

      console.error(
        "[StudentClockIn] Student ID:",
        selectedStudent._id
      );

      /*
       * =======================================================
       * ERROR MESSAGE
       * =======================================================
       */

      const status =
        error?.response?.status;

      const backendMessage =
        error?.response?.data?.message;

      let message =
        backendMessage ||
        error?.message ||
        "Unable to clock in this student. Try again.";

      if (status === 400) {
        message =
          backendMessage ||
          "The clock-in request is invalid.";
      }

      if (status === 401) {
        message =
          backendMessage ||
          "Your session has expired. Please sign in again.";
      }

      if (status === 403) {
        message =
          backendMessage ||
          "You do not have permission to clock in students.";
      }

      if (status === 404) {
        message =
          backendMessage ||
          "The student or clock-in endpoint was not found.";
      }

      if (status === 500) {
        message =
          backendMessage ||
          "The server encountered an error while clocking in the student.";
      }

      Alert.alert(
        "Clock-in failed",
        message
      );
    } finally {
      setIsClocking(false);

      console.log(
        "[StudentClockIn] Clock-in process finished."
      );
    }
  };

  /*
   * =========================================================
   * SELECT STUDENT
   * =========================================================
   */

  const handleSelectStudent = (
    student: StudentListItem
  ) => {
    console.log(
      "[StudentClockIn] Selected student:",
      student.name
    );

    console.log(
      "[StudentClockIn] Selected student ID:",
      student._id
    );

    setSelectedStudent(student);
  };

  /*
   * =========================================================
   * STUDENT ROW
   * =========================================================
   */

  const renderStudent = (
    item: StudentListItem
  ) => {
    const isSelected =
      selectedStudent?._id === item._id;

    return (
      <TouchableOpacity
        key={item._id}
        style={[
          styles.studentRow,
          isSelected &&
            styles.studentRowSelected,
        ]}
        activeOpacity={0.75}
        onPress={() =>
          handleSelectStudent(item)
        }
      >
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {item.name
              ?.charAt(0)
              ?.toUpperCase() || "S"}
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.name}
          </Text>

          <Text style={styles.studentMeta}>
            {item.studentOrStaffId ||
              item.email}
          </Text>

          {item.departmentName ? (
            <Text
              style={styles.studentDepartment}
            >
              {item.departmentName}
            </Text>
          ) : null}
        </View>

        {isSelected ? (
          <Ionicons
            name="checkmark-circle"
            size={25}
            color={COLORS.primary}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.lightMuted}
          />
        )}
      </TouchableOpacity>
    );
  };

  /*
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="people-outline"
          size={42}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No students found
      </Text>

      <Text style={styles.emptyText}>
        Try adjusting your search or add a new
        student.
      </Text>
    </View>
  );

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <View style={styles.container}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="scan-outline"
            size={24}
            color={COLORS.white}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Clock in student
          </Text>

          <Text style={styles.headerSubtitle}>
            Select a student and record their
            arrival with GPS.
          </Text>
        </View>
      </View>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <View style={styles.searchCard}>
        <View style={styles.searchIcon}>
          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search name, email or student ID..."
          placeholderTextColor={
            COLORS.lightMuted
          }
          value={search}
          onChangeText={(text) => {
            console.log(
              "[StudentClockIn] Search:",
              text
            );

            setSearch(text);
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {studentsList.isFetching ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
          />
        ) : search.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearch("")}
            style={styles.clearSearchButton}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={COLORS.lightMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* =====================================================
          LIST ERROR
      ===================================================== */}

      {studentsList.isError ? (
        <View style={styles.errorCard}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={COLORS.danger}
            />
          </View>

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>
              Could not load students
            </Text>

            <Text style={styles.errorText}>
              Check your connection and try again.
            </Text>
          </View>
        </View>
      ) : null}

      {/* =====================================================
          STUDENT LIST
      ===================================================== */}

      <ScrollView
        style={styles.studentList}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {students.length === 0
          ? renderEmpty()
          : students.map(renderStudent)}
      </ScrollView>

      {/* =====================================================
          SELECTED STUDENT / CLOCK-IN
      ===================================================== */}

      {selectedStudent ? (
        <View style={styles.footer}>
          <View style={styles.selectedStudentCard}>
            <View style={styles.selectedAvatar}>
              <Text
                style={styles.selectedAvatarText}
              >
                {selectedStudent.name
                  ?.charAt(0)
                  ?.toUpperCase() || "S"}
              </Text>
            </View>

            <View style={styles.selectedInfo}>
              <Text
                style={styles.selectedLabel}
              >
                SELECTED STUDENT
              </Text>

              <Text
                style={styles.selectedName}
                numberOfLines={1}
              >
                {selectedStudent.name}
              </Text>

              <Text
                style={styles.selectedMeta}
                numberOfLines={1}
              >
                {selectedStudent.studentOrStaffId ||
                  selectedStudent.email}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setSelectedStudent(null)
              }
              disabled={isClocking}
              style={styles.changeButton}
            >
              <Text style={styles.changeButtonText}>
                Change
              </Text>
            </TouchableOpacity>
          </View>

          {/* CLOCK-IN BUTTON */}

          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.clockInButton,
              isClocking &&
                styles.clockInButtonDisabled,
            ]}
            disabled={isClocking}
            onPress={
              requestLocationAndClockIn
            }
          >
            {isClocking ? (
              <>
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                />

                <Text
                  style={
                    styles.clockInButtonText
                  }
                >
                  Clocking in...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={COLORS.white}
                />

                <Text
                  style={
                    styles.clockInButtonText
                  }
                >
                  Clock in selected student
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* GPS INFORMATION */}

          <View style={styles.gpsNotice}>
            <Ionicons
              name="navigate-outline"
              size={14}
              color={COLORS.primary}
            />

            <Text style={styles.gpsNoticeText}>
              GPS location and silent attendance
              mode will be used.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.footerPlaceholder}>
          <View style={styles.placeholderIcon}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.lightMuted}
            />
          </View>

          <Text
            style={
              styles.footerPlaceholderText
            }
          >
            Select a student to continue
          </Text>
        </View>
      )}
    </View>
  );
}

/*
 * ===========================================================
 * STYLES
 * ===========================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  /* SEARCH */

  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    minHeight: 52,
  },

  searchIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    fontSize: 13,
    color: COLORS.text,
    paddingHorizontal: 9,
  },

  clearSearchButton: {
    padding: 5,
  },

  /* ERROR */

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "900",
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 10,
    marginTop: 2,
  },

  /* STUDENT LIST */

  studentList: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 190,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 9,
  },

  studentRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.softBlue,
  },

  studentAvatar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  studentAvatarText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  studentName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  studentMeta: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  studentDepartment: {
    color: COLORS.lightMuted,
    fontSize: 9,
    marginTop: 2,
  },

  /* EMPTY */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 55,
  },

  emptyIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 13,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 5,
    paddingHorizontal: 30,
  },

  /* FOOTER */

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 15,
  },

  selectedStudentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: COLORS.softBlueDark,
    padding: 10,
    marginBottom: 10,
  },

  selectedAvatar: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedAvatarText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  selectedInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  selectedLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  selectedName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 1,
  },

  selectedMeta: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 1,
  },

  changeButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  changeButtonText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  /* CLOCK-IN */

  clockInButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  clockInButtonDisabled: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.65,
  },

  clockInButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  /* GPS NOTICE */

  gpsNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  gpsNoticeText: {
    color: COLORS.muted,
    fontSize: 9,
    marginLeft: 5,
    textAlign: "center",
  },

  /* NO SELECTION */

  footerPlaceholder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
  },

  placeholderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  footerPlaceholderText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
});

