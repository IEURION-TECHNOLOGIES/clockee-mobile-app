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
import BulkStudentUpload from "@/components/students/BulkStudentUpload";
import CreateStudentForm from "@/components/students/CreateStudentForm";
import StudentClockIn from "@/components/students/StudentClockIn";


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
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [
    uploadModalVisible,
    setUploadModalVisible,
  ] = useState(false);

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

  const [
    attendanceRefreshKey,
    setAttendanceRefreshKey,
  ] = useState(0);

  /*
   * =========================================================
   * MODAL HANDLERS
   * =========================================================
   */

  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const openUploadModal = () => {
    setUploadModalVisible(true);
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
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

  const openClockInModal = () => {
  setClockInModalVisible(true);
};

const closeClockInModal = () => {
  setClockInModalVisible(false);
};

  /*
   * =========================================================
   * SUCCESS HANDLER
   * =========================================================
   */

  const refreshAttendance = () => {
    setAttendanceRefreshKey(
      (value) => value + 1
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =========================================================
            HEADER
        ========================================================= */}

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
              Manage students, bulk uploads and attendance
              records.
            </Text>
          </View>
        </View>

        {/* =========================================================
            INFO NOTICE
        ========================================================= */}

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>
              Student management
            </Text>

            <Text
              style={styles.permissionDescription}
            >
              Create individual students, upload multiple
              students with CSV, or manage attendance
              records for your student roster.
            </Text>
          </View>
        </View>

        {/* =========================================================
            ACTION CARDS
        ========================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Student management
          </Text>

          <Text style={styles.sectionSubtitle}>
            Choose an action to continue
          </Text>
        </View>

        <View style={styles.cards}>
          {/* CREATE STUDENT */}

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={openCreateModal}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    COLORS.softBlue,
                },
              ]}
            >
              <Ionicons
                name="person-add-outline"
                size={27}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Create student
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Add a new student and their parent or
                guardian information.
              </Text>

              <View style={styles.actionFooter}>
                <Text style={styles.actionLink}>
                  Open form
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </Pressable>

          {/* BULK CSV */}

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={openUploadModal}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: "#F0FDF4",
                },
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={27}
                color={COLORS.success}
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Bulk CSV upload
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Import many students at once using a
                properly formatted CSV file.
              </Text>

              <View style={styles.actionFooter}>
                <Text
                  style={[
                    styles.actionLink,
                    {
                      color: COLORS.success,
                    },
                  ]}
                >
                  Upload CSV
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={COLORS.success}
                />
              </View>
            </View>
          </Pressable>

          {/* CLOCK IN STUDENT */}

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
                name="scan-outline"
                size={27}
                color="#B45309"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Clock in student
              </Text>

              <Text
                style={styles.actionDescription}
              >
                Select a student and record their arrival with GPS location.
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

          {/* BULK ATTENDANCE */}

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

              <Text
                style={styles.actionDescription}
              >
                Quickly update attendance status and
                notes for multiple students at once.
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

          {/* ATTENDANCE ROSTER */}

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

              <Text
                style={styles.actionDescription}
              >
                View the student attendance roster and
                record attendance for the selected date.
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

        {/* =========================================================
            ATTENDANCE SUMMARY
        ========================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Attendance overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            {selectedAttendanceDate}
          </Text>
        </View>

        <View style={styles.overviewCard}>
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
                    backgroundColor:
                      item.background,
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

        {/* =========================================================
            CSV GUIDE
        ========================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            CSV upload format
          </Text>

          <Text style={styles.sectionSubtitle}>
            Prepare your file before uploading
          </Text>
        </View>

        <View style={styles.csvGuide}>
          <View style={styles.csvGuideHeader}>
            <View style={styles.csvGuideIcon}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View
              style={styles.csvGuideHeaderText}
            >
              <Text style={styles.csvGuideTitle}>
                Required student columns
              </Text>

              <Text
                style={styles.csvGuideSubtitle}
              >
                Use the same column names expected by
                the backend.
              </Text>
            </View>
          </View>

          <View style={styles.columnList}>
            {[
              "name",
              "email",
              "studentId",
              "phone",
              "password",
              "parentName",
              "parentEmail",
              "parentPhone",
              "parentPassword",
            ].map((column) => (
              <View
                key={column}
                style={styles.columnChip}
              >
                <Text style={styles.columnText}>
                  {column}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.csvTip}>
            <Ionicons
              name="bulb-outline"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.csvTipText}>
              Save the spreadsheet as CSV before
              selecting it for upload.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* =========================================================
          CREATE STUDENT MODAL
      ========================================================= */}

      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Create student
              </Text>

              <Text style={styles.modalSubtitle}>
                Add a student and parent information
              </Text>
            </View>

            <Pressable
              onPress={closeCreateModal}
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
            <CreateStudentForm
              onSuccess={() => {
                closeCreateModal();
                refreshAttendance();
              }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          BULK CSV MODAL
      ========================================================= */}

      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeUploadModal}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Bulk student upload
              </Text>

              <Text style={styles.modalSubtitle}>
                Import students using a CSV file
              </Text>
            </View>

            <Pressable
              onPress={closeUploadModal}
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
            <BulkStudentUpload
              onSuccess={() => {
                closeUploadModal();
                refreshAttendance();
              }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          BULK ATTENDANCE EDITOR MODAL
      ========================================================= */}

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

      {/* =========================================================
    STUDENT CLOCK-IN MODAL
========================================================= */}

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

      {/* =========================================================
          ATTENDANCE ROSTER
          The entire roster is now handled by its own component.
      ========================================================= */}

      <AttendanceRoster
        key={attendanceRefreshKey}
        visible={rosterModalVisible}
        institutionId={institutionId}
        date={selectedAttendanceDate}
        onClose={closeRosterModal}
        onSummaryChange={setAttendanceSummary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

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
    backgroundColor:
      "rgba(255,255,255,0.18)",
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
    transform: [{ scale: 0.99 }],
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
     CSV GUIDE
  ========================================================= */

  csvGuide: {
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },

  csvGuideHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  csvGuideIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  csvGuideHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  csvGuideTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  csvGuideSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  columnList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },

  columnChip: {
    borderRadius: 9,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  columnText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: "700",
  },

  csvTip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 10,
    borderRadius: 11,
    backgroundColor: COLORS.softBlue,
  },

  csvTipText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 7,
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



