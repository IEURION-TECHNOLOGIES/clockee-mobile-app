import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type CSVRow = {
  email: string;
  role: string;
};

// ✅ SIMPLE CSV PARSER (NO LIBRARY)
const parseCSV = (text: string): CSVRow[] => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());

    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });

    return {
      email: row.email || "",
      role: row.role || "",
    };
  });
};

export default function BulkInviteModal({ visible, onClose }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (!file.name.toLowerCase().endsWith(".csv")) {
        Alert.alert("Invalid file", "Please upload a CSV file.");
        return;
      }

      if (file.size && file.size > 2 * 1024 * 1024) {
        Alert.alert("File too large", "Max file size is 2MB.");
        return;
      }

      const content = await FileSystem.readAsStringAsync(file.uri);

      // ✅ USE CUSTOM PARSER
      const parsed = parseCSV(content);

      setRows(parsed);
      setFileName(file.name);
      setFileUri(file.uri);
    } catch {
      Alert.alert("Error", "Failed to read CSV file.");
    }
  };

  const handleUpload = async () => {
    if (!fileUri) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName ?? "bulk_invite.csv",
        type: "text/csv",
      } as any);

      // 🔜 Backend API call here

      Alert.alert("Success", "Bulk invite sent successfully.");
      onClose();
    } catch {
      Alert.alert("Upload failed", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN MODAL */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Bulk invite</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.desc}>
              Upload a CSV file with email addresses to invite users in bulk.
            </Text>

            {/* Upload / File Card */}
            {!fileName ? (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handlePickCSV}
              >
                <View style={styles.uploadBtn}>
                  <Ionicons name="cloud-upload-outline" size={16} />
                  <Text style={styles.uploadText}>Upload CSV</Text>
                </View>
                <Text style={styles.maxSize}>Max file size (2MB)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <Ionicons
                    name="document-text"
                    size={22}
                    color="#0284C7"
                  />
                  <View>
                    <Text style={styles.fileName}>{fileName}</Text>
                    <Text style={styles.fileMeta}>
                      {rows.length} users detected
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => setPreviewVisible(true)}>
                  <Ionicons name="ellipsis-horizontal" size={20} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.csv}>
              CSV Format: <Text style={styles.csvHint}>email, role</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!fileUri || loading) && { opacity: 0.5 },
              ]}
              disabled={!fileUri || loading}
              onPress={handleUpload}
            >
              <Text style={styles.submitText}>
                {loading ? "Uploading..." : "Send Invites"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal visible={previewVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                Preview ({rows.length})
              </Text>
              <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                <Ionicons name="close" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {rows.map((row, i) => (
                <View key={i} style={styles.previewRow}>
                  <Text style={styles.email}>{row.email}</Text>
                  <Text style={styles.role}>{row.role}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
  },

  desc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#F5F9FF",
  },

  uploadBtn: {
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  uploadText: {
    fontSize: 13,
    fontWeight: "500",
  },

  maxSize: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 8,
  },

  csv: {
    fontSize: 12,
    marginTop: 14,
    color: "#0F172A",
  },

  csvHint: {
    color: "#0284C7",
  },

  submitBtn: {
    marginTop: 18,
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  fileCard: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#0284C7",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fileInfo: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  fileName: {
    fontSize: 13,
    fontWeight: "500",
  },

  fileMeta: {
    fontSize: 11,
    color: "#64748B",
  },

  previewCard: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  previewRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  email: {
    fontSize: 13,
  },

  role: {
    fontSize: 11,
    color: "#64748B",
  },
});