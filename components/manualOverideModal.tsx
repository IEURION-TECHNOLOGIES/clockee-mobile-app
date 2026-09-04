import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { manualOverrideClock } from "@/services/superAdminServices";

type ActionType = "clock-in" | "clock-out";

type Props = {
  visible: boolean;
  userId: string;
  branchId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ManualOverrideModal({
  visible,
  userId,
  branchId,
  userName,
  onClose,
  onSuccess,
}: Props) {
  const [actionType, setActionType] =
    useState<ActionType>("clock-in");

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !!userId &&
      !!branchId &&
      reason.trim().length > 0 &&
      !loading
    );
  }, [userId, branchId, reason, loading]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        userId,
        actionType,
        branchId,
        reason: reason.trim(),
      };

      console.log(
        "[ManualOverrideModal] Submitting:",
        payload
      );

      const response =
        await manualOverrideClock(payload);

      console.log(
        "[ManualOverrideModal] Success:",
        response.data
      );

      setReason("");
      onClose();
      onSuccess?.();
    } catch (submitError: any) {
      console.error(
        "[ManualOverrideModal] Failed:",
        {
          message: submitError?.message,
          status: submitError?.response?.status,
          response:
            submitError?.response?.data,
        }
      );

      const backendMessage =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        submitError?.message ||
        "Failed to perform manual override.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Manual override
              </Text>

              <Text style={styles.subtitle}>
                Clock {userName} in or out.
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={20}
                color="#64748B"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.content
            }
          >
            {/* ACTION TYPE */}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Action type
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionOption,
                    actionType === "clock-in" &&
                      styles.actionOptionActive,
                  ]}
                  onPress={() =>
                    setActionType("clock-in")
                  }
                >
                  <Ionicons
                    name="log-in-outline"
                    size={19}
                    color={
                      actionType === "clock-in"
                        ? "#0284C7"
                        : "#64748B"
                    }
                  />

                  <Text
                    style={[
                      styles.actionOptionText,
                      actionType === "clock-in" &&
                        styles.actionOptionTextActive,
                    ]}
                  >
                    Clock in
                  </Text>

                  {actionType === "clock-in" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0284C7"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionOption,
                    actionType === "clock-out" &&
                      styles.actionOptionOutActive,
                  ]}
                  onPress={() =>
                    setActionType("clock-out")
                  }
                >
                  <Ionicons
                    name="log-out-outline"
                    size={19}
                    color={
                      actionType === "clock-out"
                        ? "#EA580C"
                        : "#64748B"
                    }
                  />

                  <Text
                    style={[
                      styles.actionOptionText,
                      actionType === "clock-out" &&
                        styles.actionOptionTextOutActive,
                    ]}
                  >
                    Clock out
                  </Text>

                  {actionType === "clock-out" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#EA580C"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* REASON */}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Reason
              </Text>

              <Text style={styles.sectionHint}>
                Explain why you are overriding this attendance record. This is required.
              </Text>

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="For example: 'Forgot to clock in, confirmed present by supervisor.'"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.reasonInput}
              />

              <View style={styles.reasonHintRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#64748B"
                />

                <Text style={styles.reasonHint}>
                  This reason will be stored with the attendance record.
                </Text>
              </View>
            </View>

            {error.length > 0 && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* FOOTER */}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.submitButtonText}>
                    Apply override
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 11,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },

  section: {
    marginBottom: 18,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },

  sectionHint: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 16,
  },

  actionRow: {
    gap: 10,
  },

  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    paddingHorizontal: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
  },

  actionOptionActive: {
    backgroundColor: "#F0F9FF",
    borderColor: "#7DD3FC",
  },

  actionOptionOutActive: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },

  actionOptionText: {
    flex: 1,
    marginLeft: 10,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },

  actionOptionTextActive: {
    color: "#0284C7",
  },

  actionOptionTextOutActive: {
    color: "#EA580C",
  },

  reasonInput: {
    minHeight: 90,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    color: "#0F172A",
    fontSize: 13,
    lineHeight: 18,
  },

  reasonHintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  reasonHint: {
    flex: 1,
    marginLeft: 6,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 14,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 16,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  cancelButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "800",
  },

  submitButton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#075985",
    borderRadius: 14,
    marginLeft: 10,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
