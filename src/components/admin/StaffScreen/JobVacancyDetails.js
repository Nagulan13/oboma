import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";

const BACKEND_URL = "http://192.168.134.232:8082";

const JobVacancyDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { applicationId } = route.params;

  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const applicationDoc = doc(db, "jobvacancy", applicationId);
        const applicationSnap = await getDoc(applicationDoc);
        if (applicationSnap.exists()) {
          const data = applicationSnap.data();
          setApplicationDetails(data);
          setRemarks(data.remarks || ""); // Pre-fill remarks if already available
          setIsActionCompleted(data.job_status === "approved" || data.job_status === "rejected");
        } else {
          Alert.alert("Error", "No application found.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching application details:", error.message);
        Alert.alert("Error", "Failed to fetch application details.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, navigation]);

  const saveToStaffCollection = async () => {
    try {
      const appointedDate = new Date().toISOString();
      await addDoc(collection(db, "staff"), {
        name: applicationDetails.name,
        email: applicationDetails.email,
        phone_number: applicationDetails.phone_number,
        address: applicationDetails.address,
        remarks,
        status: "active",
        appointed_date: appointedDate, // Store the appointed date
      });
      console.log("Saved to staff collection successfully");
    } catch (error) {
      console.error("Error saving to staff collection:", error.message);
      throw error;
    }
  };

  const handleAction = async (action) => {
    if (!remarks.trim()) {
      Alert.alert("Remarks Required", "Please provide remarks before proceeding.");
      return;
    }

    setActionLoading(true);
    try {
      const updatedStatus = action === "approve" ? "approved" : "rejected";

      if (action === "approve") {
        await saveToStaffCollection(); // Save details to the `staff` collection
      }

      await updateDoc(doc(db, "jobvacancy", applicationId), {
        job_status: updatedStatus,
        remarks,
      });

      const endpoint = action === "approve" ? "send-approval-email" : "send-rejection-email";
      await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: applicationDetails.email,
          name: applicationDetails.name,
        }),
      });

      Alert.alert("Success", `Application ${updatedStatus} and email sent.`);
      setIsActionCompleted(true);
    } catch (error) {
      Alert.alert("Error", `Failed to ${action} the application.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading application details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Application</Text>
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{applicationDetails.name}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{applicationDetails.email}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{applicationDetails.phone_number}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{applicationDetails.address}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, isActionCompleted ? styles.completed : styles.pending]}>
            {applicationDetails.job_status || "Pending"}
          </Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.input, isActionCompleted && styles.readOnlyInput]}
            placeholder="Enter remarks"
            value={remarks}
            onChangeText={setRemarks}
            editable={!isActionCompleted}
            multiline
          />
        </View>
      </View>
      {!isActionCompleted && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => handleAction("approve")}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleAction("reject")}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  completed: {
    color: "#4CAF50",
  },
  pending: {
    color: "#F57C00",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default JobVacancyDetails;
