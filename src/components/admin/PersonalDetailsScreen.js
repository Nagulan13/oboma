import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchUserType, fetchUserDetails } from '../../services/firestoreService';
import { auth } from '../../services/firebaseConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PersonalDetailsScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [userType, setUserType] = useState(''); // to store the user type
  const [fadeAnim] = useState(new Animated.Value(0));

  const getUserDetails = async () => {
    try {
      const uid = auth.currentUser.uid;
      console.log('User ID:', uid); // Debug log

      const type = await fetchUserType(uid);
      console.log('User Type:', type); // Debug log

      setUserType(type);
      const userDetails = await fetchUserDetails(uid, type);
      console.log('User Details:', userDetails); // Debug log

      setName(userDetails.name);
      setEmail(userDetails.email);
      setPhoneNumber(userDetails.phone_number);
      setProfilePicture(userDetails.imageUrl || '');
    } catch (error) {
      Alert.alert('Error', `Failed to fetch user details: ${error.message}`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserDetails();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEdit = () => {
    navigation.navigate('UpdatePersonalDetails', {
      userDetails: { name, email, phone_number: phoneNumber, imageUrl: profilePicture },
      userType
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.profilePictureContainer}>
        <Image source={profilePicture ? { uri: profilePicture } : require('../../../assets/image/default_profile_image.png')} style={styles.profilePicture} />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.detailContainer}>
          <Icon name="person" size={24} style={styles.icon} />
          <Text style={styles.detail}>{name}</Text>
        </View>
        <View style={styles.separator} />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.detailContainer}>
          <Icon name="email" size={24} style={styles.icon} />
          <Text style={styles.detail}>{email}</Text>
        </View>
        <View style={styles.separator} />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.detailContainer}>
          <Icon name="phone" size={24} style={styles.icon} />
          <Text style={styles.detail}>{phoneNumber}</Text>
        </View>
        <View style={styles.separator} />
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#343a40',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#ccc',
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
  detail: {
    fontSize: 16,
    color: '#343a40',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginTop: 5,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default PersonalDetailsScreen;
