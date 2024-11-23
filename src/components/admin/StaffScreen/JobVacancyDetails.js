import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig'; // Adjust the import path as necessary
import * as Animatable from 'react-native-animatable';

const JobVacancyDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { applicationId } = route.params;
  const [applicationDetails, setApplicationDetails] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      const applicationDoc = doc(db, 'jobvacancy', applicationId);
      const applicationSnap = await getDoc(applicationDoc);
      if (applicationSnap.exists()) {
        setApplicationDetails(applicationSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchApplicationDetails();
  }, [applicationId]);

  const handleApprove = async () => {
    try {
      await addDoc(collection(db, 'staff'), {
        name: applicationDetails.name,
        email: applicationDetails.email,
        phone_number: applicationDetails.phone_number,
        address: applicationDetails.address,
        status: 'active',
      });
      await updateDoc(doc(db, 'jobvacancy', applicationId), {
        job_status: 'approved',
      });
      Alert.alert('Success', 'Application approved and staff added.');
      navigation.goBack();
    } catch (error) {
      console.error('Error approving application:', error.message);
      Alert.alert('Error', 'There was an error approving the application.');
    }
  };

  const handleReject = async () => {
    try {
      await updateDoc(doc(db, 'jobvacancy', applicationId), {
        job_status: 'rejected',
      });
      Alert.alert('Success', 'Application rejected.');
      navigation.goBack();
    } catch (error) {
      console.error('Error rejecting application:', error.message);
      Alert.alert('Error', 'There was an error rejecting the application.');
    }
  };

  if (!applicationDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeInUp" duration={800} style={styles.container}>
      <Animatable.Text animation="fadeInDown" duration={800} style={styles.title}>
        {applicationDetails.name}
      </Animatable.Text>
      <Animatable.View animation="fadeInLeft" delay={200} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{applicationDetails.email}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={400} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.text}>{applicationDetails.phone_number}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={600} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.text}>{applicationDetails.address}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInLeft" delay={800} duration={800} style={styles.detailContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.text}>{applicationDetails.job_status}</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" delay={1000} duration={800} style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Approve" onPress={handleApprove} color="#4CAF50" />
        </View>
        <View style={styles.button}>
          <Button title="Reject" onPress={handleReject} color="#F44336" />
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

export default JobVacancyDetails;
