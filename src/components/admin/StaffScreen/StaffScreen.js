import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../../services/firebaseConfig'; // Adjust the import path as necessary
import { collection, getDocs } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const StaffScreen = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staffCollection = collection(db, 'staff');
      const staffSnapshot = await getDocs(staffCollection);
      const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.itemContainer}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => navigation.navigate('StaffDetails', { staffId: item.id })}
      >
        <View style={styles.itemContent}>
          {/* Left Section: Name and Icon */}
          <View style={styles.itemLeft}>
            <Ionicons name="person-circle-outline" size={40} color="#4CAF50" style={styles.icon} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </View>

          {/* Right Section: Status */}
          <View style={styles.itemRight}>
            <Text
              style={[styles.status, item.status === 'active' ? styles.active : styles.inactive]}
            >
              {item.status}
            </Text>
            <Ionicons
              name={item.status === 'active' ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={20}
              color={item.status === 'active' ? '#4CAF50' : '#F44336'}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff List</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text>Loading staff...</Text>
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
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
    borderRadius: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  active: {
    backgroundColor: '#c8e6c9',
    color: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#ffcdd2',
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StaffScreen;
