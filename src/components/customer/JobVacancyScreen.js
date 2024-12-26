// JobVacancyScreen.js (Customer side)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { db, auth } from '../../services/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const JobVacancyScreen = () => {
  const [form, setForm] = useState({
    name: '',
    ic_number: '',
    email: '',
    phone_number: '',
    address: '',
  });

  // Handle text input changes
  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  // Validation function
  const validateFields = () => {
    // Check if any field is empty
    if (
      !form.name.trim() ||
      !form.ic_number.trim() ||
      !form.email.trim() ||
      !form.phone_number.trim() ||
      !form.address.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return false;
    }

    // Validate IC number (12 digits, no symbols)
    const icRegex = /^\d{12}$/;
    if (!icRegex.test(form.ic_number)) {
      Alert.alert('Error', 'Invalid IC number. Please enter 12 digits without symbols.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Error', 'Invalid email format. Please enter a valid email address.');
      return false;
    }

    // Validate phone number (10 or 11 digits)
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(form.phone_number)) {
      Alert.alert('Error', 'Invalid phone number. Please enter 10 or 11 digits.');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, 'jobvacancy'), {
          ...form,
          customer_id: user.uid,
          job_status: 'pending',
          receive_date: Timestamp.fromDate(new Date()),
        });
        Alert.alert('Success', 'Your application has been submitted.');
        // Reset the form
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

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
            />
          </View>
        </View>

        {/* IC Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>IC Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your IC number"
              value={form.ic_number}
              onChangeText={(value) => handleChange('ic_number', value)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={form.phone_number}
              onChangeText={(value) => handleChange('phone_number', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your address"
              value={form.address}
              onChangeText={(value) => handleChange('address', value)}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Animatable.View animation="pulse" iterationCount="infinite" direction="alternate">
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Application</Text>
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>
    </ScrollView>
  );
};

export default JobVacancyScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f4f7',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
