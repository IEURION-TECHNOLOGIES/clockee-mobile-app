import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

export default function PublicInviteSection({ institutionId }) {
  const [inviteLink, setInviteLink] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ==============================
  // Fetch existing public invite
  // ==============================
  const fetchPublicInvite = async () => {
    try {
      setLoading(true);

      // 🔥 Replace with real API
      // const res = await fetch(`/institutions/${institutionId}`);
      // const data = await res.json();
      // setInviteLink(data.publicInviteUrl);
      // setEnabled(data.publicInviteEnabled);

      // Temporary simulation
      await new Promise((r) => setTimeout(r, 500));
      setInviteLink(null);
      setEnabled(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicInvite();
  }, []);

  // ==============================
  // Generate or Regenerate
  // ==============================
  const generatePublicInvite = async () => {
    try {
      setLoading(true);

      // 🔥 Replace with backend call
      // const res = await fetch(`/institutions/${institutionId}/public-invite`, {
      //   method: "POST",
      // });
      // const data = await res.json();
      // setInviteLink(data.inviteUrl);
      // setEnabled(true);

      await new Promise((r) => setTimeout(r, 800));

      const fakeLink =
        "https://app.yourapp.com/join/token_generated_by_backend";

      setInviteLink(fakeLink);
      setEnabled(true);
    } catch (err) {
      Alert.alert("Error", "Failed to generate invite link.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Enable / Disable Public Link
  // ==============================
  const togglePublicInvite = async (value) => {
    try {
      setLoading(true);

      // 🔥 Replace with backend call
      // await fetch(`/institutions/${institutionId}/public-invite/toggle`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ enabled: value }),
      // });

      await new Promise((r) => setTimeout(r, 500));

      setEnabled(value);
    } catch (err) {
      Alert.alert("Error", "Failed to update invite status.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Copy Link
  // ==============================
  const handleCopy = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==============================
  // Share Link
  // ==============================
  const handleShare = async () => {
    if (!inviteLink) return;

    try {
      await Share.share({
        message: `Join our institution using this link:\n\n${inviteLink}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Public Invite Link</Text>

      {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

      {!inviteLink ? (
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={generatePublicInvite}
        >
          <Text style={styles.generateText}>Generate Public Link</Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* Enable / Disable Switch */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Enable Public Access</Text>
            <Switch
              value={enabled}
              onValueChange={togglePublicInvite}
            />
          </View>

          {/* Link Box */}
          <View style={styles.linkBox}>
            <Text numberOfLines={1} style={styles.linkText}>
              {inviteLink}
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={handleCopy}>
                <Text style={styles.actionText}>
                  {copied ? "Copied ✓" : "Copy"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShare}>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={generatePublicInvite}>
                <Text style={styles.regenerateText}>
                  Regenerate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
  },

  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  generateBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  generateText: {
    color: "#fff",
    fontWeight: "600",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
  },

  linkBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
  },

  linkText: {
    fontSize: 12,
    color: "#0F172A",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  actionText: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 12,
  },

  regenerateText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 12,
  },
});