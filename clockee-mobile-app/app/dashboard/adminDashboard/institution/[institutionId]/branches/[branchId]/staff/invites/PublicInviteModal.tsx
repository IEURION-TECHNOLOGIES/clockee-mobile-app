import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Share
} from "react-native";
import * as Clipboard from "expo-clipboard";


type Props = {
  visible: boolean;
  onClose: () => void;
};

type Params = {
  institutionId?: string;
  branchId?: string;
};

export default function PublicInviteModal({
  visible,
  onClose,
}: Props) {
  const { institutionId, branchId } =
    useLocalSearchParams<Params>();

  const [inviteLink, setInviteLink] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");

  // 🔥 Simulate token generation (replace with backend)
  const generateInvite = () => {
    const token =
      Math.random().toString(36).substring(2, 10);

    const link = `https://yourapp.com/join?institution=${institutionId}&branch=${branchId}&token=${token}`;

    setInviteLink(link);
  };

  useEffect(() => {
    if (visible) generateInvite();
  }, [visible]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert("Copied", "Invite link copied!");
  };

const shareLink = async () => {
  if (!inviteLink) return;

  try {
    await Share.share({
      message: `Join our branch using this link:\n\n${inviteLink}`,
    });
  } catch (error) {
    console.log("Share error:", error);
  }
};

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Public Invite Link
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* LINK BOX */}
          <Text style={styles.label}>
            Invite Link
          </Text>

          <View style={styles.linkBox}>
            <Text
              style={styles.linkText}
              numberOfLines={2}
            >
              {inviteLink}
            </Text>
          </View>

          {/* EXPIRY */}
          <Text style={styles.label}>
            Expiry (Days)
          </Text>

          <TextInput
            value={expiryDays}
            onChangeText={setExpiryDays}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* ACTIONS */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={copyToClipboard}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color="#0284C7"
              />
              <Text style={styles.secondaryText}>
                Copy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={shareLink}
            >
              <Ionicons
                name="share-social-outline"
                size={16}
                color="#0284C7"
              />
              <Text style={styles.secondaryText}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* REGENERATE */}
          <TouchableOpacity
            style={styles.regenerateBtn}
            onPress={generateInvite}
          >
            <Text style={styles.regenerateText}>
              Regenerate Link
            </Text>
          </TouchableOpacity>

          {/* CLOSE */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onClose}
          >
            <Text style={styles.primaryText}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontWeight: "600",
    fontSize: 16,
  },

  label: {
    fontSize: 13,
    color: "#334155",
  },

  linkBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },

  linkText: {
    fontSize: 13,
    color: "#0284C7",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  secondaryBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 10,
  },

  secondaryText: {
    color: "#0284C7",
    fontWeight: "500",
  },

  regenerateBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },

  regenerateText: {
    color: "#DC2626",
    fontWeight: "500",
  },

  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});