// students/BulkAttendanceEditor.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useBulkUpsertStudentAttendance,
  useStudentRoster,
} from "@/hooks/students";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

type DraftRecord = {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
};

type Props = {
  date?: string;
};

const COLORS = {
  primary: "#0093DD",
  white: "#FFFFFF",
  text: "#102A43",
  muted: "#64748B",
  border: "#DCEAF2",

  lightBlue: "#E8F7FD",
  lighterBlue: "#E9F7FD",
  input: "#FAFDFF",

  present: "#16A34A",
  presentBg: "#ECFDF3",

  late: "#D97706",
  lateBg: "#FFF7ED",

  absent: "#DC2626",
  absentBg: "#FEF2F2",

  excused: "#7C3AED",
  excusedBg: "#F5F3FF",
};

const STATUSES: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "excused",
];

const getToday = () => new Date().toISOString().slice(0, 10);

export default function BulkAttendanceEditor({ date }: Props) {
  const selectedDate = date || getToday();

  const rosterQuery = useStudentRoster({
    date: selectedDate,
  });

  const saveMutation = useBulkUpsertStudentAttendance();

  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>({});

  const rows = rosterQuery.data?.data || [];

  console.log("[BulkAttendanceEditor] Rendered");
  console.log("[BulkAttendanceEditor] Date:", selectedDate);
  console.log("[BulkAttendanceEditor] Rows:", rows);

  /**
   * IMPORTANT:
   *
   * API response structure:
   *
   * {
   *   _id: "...",
   *   name: "...",
   *   attendance: {
   *     status: "present",
   *     notes: "...",
   *     recordedAt: "...",
   *     ...
   *   }
   * }
   *
   * Therefore we MUST read:
   * row.attendance?.status
   * row.attendance?.notes
   */
  useEffect(() => {
    if (!rows.length) {
      setDrafts({});
      return;
    }

    const next: Record<string, DraftRecord> = {};

    rows.forEach((row) => {
      const existingStatus: AttendanceStatus =
        row.attendance?.status || "absent";

      const existingNotes = row.attendance?.notes || "";

      next[row._id] = {
        studentId: row._id,
        status: existingStatus,
        notes: existingNotes,
      };
    });

    console.log(
      "[BulkAttendanceEditor] Drafts initialized:",
      next
    );

    setDrafts(next);
  }, [rosterQuery.data]);

  /**
   * KPI SUMMARY
   *
   * Read the status from attendance.status,
   * not row.status.
   */
  const summary = useMemo(() => {
    return {
      present: rows.filter(
        (row) => row.attendance?.status === "present"
      ).length,

      late: rows.filter(
        (row) => row.attendance?.status === "late"
      ).length,

      absent: rows.filter(
        (row) =>
          !row.attendance?.status ||
          row.attendance?.status === "absent"
      ).length,

      excused: rows.filter(
        (row) => row.attendance?.status === "excused"
      ).length,
    };
  }, [rows]);

  /**
   * Change one student's status
   */
  const setStatus = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    console.log("[BulkAttendanceEditor] Status:", {
      studentId,
      status,
    });

    setDrafts((current) => ({
      ...current,

      [studentId]: {
        studentId,
        status,
        notes: current[studentId]?.notes || "",
      },
    }));
  };

  /**
   * Change one student's notes
   */
  const setNotes = (studentId: string, notes: string) => {
    setDrafts((current) => ({
      ...current,

      [studentId]: {
        studentId,

        status:
          current[studentId]?.status || "absent",

        notes,
      },
    }));
  };

  /**
   * Mark every student present
   */
  const markAllPresent = () => {
    console.log(
      "[BulkAttendanceEditor] Marking all present"
    );

    const next: Record<string, DraftRecord> = {};

    rows.forEach((row) => {
      next[row._id] = {
        studentId: row._id,
        status: "present",
        notes: drafts[row._id]?.notes || "",
      };
    });

    setDrafts(next);
  };

  /**
   * Save attendance
   */
  const save = async () => {
    const draftRecords = Object.values(drafts);

    if (!draftRecords.length) {
      Alert.alert(
        "No attendance records",
        "There is nothing to save."
      );

      return;
    }

    const payload = {
      date: selectedDate,

      records: draftRecords.map((item) => ({
        studentId: item.studentId,
        status: item.status,

        ...(item.notes.trim()
          ? {
              notes: item.notes.trim(),
            }
          : {}),
      })),
    };

    console.log(
      "[BulkAttendanceEditor] Saving:",
      payload
    );

    try {
      const response =
        await saveMutation.mutateAsync(payload);

      console.log(
        "[BulkAttendanceEditor] Response:",
        response
      );

      const resultRows =
        response?.data?.records || [];

      const succeeded = resultRows.filter(
        (row: any) => row.success
      );

      const failed = resultRows.filter(
        (row: any) => !row.success
      );

      if (failed.length) {
        const failureDetails = failed
          .map(
            (row: any) =>
              `${row.studentId}: ${
                row.message || "Record failed"
              }`
          )
          .join("\n");

        Alert.alert(
          "Attendance partially saved",
          `${succeeded.length} succeeded.\n${failed.length} failed.\n\n${failureDetails}`
        );
      } else {
        Alert.alert(
          "Attendance saved",
          `${succeeded.length} record(s) saved successfully.`
        );
      }

      /**
       * Refresh the roster after saving.
       *
       * The useEffect above will then rebuild drafts
       * from the fresh attendance.status values.
       */
      await rosterQuery.refetch();
    } catch (error: any) {
      console.error(
        "[BulkAttendanceEditor] Save failed:",
        error
      );

      Alert.alert(
        "Could not save attendance",
        error?.response?.data?.message ||
          error?.message ||
          "Please try again."
      );
    }
  };

  /**
   * Loading
   */
  if (rosterQuery.isLoading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.centerTitle}>
          Loading attendance
        </Text>

        <Text style={styles.centerText}>
          Getting today's student records...
        </Text>
      </View>
    );
  }

  /**
   * Error
   */
  if (rosterQuery.isError) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Could not load attendance
        </Text>

        <Text style={styles.centerText}>
          Something went wrong while loading the roster.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => rosterQuery.refetch()}
        >
          <Ionicons
            name="refresh-outline"
            size={17}
            color={COLORS.white}
          />

          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* =========================
            DATE HEADER
        ========================== */}
        <View style={styles.dateCard}>
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color={COLORS.white}
            />
          </View>

          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>
              ATTENDANCE DATE
            </Text>

            <Text style={styles.dateValue}>
              {rosterQuery.data?.date || selectedDate}
            </Text>
          </View>

          <View style={styles.dateStatus}>
            <View style={styles.liveDot} />

            <Text style={styles.dateStatusText}>
              Active
            </Text>
          </View>
        </View>

        {/* =========================
            SUMMARY
        ========================== */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Attendance overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current status for all students
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              {rows.length} Students
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {/* PRESENT */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  COLORS.presentBg,
                borderColor:
                  "#BBF7D0",
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.presentBg,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={COLORS.present}
              />
            </View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color: COLORS.present,
                },
              ]}
            >
              {summary.present}
            </Text>

            <Text
              style={[
                styles.summaryLabel,
                {
                  color: COLORS.present,
                },
              ]}
            >
              Present
            </Text>
          </View>

          {/* LATE */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  COLORS.lateBg,
                borderColor:
                  "#FED7AA",
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.lateBg,
                },
              ]}
            >
              <Ionicons
                name="time"
                size={19}
                color={COLORS.late}
              />
            </View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color: COLORS.late,
                },
              ]}
            >
              {summary.late}
            </Text>

            <Text
              style={[
                styles.summaryLabel,
                {
                  color: COLORS.late,
                },
              ]}
            >
              Late
            </Text>
          </View>

          {/* ABSENT */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  COLORS.absentBg,
                borderColor:
                  "#FECACA",
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.absentBg,
                },
              ]}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={COLORS.absent}
              />
            </View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color: COLORS.absent,
                },
              ]}
            >
              {summary.absent}
            </Text>

            <Text
              style={[
                styles.summaryLabel,
                {
                  color: COLORS.absent,
                },
              ]}
            >
              Absent
            </Text>
          </View>

          {/* EXCUSED */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  COLORS.excusedBg,
                borderColor:
                  "#DDD6FE",
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.excusedBg,
                },
              ]}
            >
              <Ionicons
                name="document-text"
                size={19}
                color={COLORS.excused}
              />
            </View>

            <Text
              style={[
                styles.summaryCount,
                {
                  color: COLORS.excused,
                },
              ]}
            >
              {summary.excused}
            </Text>

            <Text
              style={[
                styles.summaryLabel,
                {
                  color: COLORS.excused,
                },
              ]}
            >
              Excused
            </Text>
          </View>
        </View>

        {/* =========================
            QUICK ACTION
        ========================== */}
        <Pressable
          style={styles.markAllButton}
          onPress={markAllPresent}
        >
          <View style={styles.markAllIcon}>
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.markAllContent}>
            <Text style={styles.markAllText}>
              Mark all present
            </Text>

            <Text style={styles.markAllSubtext}>
              Set every student to present
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.primary}
          />
        </Pressable>

        {/* =========================
            EMPTY STATE
        ========================== */}
        {!rows.length ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={43}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No student records
            </Text>

            <Text style={styles.emptyText}>
              The attendance endpoint returned no
              student records for this date.
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() =>
                rosterQuery.refetch()
              }
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={COLORS.white}
              />

              <Text style={styles.retryText}>
                Refresh
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* =========================
                STUDENT LIST HEADER
            ========================== */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Student attendance
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Tap a status to update a student
                </Text>
              </View>
            </View>

            {/* =========================
                STUDENT RECORDS
            ========================== */}
            <View style={styles.records}>
              {rows.map((row) => {
                /**
                 * IMPORTANT:
                 *
                 * Fallback must ALSO use:
                 * row.attendance?.status
                 *
                 * NOT row.status.
                 */
                const draft =
                  drafts[row._id] || {
                    studentId: row._id,

                    status:
                      row.attendance?.status ||
                      "absent",

                    notes:
                      row.attendance?.notes ||
                      "",
                  };

                return (
                  <View
                    key={row._id}
                    style={styles.studentCard}
                  >
                    {/* STUDENT HEADER */}
                    <View
                      style={styles.studentHeader}
                    >
                      <View style={styles.avatar}>
                        <Text
                          style={styles.avatarText}
                        >
                          {row.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "S"}
                        </Text>
                      </View>

                      <View
                        style={styles.studentInfo}
                      >
                        <Text
                          style={styles.studentName}
                          numberOfLines={1}
                        >
                          {row.name ||
                            "Unnamed student"}
                        </Text>

                        <Text
                          style={styles.studentId}
                          numberOfLines={1}
                        >
                          {row.studentOrStaffId ||
                            row.email ||
                            row._id}
                        </Text>
                      </View>

                      {/* CURRENT STATUS BADGE */}
                      <View
                        style={[
                          styles.currentStatusBadge,
                          getStatusBadgeStyle(
                            draft.status
                          ),
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                getStatusColor(
                                  draft.status
                                ),
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.currentStatusText,
                            {
                              color:
                                getStatusColor(
                                  draft.status
                                ),
                            },
                          ]}
                        >
                          {draft.status}
                        </Text>
                      </View>
                    </View>

                    {/* STATUS */}
                    <Text
                      style={styles.statusHeading}
                    >
                      Attendance status
                    </Text>

                    <View style={styles.statusRow}>
                      {STATUSES.map(
                        (status) => {
                          const active =
                            draft.status ===
                            status;

                          return (
                            <Pressable
                              key={status}
                              onPress={() =>
                                setStatus(
                                  row._id,
                                  status
                                )
                              }
                              style={[
                                styles.statusButton,
                                active &&
                                  getActiveStatusButtonStyle(
                                    status
                                  ),
                              ]}
                            >
                              <Ionicons
                                name={getStatusIcon(
                                  status
                                )}
                                size={15}
                                color={
                                  active
                                    ? getStatusColor(
                                        status
                                      )
                                    : COLORS.muted
                                }
                              />

                              <Text
                                style={[
                                  styles.statusText,
                                  active && {
                                    color:
                                      getStatusColor(
                                        status
                                      ),
                                  },
                                ]}
                              >
                                {status}
                              </Text>
                            </Pressable>
                          );
                        }
                      )}
                    </View>

                    {/* NOTES */}
                    <View style={styles.notesLabelRow}>
                      <Ionicons
                        name="chatbox-outline"
                        size={14}
                        color={COLORS.muted}
                      />

                      <Text
                        style={styles.notesLabel}
                      >
                        Note
                      </Text>
                    </View>

                    <TextInput
                      value={draft.notes}
                      onChangeText={(value) =>
                        setNotes(
                          row._id,
                          value
                        )
                      }
                      placeholder="Add an optional note..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      style={styles.notesInput}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* =========================
            SAVE BUTTON
        ========================== */}
        <Pressable
          onPress={save}
          disabled={
            saveMutation.isPending ||
            !rows.length
          }
          style={[
            styles.saveButton,
            (saveMutation.isPending ||
              !rows.length) &&
              styles.disabled,
          ]}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator
              color={COLORS.white}
            />
          ) : (
            <Ionicons
              name="save-outline"
              size={21}
              color={COLORS.white}
            />
          )}

          <View style={styles.saveButtonText}>
            <Text style={styles.saveText}>
              {saveMutation.isPending
                ? "Saving attendance..."
                : "Save attendance records"}
            </Text>

            {!saveMutation.isPending &&
              rows.length > 0 && (
                <Text
                  style={styles.saveSubtext}
                >
                  {rows.length} student
                  {rows.length === 1
                    ? ""
                    : "s"} will be updated
                </Text>
              )}
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* =========================================================
   STATUS HELPERS
========================================================= */

const getStatusColor = (
  status: AttendanceStatus
) => {
  switch (status) {
    case "present":
      return COLORS.present;

    case "late":
      return COLORS.late;

    case "absent":
      return COLORS.absent;

    case "excused":
      return COLORS.excused;

    default:
      return COLORS.muted;
  }
};

const getStatusBadgeStyle = (
  status: AttendanceStatus
) => {
  switch (status) {
    case "present":
      return {
        backgroundColor: COLORS.presentBg,
      };

    case "late":
      return {
        backgroundColor: COLORS.lateBg,
      };

    case "absent":
      return {
        backgroundColor: COLORS.absentBg,
      };

    case "excused":
      return {
        backgroundColor: COLORS.excusedBg,
      };

    default:
      return {
        backgroundColor: COLORS.lightBlue,
      };
  }
};

const getActiveStatusButtonStyle = (
  status: AttendanceStatus
) => {
  switch (status) {
    case "present":
      return {
        backgroundColor: COLORS.presentBg,
        borderColor: "#86EFAC",
      };

    case "late":
      return {
        backgroundColor: COLORS.lateBg,
        borderColor: "#FDBA74",
      };

    case "absent":
      return {
        backgroundColor: COLORS.absentBg,
        borderColor: "#FCA5A5",
      };

    case "excused":
      return {
        backgroundColor: COLORS.excusedBg,
        borderColor: "#C4B5FD",
      };

    default:
      return {
        backgroundColor: COLORS.lightBlue,
        borderColor: COLORS.primary,
      };
  }
};

const getStatusIcon = (
  status: AttendanceStatus
): any => {
  switch (status) {
    case "present":
      return "checkmark-circle-outline";

    case "late":
      return "time-outline";

    case "absent":
      return "close-circle-outline";

    case "excused":
      return "document-text-outline";

    default:
      return "ellipse-outline";
  }
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 25,
  },

  container: {
    gap: 14,
  },

  /* =========================
     LOADING
  ========================== */

  center: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightBlue,
  },

  centerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 15,
  },

  centerText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
  },

  /* =========================
     ERROR
  ========================== */

  errorIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.absentBg,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 15,
  },

  retryButton: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 17,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  /* =========================
     DATE
  ========================== */

  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    padding: 16,
  },

  dateIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },

  dateLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  dateValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },

  dateStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },

  dateStatusText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
  },

  /* =========================
     SECTION HEADER
  ========================== */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  totalBadge: {
    borderRadius: 10,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  totalBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
  },

  /* =========================
     SUMMARY
  ========================== */

  summaryRow: {
    flexDirection: "row",
    gap: 7,
  },

  summaryCard: {
    flex: 1,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 9,
  },

  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCount: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "capitalize",
    marginTop: 1,
  },

  /* =========================
     MARK ALL
  ========================== */

  markAllButton: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BCE9FA",
    backgroundColor: COLORS.lighterBlue,
    paddingHorizontal: 12,
  },

  markAllIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  markAllContent: {
    flex: 1,
    marginLeft: 10,
  },

  markAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  markAllSubtext: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },

  /* =========================
     RECORDS
  ========================== */

  records: {
    gap: 12,
  },

  studentCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    padding: 14,
  },

  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightBlue,
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
    fontSize: 14,
    fontWeight: "800",
  },

  studentId: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  currentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  currentStatusText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  /* =========================
     STATUS
  ========================== */

  statusHeading: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  statusButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    paddingHorizontal: 10,
  },

  statusText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  /* =========================
     NOTES
  ========================== */

  notesLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 13,
    marginBottom: 6,
  },

  notesLabel: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
  },

  notesInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },

  /* =========================
     EMPTY
  ========================== */

  empty: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightBlue,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 13,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
  },

  /* =========================
     SAVE
  ========================== */

  saveButton: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    marginTop: 2,
    paddingHorizontal: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  saveButtonText: {
    alignItems: "center",
  },

  saveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },

  saveSubtext: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    marginTop: 2,
  },

  disabled: {
    opacity: 0.55,
  },
});
