// components/students/AttendanceRoaster.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useStudentRoster } from "@/hooks/students";

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

type AttendanceSummary = {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
};

type Props = {
  visible: boolean;

  /*
   * Kept here so Students.tsx does not
   * need to change its prop structure.
   *
   * IMPORTANT:
   * We no longer send institutionId
   * to useStudentRoster.
   */
  institutionId: string;

  date: string;

  onClose: () => void;

  onSummaryChange?: (
    summary: AttendanceSummary
  ) => void;
};

const COLORS = {
  primary: "#0093DD",
  white: "#FFFFFF",
  background: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  softBlue: "#E8F7FD",
  danger: "#DC2626",
  success: "#16A34A",
};

/* =========================================================
   STATUS META
========================================================= */

const getStatusMeta = (
  status: AttendanceStatus
) => {
  switch (status) {
    case "present":
      return {
        label: "Present",
        icon: "checkmark-circle",
        color: COLORS.success,
        background: "#ECFDF5",
      };

    case "late":
      return {
        label: "Late",
        icon: "time",
        color: "#D97706",
        background: "#FFFBEB",
      };

    case "excused":
      return {
        label: "Excused",
        icon: "document-text",
        color: "#7C3AED",
        background: "#F5F3FF",
      };

    case "absent":
    default:
      return {
        label: "Absent",
        icon: "close-circle",
        color: COLORS.danger,
        background: "#FEF2F2",
      };
  }
};

/* =========================================================
   STATUS NORMALIZER
========================================================= */

const normalizeStatus = (
  value: unknown
): AttendanceStatus => {
  const status = String(
    value || ""
  )
    .toLowerCase()
    .trim();

  if (
    status === "present" ||
    status === "absent" ||
    status === "late" ||
    status === "excused"
  ) {
    return status;
  }

  return "absent";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AttendanceRoaster({
  visible,
  institutionId,
  date,
  onClose,
  onSummaryChange,
}: Props) {
  /*
   * institutionId is intentionally not used
   * for the roster query.
   *
   * BulkAttendanceEditor uses:
   *
   * useStudentRoster({
   *   date: selectedDate,
   * })
   *
   * Therefore the roster MUST use the
   * exact same query shape.
   *
   * This makes both components share:
   *
   * ["studentRoster", { date }]
   */

  void institutionId;

  const attendanceRoster =
    useStudentRoster({
      date,
    });

  const rows =
    attendanceRoster.data?.data || [];

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary: AttendanceSummary = {
    total: rows.length,

    present: rows.filter(
      (row: any) =>
        normalizeStatus(
          row.attendance?.status
        ) === "present"
    ).length,

    late: rows.filter(
      (row: any) =>
        normalizeStatus(
          row.attendance?.status
        ) === "late"
    ).length,

    absent: rows.filter(
      (row: any) =>
        !row.attendance?.status ||
        normalizeStatus(
          row.attendance?.status
        ) === "absent"
    ).length,

    excused: rows.filter(
      (row: any) =>
        normalizeStatus(
          row.attendance?.status
        ) === "excused"
    ).length,
  };

  /* =========================================================
     SEND SUMMARY TO STUDENTS.TSX
  ========================================================= */

  useEffect(() => {
    onSummaryChange?.(summary);
  }, [
    onSummaryChange,
    summary.total,
    summary.present,
    summary.late,
    summary.absent,
    summary.excused,
  ]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalScreen}>
        {/* HEADER */}

        <View style={styles.modalHeader}>
          <View
            style={styles.modalHeaderText}
          >
            <Text
              style={styles.modalTitle}
            >
              Attendance roster
            </Text>

            <Text
              style={styles.modalSubtitle}
            >
              Student attendance for {date}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={23}
              color={COLORS.text}
            />
          </Pressable>
        </View>

        {/* CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.componentContent
          }
        >
          {attendanceRoster.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text
                style={styles.centerText}
              >
                Loading attendance...
              </Text>
            </View>
          ) : attendanceRoster.isError ? (
            <View style={styles.center}>
              <Ionicons
                name="alert-circle-outline"
                size={45}
                color={COLORS.danger}
              />

              <Text
                style={styles.errorTitle}
              >
                Could not load attendance
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={() =>
                  attendanceRoster.refetch()
                }
              >
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={COLORS.white}
                />

                <Text
                  style={styles.retryText}
                >
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : !rows.length ? (
            <View style={styles.center}>
              <Ionicons
                name="people-outline"
                size={46}
                color={COLORS.primary}
              />

              <Text
                style={styles.errorTitle}
              >
                No student records
              </Text>

              <Text
                style={styles.emptyText}
              >
                There are no attendance records
                for this date.
              </Text>
            </View>
          ) : (
            <View style={styles.rosterList}>
              {rows.map((row: any) => {
                /*
                 * IMPORTANT:
                 *
                 * Attendance comes from:
                 *
                 * row.attendance.status
                 *
                 * exactly like BulkAttendanceEditor.
                 */

                const status =
                  normalizeStatus(
                    row.attendance?.status
                  );

                const meta =
                  getStatusMeta(status);

                return (
                  <View
                    key={row._id}
                    style={styles.rosterCard}
                  >
                    {/* STUDENT */}

                    <View
                      style={
                        styles.rosterStudent
                      }
                    >
                      <View
                        style={styles.avatar}
                      >
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {row.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "S"}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.studentInfo
                        }
                      >
                        <Text
                          style={
                            styles.studentName
                          }
                          numberOfLines={1}
                        >
                          {row.name ||
                            "Unnamed student"}
                        </Text>

                        <Text
                          style={
                            styles.studentId
                          }
                          numberOfLines={1}
                        >
                          {row.studentOrStaffId ||
                            row.email ||
                            row._id}
                        </Text>
                      </View>

                      {/* STATUS */}

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              meta.background,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            meta.icon as any
                          }
                          size={14}
                          color={
                            meta.color
                          }
                        />

                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                meta.color,
                            },
                          ]}
                        >
                          {meta.label}
                        </Text>
                      </View>
                    </View>

                    {/* NOTE */}

                    {!!row.attendance
                      ?.notes && (
                      <View
                        style={
                          styles.noteBox
                        }
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={14}
                          color={
                            COLORS.muted
                          }
                        />

                        <Text
                          style={
                            styles.noteText
                          }
                        >
                          {
                            row.attendance
                              .notes
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 17,
    paddingVertical: 14,
    backgroundColor:
      COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  modalSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      "#F1F5F9",
  },

  componentContent: {
    padding: 16,
    paddingBottom: 35,
  },

  center: {
    minHeight: 280,
    alignItems: "center",
    justifyContent:
      "center",
    padding: 25,
  },

  centerText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },

  rosterList: {
    gap: 12,
  },

  rosterCard: {
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 17,
    backgroundColor:
      COLORS.white,
    padding: 14,
  },

  rosterStudent: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      COLORS.softBlue,
  },

  avatarText: {
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

  studentId: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  noteBox: {
    flexDirection: "row",
    marginTop: 12,
    padding: 9,
    borderRadius: 10,
    backgroundColor:
      "#F8FAFC",
  },

  noteText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 6,
  },
});
