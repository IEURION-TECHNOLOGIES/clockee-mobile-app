import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  email: string;
  onClose: () => void;
};

export default function SingleInviteModal({
  visible,
  email,
  onClose,
}: Props) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /**
   * ===============================
   * BACKEND INVITE GENERATOR (READY)
   * ===============================
   */
  const generateInvite = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setError("");

      // 🔥 Replace this with real backend call later
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const generatedLink =
        "https://app.clockee.io/invite/token_generated_by_backend";

      setInviteLink(generatedLink);
    } catch (err) {
      setError("Failed to generate invite link.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy link
   */
  const handleCopy = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Native Share (FIXED)
   * This uses React Native Share API
   * NOT expo-sharing
   */
  const handleShare = async () => {
    if (!inviteLink) return;

    try {
      await Share.share({
        message: `You're invited to join Clockee!\n\nJoin using this link:\n${inviteLink}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    setError("");
    setCopied(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Single Invite</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.desc}>
            Generate a secure invite link for{" "}
            <Text style={{ fontWeight: "600" }}>{email}</Text>.
          </Text>

          {/* GENERATE BUTTON */}
          {!inviteLink && (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateInvite}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateText}>
                  Generate Invite Link
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* LINK SECTION */}
          {inviteLink && (
            <>
              <View style={styles.linkBox}>
                <Text numberOfLines={1} style={styles.link}>
                  {inviteLink}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={handleCopy}>
                    <Text style={styles.copy}>
                      {copied ? "Copied ✓" : "Copy"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleShare}>
                    <Text style={styles.share}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          {/* DONE BUTTON */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleClose}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  desc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
  },

  generateBtn: {
    marginTop: 16,
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  generateText: {
    color: "#fff",
    fontWeight: "600",
  },

  linkBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
  },

  link: {
    fontSize: 12,
    color: "#0F172A",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  copy: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 12,
  },

  share: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 12,
  },

  error: {
    color: "#DC2626",
    marginTop: 10,
    fontSize: 12,
  },

  doneBtn: {
    marginTop: 18,
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  doneText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});