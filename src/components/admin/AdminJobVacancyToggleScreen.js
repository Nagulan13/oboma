// AdminJobVacancyToggleScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { db } from '../../services/firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const AdminJobVacancyToggleScreen = () => {
  const [jobVacancyOpen, setJobVacancyOpen] = useState(true);

  useEffect(() => {
    // Listen to the Firestore document where we store the toggle
    const docRef = doc(db, 'adminConfig', 'jobVacancySettings');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setJobVacancyOpen(data.jobVacancyOpen);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleChange = async (value) => {
    setJobVacancyOpen(value);
    try {
      // Update Firestore with the new state
      await setDoc(doc(db, 'adminConfig', 'jobVacancySettings'), {
        jobVacancyOpen: value,
      });
    } catch (error) {
      console.error('Error updating jobVacancyOpen: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Vacancy Toggle (Admin)</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Job Vacancy is {jobVacancyOpen ? 'ON' : 'OFF'}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={jobVacancyOpen ? '#f4f3f4' : '#f4f3f4'}
          onValueChange={handleToggleChange}
          value={jobVacancyOpen}
        />
      </View>
      <Text style={styles.info}>
        When OFF, customers will not see the Job Vacancy tab or poster.
      </Text>
    </View>
  );
};

export default AdminJobVacancyToggleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
  info: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
