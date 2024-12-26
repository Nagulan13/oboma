import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as Animatable from 'react-native-animatable';

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const sendEmailToStaff = (email, password) => {
  fetch('http://192.168.134.232:8081/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Your Staff Account Credentials',
      text: `Welcome! Your account has been created. Your temporary password is: ${password}`,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.log('Error sending email');
      }
    })
    .catch((error) => {
      console.log('Error sending email:', error);
    });
};

const StaffDetails = () => {
  const route = useRoute();
  const { staffId } = route.params;
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const staffDoc = doc(db, 'staff', staffId);
        const staffSnap = await getDoc(staffDoc);
        if (staffSnap.exists()) {
          setStaffDetails(staffSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching staff details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [staffId]);

  const handleGenerateAccount = async () => {
    if (!staffDetails || !staffDetails.email) {
      Alert.alert('Error', 'No email address found for this staff member.');
      return;
    }

    try {
      const tempPassword = generatePassword();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffDetails.email,
        tempPassword
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'staff', user.uid), {
        ...staffDetails,
        status: 'active',
        uid: user.uid,
      });

      await deleteDoc(doc(db, 'staff', staffId));

      sendEmailToStaff(staffDetails.email, tempPassword);

      Alert.alert('Success', 'Account created, and email sent successfully.');
      setStaffDetails((prevDetails) => ({ ...prevDetails, uid: user.uid, status: 'active' }));
    } catch (error) {
      console.error('Error generating account:', error.message);
      Alert.alert('Error', 'There was an error generating the account.');
    }
  };

  const handleTerminateStaff = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for termination.');
      return;
    }

    try {
      const staffDoc = doc(db, 'staff', staffId);
      await updateDoc(staffDoc, { status: 'terminated', termination_reason: reason });

      Alert.alert('Success', 'Staff member terminated successfully.');
      setStaffDetails((prevDetails) => ({ ...prevDetails, status: 'terminated' }));
    } catch (error) {
      console.error('Error terminating staff:', error.message);
      Alert.alert('Error', 'There was an error terminating the staff member.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading staff details...</Text>
      </View>
    );
  }

  const isTerminated = staffDetails.status === 'terminated';

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      style={[styles.container, isTerminated && styles.terminatedContainer]}
    >
      <Text style={styles.title}>{staffDetails.name}</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{staffDetails.email}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{staffDetails.phone_number}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{staffDetails.address}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, styles[staffDetails.status]]}>{staffDetails.status}</Text>
      </View>
      {isTerminated && staffDetails.termination_reason && (
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Termination Reason:</Text>
          <Text style={styles.value}>{staffDetails.termination_reason}</Text>
        </View>
      )}
      {!isTerminated && (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleGenerateAccount}>
              <Text style={styles.buttonText}>Generate Account</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter termination reason"
              value={reason}
              onChangeText={setReason}
            />
            <TouchableOpacity
              style={[styles.button, styles.terminateButton]}
              onPress={handleTerminateStaff}
            >
              <Text style={styles.buttonText}>Terminate Staff</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  terminatedContainer: {
    backgroundColor: '#ffe6e6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  detailContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  active: {
    color: '#4CAF50',
  },
  terminated: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  terminateButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StaffDetails;
