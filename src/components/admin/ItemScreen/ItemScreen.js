import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Switch } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../../services/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';

const ItemScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menu'));
      const itemsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'menu', itemId));
      fetchItems();  // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting item: ", error);
      Alert.alert('Error', 'Failed to delete the item. Please try again.');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'available' ? 'unavailable' : 'available';
      await updateDoc(doc(db, 'menu', item.id), { status: newStatus });
      fetchItems();  // Refresh the list after updating status
    } catch (error) {
      console.error("Error updating item status: ", error);
      Alert.alert('Error', 'Failed to update the item status. Please try again.');
    }
  };

  const confirmDelete = (itemId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => handleDelete(itemId),
          style: "destructive"
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const renderItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" style={styles.itemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>RM {item.price}</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Switch
          value={item.status === 'available'}
          onValueChange={() => handleToggleStatus(item)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateItemScreen', { item })}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Animatable.Text animation="fadeInDown" style={styles.screenTitle}>Menu Item List</Animatable.Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddItemScreen')}>
        <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.addButtonText}>Add Item</Animatable.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 16,
    color: 'green',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 50,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemScreen;
