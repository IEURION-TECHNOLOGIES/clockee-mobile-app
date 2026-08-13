import { useInstitutionForm } from "@/context/InstitutionFormContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

export default function CreateInstitutionStepFour() {
  const router = useRouter();
  const { form, updateForm } = useInstitutionForm();

  const { advanced } = form;

  const handleNext = () => {
    router.push("/onboarding/superAdmin/institution/create/stepFive");
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
          <Text style={styles.title}>Create New Institution</Text>
          <Text style={styles.subtitle}>
            Set up a new institution in just a few steps
          </Text>
        </View>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.completedDot]} />
        <View style={[styles.progressDot, styles.completedDot]} />
        <View style={[styles.progressDot, styles.completedDot]} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
      </View>

      {/* STEP INFO */}
      <Text style={styles.stepTitle}>Advanced</Text>
      <Text style={styles.stepSubtitle}>Extra Options</Text>

      {/* ENABLE BRANCHES */}
      <View style={styles.card}>
        <View style={styles.option}>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Enable Branches</Text>
            <Text style={styles.optionDesc}>
              Create multiple branch locations for your institution
            </Text>
          </View>

          <Switch
            value={advanced.enableBranches}
            onValueChange={(value) =>
              updateForm("advanced", {
                  enableBranches: value,
              })
            }
            trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
            thumbColor={
              advanced.enableBranches ? "#0EA5E9" : "#F1F5F9"
            }
          />
        </View>
      </View>

      {/* ENABLE DEPARTMENTS */}
      <View style={styles.card}>
        <View style={styles.option}>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>
              Enable Departments / Units
            </Text>
            <Text style={styles.optionDesc}>
              Create multiple departments within your institution
            </Text>
          </View>

          <Switch
            value={advanced.enableDepartments}
            onValueChange={(value) =>
              updateForm("advanced", {
                  enableDepartments: value,
              })
            }
            trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
            thumbColor={
              advanced.enableDepartments ? "#0EA5E9" : "#F1F5F9"
            }
          />
        </View>
      </View>

      {/* ENABLE PUBLIC STAFF */}
      <View style={styles.card}>
        <View style={styles.option}>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>
              Enable Public Staff Registration
            </Text>
            <Text style={styles.optionDesc}>
              Allow staff to register without admin invitation
            </Text>
          </View>

          <Switch
            value={advanced.enablePublicStaff}
            onValueChange={(value) =>
              updateForm("advanced", {
                  enablePublicStaff: value,
              })
            }
            trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
            thumbColor={
              advanced.enablePublicStaff ? "#0EA5E9" : "#F1F5F9"
            }
          />
        </View>
      </View>

      {/* NEXT */}
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: 20,
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    marginRight: 10,
  },

  completedDot: {
    backgroundColor: "#22C55E",
  },

  activeDot: {
    backgroundColor: "#0EA5E9",
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  stepSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionText: {
    flex: 1,
    marginRight: 12,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  optionDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  button: {
    marginTop: "auto",
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
