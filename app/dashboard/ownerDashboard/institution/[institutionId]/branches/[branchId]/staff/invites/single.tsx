import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";

type Params = {
  institutionId?: string;
  branchId?: string;
};

export default function SingleInviteScreen() {
  const router = useRouter();
  const { institutionId, branchId } =
    useLocalSearchParams<Params>();

  const [email, setEmail] = useState("");
  const [role] = useState("Financial officer");
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter an email address.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Generate temporary token (replace with backend later)
      const token = Math.random().toString(36).substring(2, 10);

      // 2️⃣ Build invite link
      const inviteLink = `https://yourapp.com/join?token=${token}`;

      // 3️⃣ Log for now (replace with API later)
      console.log({
        institutionId,
        branchId,
        email,
        role,
        staffId,
        token,
      });

      // 4️⃣ Open native share sheet
      await Share.share({
        message: `You have been invited to join ${
          branchId || "our branch"
        } as ${role}.

Click the link below to accept the invitation:

${inviteLink}`,
      });

      Alert.alert("Success", "Invite link generated successfully.");

      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to generate invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>Single Invite</Text>

        <View style={{ width: 22 }} />
      </View>

      <View style={styles.form}>
        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* ROLE */}
        <Text style={styles.label}>Role</Text>
        <View style={styles.input}>
          <Text>{role}</Text>
        </View>

        {/* BRANCH */}
        <Text style={styles.label}>Branch</Text>
        <View style={styles.input}>
          <Text>{branchId || "Regional Headquarters"}</Text>
        </View>

        {/* STAFF ID */}
        <Text style={styles.label}>Staff ID</Text>
        <TextInput
          placeholder="Enter Staff ID"
          value={staffId}
          onChangeText={setStaffId}
          style={styles.input}
        />
      </View>

      {/* CONTINUE BUTTON */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSendInvite}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  form: {
    padding: 16,
    gap: 14,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    color: "#334155",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0F172A",
  },

  button: {
    margin: 16,
    backgroundColor: "#6BAED6",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: "auto",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});