import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResponseModal from "./ResponseModal";

type RoleType = "admin" | "staff";
type StatusType = "active" | "inactive";
type ActionType =
  | "promote"
  | "demote"
  | "deactivate"
  | "reset"
  | "logout"
  | "remote";

type Props = {
  visible: boolean;
  role: RoleType;
  status: StatusType;
  remoteAccess?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onPromote?: () => Promise<any>;
  onDemote?: () => Promise<any>;
  onDeactivate?: () => Promise<any>;
  onReactivate?: () => Promise<any>;
  onResetPassword?: () => Promise<any>;
  onLogout?: () => Promise<any>;
  onToggleRemote?: () => Promise<any>;
};

export default function UserActionModal({
  visible,
  role,
  status,
  remoteAccess = false,
  onClose,
  onRefresh,
  onPromote,
  onDemote,
  onDeactivate,
  onReactivate,
  onResetPassword,
  onLogout,
  onToggleRemote,
}: Props) {
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  /* ANIMATION */
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  /* ACTIONS */
  const actions = [
    role === "staff"
      ? {
          key: "promote" as const,
          label: "Promote to Admin",
          icon: "arrow-up-circle-outline",
          color: "#16A34A",
          handler: onPromote,
        }
      : {
          key: "demote" as const,
          label: "Demote to Staff",
          icon: "arrow-down-circle-outline",
          color: "#2563EB",
          handler: onDemote,
        },

    {
      key: "remote" as const,
      label: remoteAccess
        ? "Disable Remote Clocking"
        : "Enable Remote Clocking",
      icon: remoteAccess ? "cloud-offline-outline" : "wifi",
      color: remoteAccess ? "#DC2626" : "#0284C7",
      handler: onToggleRemote,
    },

    // {
    //   key: "reset" as const,
    //   label: "Reset Password",
    //   icon: "key-outline",
    //   color: "#F59E0B",
    //   handler: onResetPassword,
    // },

    status === "active"
      ? {
          key: "deactivate" as const,
          label: "Deactivate User",
          icon: "close-circle-outline",
          color: "#DC2626",
          handler: onDeactivate,
        }
      : {
          key: "deactivate" as const,
          label: "Reactivate User",
          icon: "checkmark-circle-outline",
          color: "#16A34A",
          handler: onReactivate,
        },

    // {
    //   key: "logout" as const,
    //   label: "Logout User",
    //   icon: "log-out-outline",
    //   color: "#7C3AED",
    //   handler: onLogout,
    // },
  ];

  const executeAction = useCallback(
    async (handler?: () => Promise<any>) => {
      if (!handler) return;
      try {
        setLoading(true);
        await handler();
        onClose();
        onRefresh?.();
      } catch (err) {
        console.log("Action failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [onClose, onRefresh]
  );

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.title}>User Actions</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0284C7" />
          ) : (
            <>
              {actions.map(
                (action) =>
                  action.handler && (
                    <TouchableOpacity
                      key={action.key}
                      style={styles.actionBtn}
                      onPress={() => executeAction(action.handler)}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={20}
                        color={action.color}
                      />
                      <Text
                        style={[styles.actionText, { color: action.color }]}
                      >
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  )
              )}

              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancel: {
    textAlign: "center",
    marginTop: 16,
    color: "#64748B",
    fontWeight: "600",
  },
});
