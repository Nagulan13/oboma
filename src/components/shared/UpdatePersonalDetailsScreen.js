import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { validateEmail, validatePhoneNumber, validateName } from '../../utils/validations';
import { fetchUserType, fetchUserDetails, createUserProfile, uploadProfilePicture } from '../../services/firestoreService';
import { auth } from '../../services/firebaseConfig';

const UpdatePersonalDetailsScreen = ({ route, navigation }) => {
  const { userDetails, userType } = route.params;

  const [name, setName] = useState(userDetails.name);
  const [email, setEmail] = useState(userDetails.email);
  const [phoneNumber, setPhoneNumber] = useState(userDetails.phone_number);
  const [profilePicture, setProfilePicture] = useState(userDetails.imageUrl || '');

  const handleSave = async () => {
    if (!validateName(name) || !validateEmail(email) || !validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid input', 'Please enter valid information for all fields.');
      return;
    }

    try {
      const profileData = { name, email, phone_number: phoneNumber, imageUrl: profilePicture };
      await createUserProfile(auth.currentUser.uid, profileData, userType);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    }
  };

  const selectProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const uri = result.assets[0].uri;
      try {
        const downloadUrl = await uploadProfilePicture(uri, auth.currentUser.uid);
        setProfilePicture(downloadUrl);
      } catch (error) {
        Alert.alert('Error', `Failed to upload profile picture: ${error.message}`);
      }
    }
  };

  const renderEditableField = (label, value, setValue, field, iconName) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.detailContainer}>
        <Icon name={iconName} size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={selectProfilePicture}>
          <Image source={profilePicture ? { uri: profilePicture } : require('../../../assets/image/default_profile_image.png')} style={styles.profilePicture} />
          <View style={styles.editIconContainer}>
            <Icon name="edit" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      {renderEditableField('Name', name, setName, 'name', 'person')}
      {renderEditableField('Email', email, setEmail, 'email', 'email')}
      {renderEditableField('Phone Number', phoneNumber, setPhoneNumber, 'phone_number', 'phone')}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 5,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    color: '#495057',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    paddingHorizontal: 5,
    fontSize: 16,
    color: '#343a40',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default UpdatePersonalDetailsScreen;
