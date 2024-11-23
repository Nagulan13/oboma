import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, storage } from '../../../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const AddItemScreen = () => {
  const navigation = useNavigation();
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    status: 'available',
    category: '',
    image_url: '',
  });

  const handleSubmit = async () => {
    try {
      const price = parseFloat(newItem.price);
      const itemToAdd = { ...newItem, price };

      // Upload image to Firebase Storage
      if (newItem.image_url) {
        const imageUrl = await uploadImageToStorage(newItem.image_url);
        itemToAdd.image_url = imageUrl;
      }

      await addDoc(collection(db, 'menu'), itemToAdd);
      Alert.alert('Success', 'Item added successfully.');
      navigation.goBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Failed to add the item. Please try again.');
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Please allow access to your photos to upload an image.');
        return;
      }

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Picker Result:", pickerResult);

      if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        console.log("Image URI:", uri);
        setNewItem({ ...newItem, image_url: uri });
      } else {
        console.log("Image picker cancelled or no URI returned");
        Alert.alert('Error', 'No image selected or operation cancelled.');
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const uploadImageToStorage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error("Upload error: ", error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
              Alert.alert('Success', 'Image uploaded successfully.');
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      console.error("Upload to storage error: ", error);
      Alert.alert('Error', 'Failed to upload image to storage. Please try again.');
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Item</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text style={styles.imagePickerText}>Pick an Image</Text>
      </TouchableOpacity>
      {newItem.image_url ? (
        <Image source={{ uri: newItem.image_url }} style={styles.image} />
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={newItem.name}
        onChangeText={(text) => setNewItem({ ...newItem, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newItem.description}
        onChangeText={(text) => setNewItem({ ...newItem, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={newItem.price}
        onChangeText={(text) => setNewItem({ ...newItem, price: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={newItem.category}
        onChangeText={(text) => setNewItem({ ...newItem, category: text })}
      />
      <Button title='Add Item' onPress={handleSubmit} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default AddItemScreen;
