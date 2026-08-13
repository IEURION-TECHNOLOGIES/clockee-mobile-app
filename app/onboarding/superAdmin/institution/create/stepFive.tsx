import { useInstitutionForm } from "@/context/InstitutionFormContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function AssignInstitutionAdmin() {
  const router = useRouter();
  const { form, updateForm } = useInstitutionForm();

  const { admin } = form;

  const handleSubmit = () => {
    /**
     * FINAL PAYLOAD (ready for API)
     * console.log(form);
     *
     * {
     *   basic,
     *   location,
     *   contact,
     *   timeAttendance,
     *   advanced,
     *   admin
     * }
     */

    router.push("/onboarding/superAdmin/institution/create/success");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Assign Institution Admin</Text>
          <Text style={styles.subtitle}>
            Set up the primary administrator account
          </Text>
        </View>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.completed]} />
        <View style={[styles.progressDot, styles.completed]} />
        <View style={[styles.progressDot, styles.completed]} />
        <View style={[styles.progressDot, styles.completed]} />
        <View style={[styles.progressDot, styles.active]} />
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.label}>Admin Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Admin Name"
          value={admin.name}
          onChangeText={(value) =>
            updateForm("admin", {
                name: value,
            })
          }
        />

        <Text style={styles.label}>Admin Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Admin Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={admin.email}
          onChangeText={(value) =>
            updateForm("admin", {
                email: value,
            })
          }
        />
        <Text style={styles.hint}>
          An invitation will be sent to this email address
        </Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          value={admin.phone}
          onChangeText={(value) =>
            updateForm("admin", {
                phone: value,
            })
          }
        />

        <Text style={styles.label}>Role</Text>
        <Pressable
          style={styles.select}
          onPress={() =>
            updateForm("admin", {
                role: value,
            })
          }
        >
          <Text style={styles.selectText}>
            {admin.role || "Select Role"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </Pressable>
      </View>

      {/* SUBMIT */}
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Finish Setup</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  progressContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    marginRight: 10,
  },

  completed: {
    backgroundColor: "#22C55E",
  },

  active: {
    backgroundColor: "#0EA5E9",
  },

  form: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
  },

  hint: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 14,
  },

  select: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    fontSize: 14,
    color: "#64748B",
  },

  button: {
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
