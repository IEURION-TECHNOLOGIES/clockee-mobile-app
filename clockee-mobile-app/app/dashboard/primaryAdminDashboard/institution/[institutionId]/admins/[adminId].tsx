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

export default function AdminProfile() {
  const router = useRouter();
  const { adminId, institutionId } = useLocalSearchParams<{
    adminId: string;
    institutionId: string;
  }>();

  /* ===== MOCK DATA (API later) ===== */
  const admin = {
    id: adminId,
    name: "John Doe",
    email: "john@greenwood.com",
    phone: "+234 812 345 6789",
    role: "Primary Admin",

    gender: "Male",
    staffId: "GRW-ADM-021",
    department: "Operations",
    branch: "Ikeja Branch",
    employmentType: "Full Time",
    dateEmployed: "12 Feb 2022",

    clockIns: 328,

    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=0284C7&color=fff",
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
                pathname: "/dashboard/primaryAdminDashboard/institution/[institutionId]/admins/edit-admin",
                params: { adminId, institutionId },
              })
            }
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <Image source={{ uri: admin.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{admin.name}</Text>
        <Text style={styles.role}>{admin.role}</Text>

        {/* STATS */}
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={18} color="#22C55E" />
          <Text style={styles.statText}>{admin.clockIns} Clock-ins</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* DETAILS */}
        <View style={styles.section}>
          <InfoRow icon="mail-outline" label="Email" value={admin.email} />
          <InfoRow icon="call-outline" label="Phone" value={admin.phone} />
          <InfoRow icon="male-female-outline" label="Gender" value={admin.gender} />
          <InfoRow icon="id-card-outline" label="Staff ID" value={admin.staffId} />
          <InfoRow icon="business-outline" label="Department" value={admin.department} />
          <InfoRow icon="git-branch-outline" label="Branch" value={admin.branch} />
          <InfoRow icon="briefcase-outline" label="Employment Type" value={admin.employmentType} />
          <InfoRow icon="calendar-outline" label="Date Employed" value={admin.dateEmployed} />
        </View>
      </ScrollView>

      {/* FLOATING EDIT BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/dashboard/primaryAdminDashboard/institution/[institutionId]/admins/edit-admin",
            params: { adminId, institutionId },
          })
        }
      >
        <Ionicons name="create" size={22} color="#fff" />
      </TouchableOpacity>
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
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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

  statBox: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
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