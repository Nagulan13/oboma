import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const JobVacancyScreen = () => {
  const [applications, setApplications] = useState([]);
  const [jobVacancyOpen, setJobVacancyOpen] = useState(true);

  const navigation = useNavigation();

  // ---------------------------
  // Listen to jobVacancyOpen from Firestore
  // ---------------------------
  useEffect(() => {
    const settingsRef = doc(db, 'adminConfig', 'jobVacancySettings');
    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.jobVacancyOpen !== undefined) {
          setJobVacancyOpen(data.jobVacancyOpen);
        }
      }
    });
    return () => unsubscribeSettings();
  }, []);

  // Handle Toggle
  const handleToggleChange = async (value) => {
    setJobVacancyOpen(value);
    try {
      // Update in Firestore so the customer app knows whether job applications are open or closed
      await setDoc(doc(db, 'adminConfig', 'jobVacancySettings'), {
        jobVacancyOpen: value,
      });
    } catch (error) {
      console.error('Error updating jobVacancyOpen: ', error);
    }
  };

  // ---------------------------
  // Listen to "jobvacancy" Collection (Applications)
  // ---------------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jobvacancy'), (snapshot) => {
      const applicationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(applicationsList);
    });

    return () => unsubscribe();
  }, []);

  // Sort applications: "pending" first, then by date in descending order
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.job_status === 'pending' && b.job_status !== 'pending') return -1;
    if (a.job_status !== 'pending' && b.job_status === 'pending') return 1;

    const dateA = new Date(a.created_at || a.timestamp || 0);
    const dateB = new Date(b.created_at || b.timestamp || 0);
    return dateB - dateA; // Descending order
  });

  // ---------------------------
  // Render Each Item
  // ---------------------------
  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.itemContainer}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('JobVacancyDetails', { applicationId: item.id })}
        style={styles.touchable}
      >
        <View style={styles.itemContent}>
          {/* Left Side: Index, Name, Date */}
          <View style={styles.itemLeft}>
            <Text style={styles.indexText}>{index + 1}.</Text>
            <View>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.dateText}>
                {moment(item.created_at || item.timestamp).format('MMM D, YYYY')}
              </Text>
            </View>
            {item.job_status === 'pending' && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          {/* Right Side: Status Icon & Text */}
          <View style={styles.statusContainer}>
            {item.job_status === 'pending' ? (
              <Ionicons name="time-outline" size={20} color="#f57c00" style={styles.statusIcon} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#388e3c"
                style={styles.statusIcon}
              />
            )}
            <Text
              style={[
                styles.statusText,
                item.job_status === 'pending' ? styles.pending : styles.completed,
              ]}
            >
              {item.job_status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  // ---------------------------
  // Main Return
  // ---------------------------
  return (
    <View style={styles.container}>
      {/* Toggle Section */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          Accepting New Applications: {jobVacancyOpen ? 'ON' : 'OFF'}
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor="#f4f3f4"
          onValueChange={handleToggleChange}
          value={jobVacancyOpen}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Job Applications</Text>

      {/* Applications List */}
      <FlatList
        data={sortedApplications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default JobVacancyScreen;

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f4f4f4',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    borderRadius: 12,
    marginVertical: 6,
    overflow: 'hidden',
  },
  touchable: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#555',
  },
  nameText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: '#ffe0b2',
    marginLeft: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#ff9800',
    fontWeight: '700',
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 14,
  },
  pending: {
    color: '#f57c00',
  },
  completed: {
    color: '#388e3c',
  },
});
