import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BulkInviteModal from "./BulkInviteModal";
import PublicInviteModal from "./PublicInviteModal";

type InviteType =
  | "manual"
  | "public"
  | "single"
  | "bulk";

type Params = {
  institutionId?: string;
  branchId?: string;
};

export default function NewInviteScreen() {
  const router = useRouter();
  const { institutionId, branchId } =
    useLocalSearchParams<Params>();

  const [selected, setSelected] =
    useState<InviteType>("manual");

  const [showBulkModal, setShowBulkModal] =
    useState(false);

  const [showPublicModal, setShowPublicModal] =
    useState(false);

  const handleContinue = () => {
    if (!institutionId || !branchId) return;

    switch (selected) {
      case "manual":
        router.push(
          `/dashboard/ownerDashboard/institution/${institutionId}/branches/${branchId}/staff/create`
        );
        break;

      case "public":
        setShowPublicModal(true);
        break;

      case "single":
        router.push(
          `/dashboard/ownerDashboard/institution/${institutionId}/branches/${branchId}/staff/invites/single`
        );
        break;

      case "bulk":
        setShowBulkModal(true);
        break;
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.arrow} >
            <Ionicons name="arrow-back" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Invite Staff</Text>

          {/* <TouchableOpacity>
            <Text style={styles.history}>History</Text>
          </TouchableOpacity> */}
        </View>

        {/* OPTIONS */}
        <View style={styles.options}>

          {/* MANUAL */}
          <InviteOption
            label="Manual Creation"
            description="Create staff profile directly without sending invite."
            selected={selected === "manual"}
            onPress={() => setSelected("manual")}
          />

          {/* PUBLIC */}
          <InviteOption
            label="Public Invite"
            description="Generate a public join link for this branch."
            selected={selected === "public"}
            onPress={() => setSelected("public")}
          />

          {/* SINGLE */}
          <InviteOption
            label="Single Invite"
            description="Send invitation link to one staff member."
            selected={selected === "single"}
            onPress={() => setSelected("single")}
          />

          {/* BULK */}
          <InviteOption
            label="Bulk Invite"
            description="Upload CSV file to invite multiple staff."
            selected={selected === "bulk"}
            onPress={() => setSelected("bulk")}
          />
        </View>

        {/* CONTINUE */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <BulkInviteModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      
      <PublicInviteModal
        visible={showPublicModal}
        onClose={() => setShowPublicModal(false)}
      />
    </>
  );
}

/* ------------------------------
   Reusable Option Component
-------------------------------- */

function InviteOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        selected && styles.optionActive,
      ]}
      onPress={onPress}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioDot} />}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>
          {label}
        </Text>
        <Text style={styles.optionDesc}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------
   Styles
-------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  arrow:{
    position: "absolute",
    left: 16,
    top: 40,
    padding: 8,
    borderRadius: 999,

  },

  history: {
    color: "#0284C7",
    fontWeight: "500",
  },

  options: {
    padding: 16,
    gap: 14,
  },

  option: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  optionActive: {
    borderColor: "#0284C7",
    backgroundColor: "#F0F9FF",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0284C7",
  },

  optionTitle: {
    fontWeight: "600",
    fontSize: 14,
  },

  optionDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  continueBtn: {
    margin: 16,
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontWeight: "600",
  },
});