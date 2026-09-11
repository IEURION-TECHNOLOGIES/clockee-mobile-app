// components/students/BulkStudentUpload.tsx

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBulkUploadStudents } from "@/hooks/students";

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  text: "#102A43",
  muted: "#64748B",
  border: "#DCEAF2",
};

type SelectedFile = {
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number;
};

export default function BulkStudentUpload() {
  const uploadMutation = useBulkUploadStudents();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(
    null
  );

  const chooseFile = async () => {
    console.log("[BulkStudentUpload] Opening document picker");

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("[BulkStudentUpload] Selection cancelled");
        return;
      }

      const file = result.assets[0];

      console.log("[BulkStudentUpload] Selected:", file);

      if (!file.name.toLowerCase().endsWith(".csv")) {
        Alert.alert(
          "Invalid file",
          "Only CSV files are accepted for bulk student upload."
        );
        return;
      }

      setSelectedFile({
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        size: file.size,
      });
    } catch (error) {
      console.error("[BulkStudentUpload] Picker error:", error);

      Alert.alert(
        "Could not choose file",
        "Please try selecting the CSV file again."
      );
    }
  };

  const upload = async () => {
    if (!selectedFile) {
      Alert.alert("No CSV selected", "Choose a CSV file before uploading.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "file",
      {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "text/csv",
      } as any
    );

    console.log("[BulkStudentUpload] POST /admin/students/bulk:", {
      fileName: selectedFile.name,
      mimeType: selectedFile.mimeType,
      size: selectedFile.size,
    });

    try {
      const response = await uploadMutation.mutateAsync(formData);

      console.log("[BulkStudentUpload] Upload response:", response);

      Alert.alert(
        "Upload successful",
        response?.message ||
          "The student CSV was uploaded successfully."
      );

      setSelectedFile(null);
    } catch (error: any) {
      console.error("[BulkStudentUpload] Upload failed:", error);

      Alert.alert(
        "Upload failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to upload the CSV."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={23}
          color={COLORS.primary}
        />

        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>CSV upload limit</Text>
          <Text style={styles.infoDescription}>
            Maximum 500 records per request.
          </Text>
        </View>
      </View>

      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>CSV header structure</Text>
        <Text style={styles.headerText}>
          name,email,studentId,phone,departmentId,branchId,password,parentName,parentEmail,parentPhone,parentPassword,parent2Name,parent2Email,parent2Phone,parent2Password
        </Text>
      </View>

      <Pressable
        onPress={chooseFile}
        disabled={uploadMutation.isPending}
        style={({ pressed }) => [
          styles.chooseCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.uploadIcon}>
          <Ionicons
            name="cloud-upload-outline"
            size={36}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.chooseTitle}>
          {selectedFile ? selectedFile.name : "Choose CSV file"}
        </Text>

        <Text style={styles.chooseDescription}>
          {selectedFile
            ? "File selected and ready to upload."
            : "Tap to choose a CSV from your device."}
        </Text>
      </Pressable>

      {selectedFile ? (
        <View style={styles.fileCard}>
          <Ionicons
            name="document-text-outline"
            size={23}
            color={COLORS.secondary}
          />

          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {selectedFile.size
                ? `${Math.round(selectedFile.size / 1024)} KB`
                : "Ready"}
            </Text>
          </View>

          <Pressable onPress={() => setSelectedFile(null)}>
            <Ionicons
              name="close-circle-outline"
              size={24}
              color="#DC2626"
            />
          </Pressable>
        </View>
      ) : null}

      <Pressable
        onPress={upload}
        disabled={!selectedFile || uploadMutation.isPending}
        style={[
          styles.uploadButton,
          (!selectedFile || uploadMutation.isPending) && styles.disabled,
        ]}
      >
        {uploadMutation.isPending ? (
          <>
            <ActivityIndicator color={COLORS.white} />
            <Text style={styles.uploadText}>Uploading...</Text>
          </>
        ) : (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={21}
              color={COLORS.white}
            />
            <Text style={styles.uploadText}>Upload student CSV</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  infoCard: {
    flexDirection: "row",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#BCE9FA",
    backgroundColor: "#E9F7FD",
    padding: 15,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  infoDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFDFF",
    padding: 14,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  headerText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  chooseCard: {
    minHeight: 210,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.secondary,
    backgroundColor: "#FAFDFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  uploadIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F7FD",
  },
  chooseTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },
  chooseDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 13,
  },
  fileInfo: {
    flex: 1,
    marginHorizontal: 9,
  },
  fileName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  fileSize: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  uploadButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  uploadText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});
