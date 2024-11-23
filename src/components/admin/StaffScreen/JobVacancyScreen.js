import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig'; // Adjust the import path as necessary
import * as Animatable from 'react-native-animatable';

const JobVacancyScreen = () => {
  const [applications, setApplications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jobvacancy'), (snapshot) => {
      const applicationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} style={styles.itemContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('JobVacancyDetails', { applicationId: item.id })}>
        <View style={styles.item}>
          <Text style={styles.text}>{index + 1}. {item.name}</Text>
          <Text style={[styles.status, item.job_status === 'pending' ? styles.pending : styles.completed]}>
            {item.job_status}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Applications</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
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
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 5,
    textTransform: 'capitalize',
  },
  pending: {
    backgroundColor: '#ffe0b2',
    color: '#ff9800',
  },
  completed: {
    backgroundColor: '#c8e6c9',
    color: '#4caf50',
  },
});

export default JobVacancyScreen;
