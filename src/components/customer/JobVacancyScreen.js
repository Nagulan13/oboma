import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { db, auth } from '../../services/firebaseConfig'; // Ensure you import both db and auth
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';

const JobVacancyScreen = () => {
  const [form, setForm] = useState({
    name: '',
    ic_number: '',
    email: '',
    phone_number: '',
    address: '',
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const user = auth.currentUser; // Get the current authenticated user
    if (user) {
      try {
        await addDoc(collection(db, 'jobvacancy'), {
          ...form,
          customer_id: user.uid, // Add customer ID to the document
          job_status: 'pending',
          receive_date: Timestamp.fromDate(new Date()),
        });
        Alert.alert('Success', 'Your application has been submitted.');
        setForm({
          name: '',
          ic_number: '',
          email: '',
          phone_number: '',
          address: '',
        });
      } catch (error) {
        console.error('Error adding document: ', error);
        Alert.alert('Error', 'There was an error submitting your application.');
      }
    } else {
      Alert.alert('Error', 'User is not authenticated.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInUp" duration={1000} style={styles.formContainer}>
        <Text style={styles.title}>Job Vacancy Application</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={(value) => handleChange('name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="IC Number"
          value={form.ic_number}
          onChangeText={(value) => handleChange('ic_number', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={form.phone_number}
          onChangeText={(value) => handleChange('phone_number', value)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={form.address}
          onChangeText={(value) => handleChange('address', value)}
        />
        <Animatable.View animation="pulse" iterationCount="infinite" direction="alternate">
          <Button title="Submit" onPress={handleSubmit} />
        </Animatable.View>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default JobVacancyScreen;
