
//  components/students/TakeAttendanceForm.tsx

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
  useStudentRoster,
  useSubmitAttendance,
} from "@/hooks/students";

import { StudentRosterItem } from "@/services/superAdminServices";

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  text: "#102A43",
  muted: "#64748B",
  border: "#DCEAF2",
  danger: "#DC2626",
  success: "#16A34A",
  background: "#F8FAFC",
};

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

const STATUS_ORDER: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
];

const STATUS_META: Record<
  AttendanceStatus,
  {
    bg: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  present: {
    bg: "#DCFCE7",
    color: "#15803D",
    icon: "checkmark-circle-outline",
    label: "Present",
  },

  absent: {
    bg: "#FEE2E2",
    color: "#B91C1C",
    icon: "close-circle-outline",
    label: "Absent",
  },

  late: {
    bg: "#FEF3C7",
    color: "#B45309",
    icon: "time-outline",
    label: "Late",
  },

  excused: {
    bg: "#EDE9FE",
    color: "#6D28D9",
    icon: "document-text-outline",
    label: "Excused",
  },
};

function getLocalDate(): string {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 10);
}

type Props = {
  onSuccess?: () => void;
};

export default function TakeAttendanceForm({
  onSuccess,
}: Props) {
  const [date] = useState<string>(getLocalDate);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] =
    useState<string>("");

  const [statusMap, setStatusMap] = useState<
    Record<string, AttendanceStatus>
  >({});

  /**
   * Debounce student search.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  /**
   * Load student roster.
   */
  const roster = useStudentRoster({
    date,
    search: debouncedSearch || undefined,
  });

  /**
   * Attendance mutation.
   */
  const submitAttendance = useSubmitAttendance();

  /**
   * Safely extract students from API response.
   */
  const students: StudentRosterItem[] =
    roster.data?.data ?? [];

  /**
   * Seed local status selections with existing attendance.
   *
   * Important:
   * Existing local selections are NOT overwritten.
   */
  useEffect(() => {
    if (!students.length) {
      return;
    }

    setStatusMap((current) => {
      const next = { ...current };

      students.forEach((student) => {
        const studentId = student._id;
        const existingStatus = student.attendance?.status;

        if (
          next[studentId] === undefined &&
          existingStatus
        ) {
          next[studentId] =
            existingStatus as AttendanceStatus;
        }
      });

      return next;
    });
  }, [students]);

  /**
   * Number of students currently marked.
   */
  const markedCount = useMemo(() => {
    return students.filter(
      (student) => Boolean(statusMap[student._id])
    ).length;
  }, [students, statusMap]);

  /**
   * Set attendance status for one student.
   */
  const setStatus = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setStatusMap((current) => ({
      ...current,
      [studentId]: status,
    }));
  };

  /**
   * Mark every currently displayed student.
   */
  const markAll = (status: AttendanceStatus) => {
    if (!students.length) {
      return;
    }

    setStatusMap((current) => {
      const next = { ...current };

      students.forEach((student) => {
        next[student._id] = status;
      });

      return next;
    });
  };

  /**
   * Submit attendance to backend.
   */
  const doSubmit = async () => {
    const records = Object.entries(statusMap).map(
      ([studentId, status]) => ({
        studentId,
        status,
      })
    );

    if (!records.length) {
      Alert.alert(
        "Nothing to submit",
        "Mark at least one student first."
      );

      return;
    }

    try {
      const response =
        await submitAttendance.mutateAsync({
          date,
          records,
        });

      console.log(
        "[TakeAttendanceForm] Submit success:",
        response?.data
      );

      Alert.alert(
        "Attendance saved",
        `Recorded attendance for ${records.length} student(s).`,
        [
          {
            text: "Done",
            onPress: onSuccess,
          },
        ]
      );
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Please try again.";

      Alert.alert(
        "Could not save attendance",
        message
      );
    }
  };

  /**
   * Validate before submitting.
   */
  const handleSubmit = () => {
    if (!students.length) {
      Alert.alert(
        "No students",
        "There are no students available to mark."
      );

      return;
    }

    if (submitAttendance.isPending) {
      return;
    }

    const unmarked =
      students.length - markedCount;

    if (unmarked > 0) {
      Alert.alert(
        "Incomplete",
        `${unmarked} student(s) not marked yet. Submit anyway?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            onPress: doSubmit,
          },
        ]
      );

      return;
    }

    doSubmit();
  };

  return (
    <View style={styles.container}>
      {/* SUMMARY */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={COLORS.white}
          />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>
            Taking attendance for
          </Text>

          <Text style={styles.summaryValue}>
            {date}
          </Text>
        </View>

        <View style={styles.summaryCountBadge}>
          <Text style={styles.summaryCountText}>
            {markedCount}
          </Text>

          <Text style={styles.summaryCountLabel}>
            /{students.length}
          </Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={18}
          color={COLORS.muted}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search students"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {roster.isFetching &&
        !roster.isLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.muted}
          />
        ) : null}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActionsRow}>
        <Pressable
          style={[
            styles.quickAction,
            {
              backgroundColor: "#DCFCE7",
            },
          ]}
          onPress={() => markAll("present")}
          disabled={!students.length}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color="#15803D"
          />

          <Text
            style={[
              styles.quickActionText,
              {
                color: "#15803D",
              },
            ]}
          >
            Mark all present
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.quickAction,
            {
              backgroundColor: "#FEE2E2",
            },
          ]}
          onPress={() => markAll("absent")}
          disabled={!students.length}
        >
          <Ionicons
            name="close-circle-outline"
            size={16}
            color="#B91C1C"
          />

          <Text
            style={[
              styles.quickActionText,
              {
                color: "#B91C1C",
              },
            ]}
          >
            Mark all absent
          </Text>
        </Pressable>
      </View>

      {/* LOADING */}
      {roster.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.stateText}>
            Loading roster...
          </Text>
        </View>
      ) : roster.isError ? (
        /* ERROR */
        <View style={styles.stateBox}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={COLORS.danger}
          />

          <Text style={styles.stateTitle}>
            Could not load roster
          </Text>

          <Text style={styles.stateText}>
            Something went wrong while loading students.
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => roster.refetch()}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : !students.length ? (
        /* EMPTY */
        <View style={styles.stateBox}>
          <Ionicons
            name="people-outline"
            size={36}
            color={COLORS.primary}
          />

          <Text style={styles.stateTitle}>
            No students found
          </Text>

          {debouncedSearch ? (
            <Text style={styles.stateText}>
              No students match &quot;{debouncedSearch}&quot;.
            </Text>
          ) : (
            <Text style={styles.stateText}>
              There are no students in the roster.
            </Text>
          )}
        </View>
      ) : (
        /* STUDENT LIST */
        <ScrollView
          style={styles.list}
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {students.map((student) => {
            const selected =
              statusMap[student._id];

            return (
              <View
                key={student._id}
                style={styles.studentRow}
              >
                {/* AVATAR */}
                <View style={styles.studentAvatar}>
                  <Text
                    style={
                      styles.studentAvatarText
                    }
                  >
                    {student.name
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </Text>
                </View>

                {/* STUDENT INFO */}
                <View style={styles.studentInfo}>
                  <Text
                    style={styles.studentName}
                    numberOfLines={1}
                  >
                    {student.name || "Unnamed student"}
                  </Text>

                  <Text
                    style={styles.studentMeta}
                    numberOfLines={1}
                  >
                    {student.studentOrStaffId ||
                      "No ID"}
                    {student.departmentName
                      ? ` · ${student.departmentName}`
                      : ""}
                  </Text>
                </View>

                {/* STATUS BUTTONS */}
                <View style={styles.statusPills}>
                  {STATUS_ORDER.map(
                    (status) => {
                      const meta =
                        STATUS_META[status];

                      const isActive =
                        selected === status;

                      return (
                        <Pressable
                          key={status}
                          onPress={() =>
                            setStatus(
                              student._id,
                              status
                            )
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`${meta.label} for ${student.name}`}
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                isActive
                                  ? meta.bg
                                  : COLORS.background,

                              borderColor:
                                isActive
                                  ? meta.color
                                  : COLORS.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={meta.icon}
                            size={16}
                            color={
                              isActive
                                ? meta.color
                                : COLORS.muted
                            }
                          />
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* SUBMIT */}
      <Pressable
        onPress={handleSubmit}
        disabled={
          submitAttendance.isPending ||
          !students.length
        }
        style={[
          styles.submitButton,
          (submitAttendance.isPending ||
            !students.length) &&
            styles.disabled,
        ]}
      >
        {submitAttendance.isPending ? (
          <>
            <ActivityIndicator
              color={COLORS.white}
            />

            <Text style={styles.submitText}>
              Saving attendance...
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="checkmark-done-outline"
              size={21}
              color={COLORS.white}
            />

            <Text style={styles.submitText}>
              Submit attendance
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    padding: 16,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  summaryText: {
    flex: 1,
    marginLeft: 11,
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "700",
  },

  summaryValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },

  summaryCountBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    borderRadius: 13,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  summaryCountText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  summaryCountLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    fontWeight: "700",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    minHeight: 46,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 8,
  },

  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  quickAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 4,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 10,
  },

  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F7FD",
  },

  studentAvatarText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    minWidth: 0,
  },

  studentName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  studentMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  statusPills: {
    flexDirection: "row",
    gap: 6,
  },

  statusPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 8,
  },

  stateText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
  },

  stateTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    elevation: 4,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.55,
  },
});

