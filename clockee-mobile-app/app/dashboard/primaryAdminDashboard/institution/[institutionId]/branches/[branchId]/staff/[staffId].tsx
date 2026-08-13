import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaffProfile() {
  const router = useRouter();
  const { staffId, institutionId, branchId } =
    useLocalSearchParams<{
      staffId: string;
      institutionId: string;
      branchId: string;
    }>();

  /* ===== MOCK DATA (API later) ===== */
  const staff = {
    id: staffId,
    name: "Sarah James",
    email: "sarah@greenwood.com",
    phone: "+234 812 345 6789",

    role: "Teacher", // Teacher | Administration | Support
    subject: "Mathematics", // Only if Teacher

    gender: "Female",
    staffId: "GRW-STF-045",
    department: "Academics",
    branch: "Main Campus",
    employmentType: "Full Time",
    dateEmployed: "04 Mar 2021",

    clockIns: 412,
    attendanceRate: "94%",
    lateCount: 12,

    avatar:
      "https://ui-avatars.com/api/?name=Sarah+James&background=0284C7&color=fff",
  };

  /* ===== WHAT STAFF IS DOING ===== */
  const getActivityLabel = () => {
    if (staff.role === "Teacher") {
      return `Teaching ${staff.subject}`;
    }
    if (staff.role === "Administration") {
      return "Administrative Operations";
    }
    if (staff.role === "Support") {
      return "Support Services";
    }
    return "";
  };

  return (
    <View style={styles.container}>
      {/* ===== HERO HEADER ===== */}
      <LinearGradient colors={["#0284C7", "#0F172A"]} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/primaryAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/edit",
                params: { staffId, institutionId, branchId },
              })
            }
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <Image source={{ uri: staff.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{staff.role}</Text>

        {/* WHAT THEY ARE DOING */}
        <View style={styles.activityBox}>
          <Ionicons name="briefcase-outline" size={16} color="#22C55E" />
          <Text style={styles.activityText}>{getActivityLabel()}</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <StatItem icon="time-outline" label="Clock-ins" value={staff.clockIns.toString()} />
          <StatItem icon="checkmark-circle-outline" label="Attendance" value={staff.attendanceRate} />
          <StatItem icon="alert-circle-outline" label="Late" value={staff.lateCount.toString()} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* DETAILS */}
        <View style={styles.section}>
          <InfoRow icon="mail-outline" label="Email" value={staff.email} />
          <InfoRow icon="call-outline" label="Phone" value={staff.phone} />
          <InfoRow icon="male-female-outline" label="Gender" value={staff.gender} />
          <InfoRow icon="id-card-outline" label="Staff ID" value={staff.staffId} />
          <InfoRow icon="business-outline" label="Department" value={staff.department} />
          <InfoRow icon="git-branch-outline" label="Branch" value={staff.branch} />
          <InfoRow icon="briefcase-outline" label="Employment Type" value={staff.employmentType} />
          <InfoRow icon="calendar-outline" label="Date Employed" value={staff.dateEmployed} />

          {/* SUBJECT (ONLY FOR TEACHERS) */}
          {staff.role === "Teacher" && (
            <InfoRow icon="book-outline" label="Subject" value={staff.subject} />
          )}
        </View>
      </ScrollView>

      {/* FLOATING EDIT BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname:
              "/dashboard/primaryAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/edit",
            params: { staffId, institutionId, branchId },
          })
        }
      >
        <Ionicons name="create" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ================= SMALL STAT ITEM ================= */
function StatItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ================= INFO ROW ================= */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#0284C7" />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },

  hero: {
    paddingTop: 48,
    paddingBottom: 30,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: "center",
  },

  header: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  role: {
    fontSize: 13,
    marginTop: 4,
    color: "#E0F2FE",
    fontWeight: "600",
  },

  activityBox: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 24,
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    color: "#fff",
    fontWeight: "800",
    marginTop: 4,
  },

  statLabel: {
    fontSize: 10,
    color: "#E0F2FE",
  },

  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 16,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0284C7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});