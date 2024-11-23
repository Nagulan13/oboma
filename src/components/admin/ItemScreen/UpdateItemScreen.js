import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, storage } from '../../../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const UpdateItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};
  const [editedItem, setEditedItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
  });

  useEffect(() => {
    if (item) {
      setEditedItem({
        ...item,
        price: item.price.toString(),  // Ensure price is a string for TextInput
      });
    }
  }, [item]);

  const handleSubmit = async () => {
    try {
      const price = parseFloat(editedItem.price);
      const itemToUpdate = { ...editedItem, price };

      // Upload image to Firebase Storage if it's a new image
      if (editedItem.image_url && editedItem.image_url !== item.image_url) {
        const imageUrl = await uploadImageToStorage(editedItem.image_url);
        itemToUpdate.image_url = imageUrl;
      }

      const itemDocRef = doc(db, 'menu', editedItem.id);
      await updateDoc(itemDocRef, itemToUpdate);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating document: ", error);
      Alert.alert('Error', 'Failed to update the item. Please try again.');
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

      if (!pickerResult.cancelled) {
        const uri = pickerResult.assets[0].uri;
        console.log("Image URI:", uri);
        setEditedItem({ ...editedItem, image_url: uri });
      } else {
        console.log("Image picker cancelled or no URI returned");
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
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      console.error("Upload to storage error: ", error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={editedItem.name}
        onChangeText={(text) => setEditedItem({ ...editedItem, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={editedItem.description}
        onChangeText={(text) => setEditedItem({ ...editedItem, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={editedItem.price}
        onChangeText={(text) => setEditedItem({ ...editedItem, price: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={editedItem.category}
        onChangeText={(text) => setEditedItem({ ...editedItem, category: text })}
      />
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text style={styles.imagePickerText}>Pick an Image</Text>
      </TouchableOpacity>
      {editedItem.image_url ? (
        <Image source={{ uri: editedItem.image_url }} style={styles.image} />
      ) : null}
      <Button title='Update Item' onPress={handleSubmit} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
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
    marginBottom: 10,
    borderRadius: 10,
  },
});

export default UpdateItemScreen;
