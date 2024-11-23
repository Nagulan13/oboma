import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../../services/firebaseConfig'; // Adjust the import path as necessary
import { collection, getDocs } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';

const StaffScreen = () => {
  const [staff, setStaff] = useState([]);
  const navigation = useNavigation();

  const fetchStaff = async () => {
    const staffCollection = collection(db, 'staff');
    const staffSnapshot = await getDocs(staffCollection);
    const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStaff(staffList);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} style={styles.itemContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('StaffDetails', { staffId: item.id })}>
        <View style={styles.item}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.status, item.status === 'active' ? styles.active : styles.inactive]}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff List</Text>
      <FlatList
        data={staff}
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
  name: {
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
  active: {
    backgroundColor: '#c8e6c9',
    color: '#4caf50',
  },
  inactive: {
    backgroundColor: '#ffcdd2',
    color: '#f44336',
  },
});

export default StaffScreen;
