import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DisableInviteModal from "./Disable";
import ExtraInvitePreviewModal from "./ExtraInvitePreviewModal";
import RegenerateInviteModal from "./Regenerate";
import ViewInviteModal from "./ViewSingleInvite";


export default function InvitesScreen() {
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);



  const [invites, setInvites] = useState([
  {
    id: "1",
    type: "Single Invite",
    name: "John Doe Abel",
    branch: "East Branch",
    status: "active",
    avatars: 1,
  },
  {
    id: "2",
    type: "Bulk Invite",
    extra: "+3 persons",
    branch: "Ikeja Branch",
    status: "active",
    avatars: 3,
  },
  {
    id: "3",
    type: "Public Invite",
    extra: "+10 persons",
    branch: "East Branch",
    status: "active",
    avatars: 3,
  },
  {
    id: "4",
    type: "Single Invite",
    name: "Mimi Jakes",
    branch: "Regional Branch",
    status: "disabled",
    avatars: 1,
  },
  {
    id: "5",
    type: "Bulk Invite",
    extra: "+10 persons",
    branch: "East Branch",
    status: "active",
    avatars: 3,
  },
  {
    id: "6",
    type: "Single Invite",
    name: "Mimi Jakes",
    branch: "Regional Branch",
    status: "disabled",
    avatars: 1,
  },
  {
    id: "7",
    type: "Public Invite",
    extra: "+10 persons",
    branch: "East Branch",
    status: "active",
    avatars: 3,
  },
  {
    id: "8",
    type: "Bulk Invite",
    name: "Mimi Jakes",
    branch: "Regional Branch",
    status: "disabled",
    avatars: 1,
  },
]);


  /* ================= ACTION HANDLERS ================= */
const handleViewInvite = () => {
  setMenuVisible(false);

  if (selectedInvite?.type === "Single Invite") {
    setShowViewModal(true);
  }else if (selectedInvite?.type === "Bulk Invite") {
    router.push("/dashboard/superAdminDashboard/BulkApproved");
  }
};


  const handleDisableInvite = () => {
    setMenuVisible(false);
    setShowDisableModal(true);
    console.log("Disable Invite:", selectedInvite);
  };

const handleRegenerateInvite = () => {
  setMenuVisible(false);
  setShowRegenerateModal(true);
};

  const updateInviteStatus = (status: "active" | "disabled") => {
  setInvites((prev) =>
    prev.map((inv) =>
      inv.id === selectedInvite.id ? { ...inv, status } : inv
    )
  );
};


  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Invites</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/dashboard/superAdminDashboard/new")}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ================= LIST ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {invites.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedInvite(item);
              setMenuVisible(true);
            }}
          >
            {/* Top row */}
            <View style={styles.cardTop}>
              <Text style={styles.inviteType}>{item.type}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "active"
                    ? styles.activeBadge
                    : styles.disabledBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "disabled" && { color: "#0F172A" },
                  ]}
                >
                  {item.status === "active" ? "Active" : "Disabled"}
                </Text>
              </View>
            </View>

            {/* Avatars / Name */}
            <View style={styles.avatarRow}>
              {item.avatars > 1 ? (
                <View style={styles.avatarStack}>
                  {[...Array(item.avatars)].map((_, i) => (
                    <Image
                      key={i}
                      source={{ uri: `https://i.pravatar.cc/100?img=${i + 5}` }}
                      style={[
                        styles.avatar,
                        { marginLeft: i === 0 ? 0 : -10 },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <Image
                  source={{ uri: "https://i.pravatar.cc/100" }}
                  style={styles.avatar}
                />
              )}

              <View>
                {item.name && <Text style={styles.name}>{item.name}</Text>}
                {item.extra && (
                  <TouchableOpacity onPress={() => setShowExtraModal(true)}>
                    <Text style={styles.extra}>{item.extra}</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.branch}>{item.branch}</Text>
                <Text style={styles.time}>Sent 3 days ago</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= ACTION MENU ================= */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewInvite}
            >
              <Text style={styles.menuText}>View Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDisableInvite}
            >
              <Text style={styles.menuText}>Disable Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRegenerateInvite}
            >
              <Text style={styles.menuText}>Regenerate Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        <ViewInviteModal
        visible={showViewModal}
        invite={selectedInvite}
        onClose={() => setShowViewModal(false)}
        />
        <DisableInviteModal
          visible={showDisableModal}
          onClose={() => setShowDisableModal(false)}
          onConfirm={() => {
            updateInviteStatus("disabled");
            setShowDisableModal(false);
          }}
        />

        <RegenerateInviteModal
          visible={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={() => {
            setShowRegenerateModal(false);

            // Only Single Invite goes to SingleInvite form
            if (selectedInvite?.type === "Single Invite") {
              router.push({
                pathname: "/dashboard/superAdminDashboard/InviteForm",
                params: {
                  name: selectedInvite.name ?? "",
                  email: selectedInvite.email ?? "",
                  role: "Admin",
                },
              });
            }

            // Bulk / Public → bulk screen
            else {
              router.push("/dashboard/superAdminDashboard/BulkInviteModal");
            }
          }}
        />

        <ExtraInvitePreviewModal
        visible={showExtraModal}
        onClose={() => setShowExtraModal(false)}
        />


    </View>
  );


}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    padding: 16,
    gap: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inviteType: {
    fontWeight: "600",
    fontSize: 14,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  disabledBadge: {
    backgroundColor: "#F1F5F9",
  },

  statusText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "500",
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },

  avatarStack: {
    flexDirection: "row",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontWeight: "500",
    fontSize: 13,
  },

  extra: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  branch: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },

  /* ===== MENU ===== */

  menuOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  menuCard: {
    width: 340,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  menuText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
});
