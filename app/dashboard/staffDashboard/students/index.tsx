// students/Students.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AttendanceRoster from "@/components/students/AttendanceRoaster";
import BulkAttendanceEditor from "@/components/students/BulkAttendanceEditor";
import StudentClockIn from "@/components/students/StudentClockIn";
import BottomNav from "@/components/BottomNav";

type Props = {
  institutionId: string;
};

type AttendanceSummary = {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
};

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  background: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  border: "#E2E8F0",
  softBlue: "#E8F7FD",
  danger: "#DC2626",
  success: "#16A34A",
};

const getLocalDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function StudentsTab({
  institutionId,
}: Props) {
  /*
   * =========================================================
   * MODAL STATE
   * =========================================================
   */

  const [
    clockInModalVisible,
    setClockInModalVisible,
  ] = useState(false);

  const [
    bulkAttendanceModalVisible,
    setBulkAttendanceModalVisible,
  ] = useState(false);

  const [
    rosterModalVisible,
    setRosterModalVisible,
  ] = useState(false);

  /*
   * =========================================================
   * ATTENDANCE STATE
   * =========================================================
   */

  const [
    selectedAttendanceDate,
  ] = useState(getLocalDate());

  const [
    attendanceSummary,
    setAttendanceSummary,
  ] = useState<AttendanceSummary>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
  });

  /*
   * =========================================================
   * MODAL HANDLERS
   * =========================================================
   */

  const openClockInModal = () => {
    setClockInModalVisible(true);
  };

  const closeClockInModal = () => {
    setClockInModalVisible(false);
  };

  const openBulkAttendanceModal = () => {
    setBulkAttendanceModalVisible(true);
  };

  const closeBulkAttendanceModal = () => {
    setBulkAttendanceModalVisible(false);
  };

  const openRosterModal = () => {
    setRosterModalVisible(true);
  };

  const closeRosterModal = () => {
    setRosterModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="people-outline"
              size={27}
              color={COLORS.white}
            />
          </View>

          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Students
            </Text>

            <Text style={styles.heroSubtitle}>
              Manage student attendance and record
              student arrivals.
            </Text>
          </View>
        </View>

        {/* =====================================================
            STAFF INFO NOTICE
        ===================================================== */}

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>
              Staff student management
            </Text>

            <Text style={styles.permissionDescription}>
              Use this section to clock students in,
              update attendance, and view the attendance
              roster for your institution.
            </Text>
          </View>
        </View>

        {/* =====================================================
            ACTION SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Student attendance
          </Text>

          <Text style={styles.sectionSubtitle}>
            Choose an action to continue
          </Text>
        </View>

        <View style={styles.cards}>
          {/* ===================================================
              CLOCK IN STUDENT
          =================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={openClockInModal}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: "#FEF3C7",
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={27}
                color="#B45309"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Clock in student
              </Text>

              <Text style={styles.actionDescription}>
                Select a student and record their arrival.
                The clock-in uses the student's attendance
                record and GPS location.
              </Text>

              <View style={styles.actionFooter}>
                <Text
                  style={[
                    styles.actionLink,
                    {
                      color: "#B45309",
                    },
                  ]}
                >
                  Start clock-in
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#B45309"
                />
              </View>
            </View>
          </Pressable>

          {/* ===================================================
              BULK ATTENDANCE
          =================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={openBulkAttendanceModal}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: "#FFF7ED",
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={27}
                color="#EA580C"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Bulk attendance editor
              </Text>

              <Text style={styles.actionDescription}>
                Quickly update attendance status for
                multiple students at once.
              </Text>

              <View style={styles.actionFooter}>
                <Text
                  style={[
                    styles.actionLink,
                    {
                      color: "#EA580C",
                    },
                  ]}
                >
                  Edit attendance
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#EA580C"
                />
              </View>
            </View>
          </Pressable>

          {/* ===================================================
              ATTENDANCE ROSTER
          =================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={openRosterModal}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: "#F5F3FF",
                },
              ]}
            >
              <Ionicons
                name="clipboard-outline"
                size={27}
                color="#7C3AED"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Attendance roster
              </Text>

              <Text style={styles.actionDescription}>
                View student attendance records and check
                the attendance status for the selected date.
              </Text>

              <View style={styles.actionFooter}>
                <Text
                  style={[
                    styles.actionLink,
                    {
                      color: "#7C3AED",
                    },
                  ]}
                >
                  Open roster
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#7C3AED"
                />
              </View>
            </View>
          </Pressable>
        </View>

        {/* =====================================================
            ATTENDANCE OVERVIEW
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Attendance overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            {selectedAttendanceDate}
          </Text>
        </View>

        <View style={styles.overviewCard}>
          {/* TOP */}

          <View style={styles.overviewTop}>
            <View>
              <Text style={styles.overviewLabel}>
                Total students
              </Text>

              <Text style={styles.overviewNumber}>
                {attendanceSummary.total}
              </Text>
            </View>

            <View style={styles.overviewIcon}>
              <Ionicons
                name="people-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* SUMMARY */}

          <View style={styles.summaryGrid}>
            {[
              {
                key: "present",
                label: "Present",
                icon: "checkmark-circle",
                color: COLORS.success,
                background: "#ECFDF5",
              },
              {
                key: "late",
                label: "Late",
                icon: "time",
                color: "#D97706",
                background: "#FFFBEB",
              },
              {
                key: "absent",
                label: "Absent",
                icon: "close-circle",
                color: COLORS.danger,
                background: "#FEF2F2",
              },
              {
                key: "excused",
                label: "Excused",
                icon: "document-text",
                color: "#7C3AED",
                background: "#F5F3FF",
              },
            ].map((item) => (
              <View
                key={item.key}
                style={[
                  styles.summaryItem,
                  {
                    backgroundColor: item.background,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.color}
                />

                <Text
                  style={[
                    styles.summaryItemNumber,
                    {
                      color: item.color,
                    },
                  ]}
                >
                  {
                    attendanceSummary[
                      item.key as keyof AttendanceSummary
                    ]
                  }
                </Text>

                <Text
                  style={[
                    styles.summaryItemLabel,
                    {
                      color: item.color,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* =======================================================
          CLOCK-IN MODAL
      ======================================================= */}

      <Modal
        visible={clockInModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeClockInModal}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Clock in student
              </Text>

              <Text style={styles.modalSubtitle}>
                Select a student and record arrival
              </Text>
            </View>

            <Pressable
              onPress={closeClockInModal}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={23}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.componentContent
            }
            keyboardShouldPersistTaps="handled"
          >
            <StudentClockIn
              institutionId={institutionId}
              onClose={closeClockInModal}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* =======================================================
          BULK ATTENDANCE MODAL
      ======================================================= */}

      <Modal
        visible={bulkAttendanceModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={
          closeBulkAttendanceModal
        }
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Bulk attendance editor
              </Text>

              <Text style={styles.modalSubtitle}>
                Update attendance for multiple students
              </Text>
            </View>

            <Pressable
              onPress={closeBulkAttendanceModal}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={23}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.componentContent
            }
            keyboardShouldPersistTaps="handled"
          >
            <BulkAttendanceEditor
              date={selectedAttendanceDate}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* =======================================================
          ATTENDANCE ROSTER
      ======================================================= */}

      <AttendanceRoster
        visible={rosterModalVisible}
        institutionId={institutionId}
        date={selectedAttendanceDate}
        onClose={closeRosterModal}
        onSummaryChange={setAttendanceSummary}
      />

      <BottomNav dashboardType="staff" />
    </View>
  );
}

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 78  },

  content: {
    padding: 16,
    paddingBottom: 35,
    gap: 18,
  },

  /* =========================================================
     HERO
  ========================================================= */

  hero: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    padding: 18,
  },

  heroIcon: {
    width: 51,
    height: 51,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  heroText: {
    flex: 1,
    marginLeft: 13,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  /* =========================================================
     INFO
  ========================================================= */

  permissionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#BCE9FA",
    borderRadius: 16,
    backgroundColor: COLORS.softBlue,
    padding: 14,
  },

  permissionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  permissionText: {
    flex: 1,
    marginLeft: 10,
  },

  permissionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  permissionDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  /* =========================================================
     SECTIONS
  ========================================================= */

  sectionHeader: {
    marginTop: 2,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  /* =========================================================
     ACTION CARDS
  ========================================================= */

  cards: {
    gap: 12,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    padding: 15,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  actionIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  actionDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  actionFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    gap: 5,
  },

  actionLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  /* =========================================================
     OVERVIEW
  ========================================================= */

  overviewCard: {
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },

  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  overviewLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  overviewNumber: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },

  overviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    borderRadius: 13,
    paddingVertical: 10,
  },

  summaryItemNumber: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  summaryItemLabel: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },

  /* =========================================================
     MODAL
  ========================================================= */

  modalScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 17,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  componentContent: {
    padding: 16,
    paddingBottom: 35,
  },
});