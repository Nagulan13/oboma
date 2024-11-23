import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig'; // Adjust the import path as necessary
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
  fetch('http://localhost:3002/send-email', { // Replace with your local IP address
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: email,
      subject: 'Your Staff Account Credentials',
      text: `Welcome! Your account has been created. Your temporary password is: ${password}`,
    }),
  })
    .then(response => {
      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.log('Error sending email');
      }
    })
    .catch(error => {
      console.log('Error sending email:', error);
    });
};

const StaffDetails = () => {
  const route = useRoute();
  const { staffId } = route.params;
  const [staffDetails, setStaffDetails] = useState(null);

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
      // Generate a temporary password
      const tempPassword = generatePassword();

      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, staffDetails.email, tempPassword);
      const user = userCredential.user;

      // Create new staff document with the new UID and details from the current staff document
      await setDoc(doc(db, 'staff', user.uid), {
        name: staffDetails.name,
        email: staffDetails.email,
        phone_number: staffDetails.phone_number,
        address: staffDetails.address,
        status: 'active',
        uid: user.uid,
      });

      // Delete the old staff document to avoid duplication
      await deleteDoc(doc(db, 'staff', staffId));

      // Send an email with the generated password
      sendEmailToStaff(staffDetails.email, tempPassword);
      

      Alert.alert('Success', 'Account created, and email sent successfully.');

      // Update the staff details to reflect the new UID without navigating away
      setStaffDetails((prevDetails) => ({
        ...prevDetails,
        uid: user.uid,
        status: 'active'
      }));

    } catch (error) {
      console.error('Error generating account:', error.message);
      Alert.alert('Error', 'There was an error generating the account.');
    }
  };

  const handleTerminateStaff = async () => {
    try {
      const staffDoc = doc(db, 'staff', staffId);
      await updateDoc(staffDoc, { status: 'terminated' });
      Alert.alert('Success', 'Staff member terminated successfully.');
      
      // Update the staff details to reflect the new status without navigating away
      setStaffDetails((prevDetails) => ({
        ...prevDetails,
        status: 'terminated'
      }));

    } catch (error) {
      console.error('Error terminating staff:', error.message);
      Alert.alert('Error', 'There was an error terminating the staff member.');
    }
  };

  if (!staffDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeInUp" duration={800} style={styles.container}>
      <Animatable.Text animation="fadeInDown" duration={800} style={styles.title}>
        {staffDetails.name}
      </Animatable.Text>
      <Animatable.View animation="fadeInLeft" delay={200} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{staffDetails.email}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={400} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.text}>{staffDetails.phone_number}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={600} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.text}>{staffDetails.address}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={800} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.text}>{staffDetails.status}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" delay={1000} duration={800} style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Generate Account" onPress={handleGenerateAccount} color="#4CAF50" />
        </View>
        <View style={styles.button}>
          <Button title="Terminate Staff" onPress={handleTerminateStaff} color="#F44336" />
        </View>
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
    color: '#333',
  },
  detailContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    marginBottom: 10,
  },
});

export default StaffDetails;
