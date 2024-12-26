// src/services/NotificationService.js

import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set the notification handler to determine how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the device for push notifications, obtains the Expo push token,
 * and sends it to the backend server.
 * 
 * @param {string} userId - The unique identifier of the user.
 */
export async function registerForPushNotificationsAsync(userId) {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permissions are not granted, request them
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permissions are still not granted, alert the user
    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Enable notifications to receive updates on new orders.');
      return;
    }

    // Get the Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Physical Device Required', 'Push notifications are not supported on emulators/simulators.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (token) {
    try {
      // Send the token to your backend server
      await axios.post('https://your-backend.com/register-push-token', {
        uid: userId, // Replace with actual user ID
        pushToken: token,
      });
      console.log('Push token sent to backend successfully.');
      await AsyncStorage.setItem('pushToken', token);
    } catch (error) {
      console.error('Error sending push token to backend:', error);
      Alert.alert('Error', 'Failed to register for push notifications.');
    }
  }

  return token;
}
