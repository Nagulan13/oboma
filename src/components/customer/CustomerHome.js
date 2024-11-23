// CustomerHome.js
import React, { useState, useEffect } from 'react';
import { 
  createBottomTabNavigator 
} from '@react-navigation/bottom-tabs';
import { 
  createStackNavigator 
} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuViewScreen from './MenuViewScreen';
import MyOrderScreen from './MyOrderScreen';
import CartScreen from './CartScreen';
import SettingsScreen from '../shared/SettingsScreen';
import PersonalDetailsScreen from '../shared/PersonalDetailsScreen';
import ChangePasswordScreen from '../shared/ChangePasswordScreen';
import JobVacancyScreen from './JobVacancyScreen';
import { auth, db } from '../../services/firebaseConfig'; // Corrected path for Firebase config
import { signOut } from 'firebase/auth'; // Firebase Auth method
import { doc, deleteDoc } from 'firebase/firestore'; // Firestore methods
import { StripeProvider } from '@stripe/stripe-react-native'; // Import StripeProvider
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomerTabs = () => (
  <Tab.Navigator
    initialRouteName="MenuView"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'JobVacancy':
            iconName = 'briefcase';
            break;
          case 'MenuView':
            iconName = 'bars';
            break;
          case 'MyOrder':
            iconName = 'clipboard';
            break;
          case 'Cart':
            iconName = 'shopping-cart';
            break;
          default:
            iconName = 'circle';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="JobVacancy" component={JobVacancyScreen} options={{ headerShown: false }} />
    <Tab.Screen name="MenuView" component={MenuViewScreen} options={{ headerShown: false }} />
    <Tab.Screen name="MyOrder" component={MyOrderScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
  </Tab.Navigator>
);

const handleSignOut = async () => {
  try {
    const userId = auth.currentUser?.uid;

    if (userId) {
      const cartRef = doc(db, 'carts', userId);
      await deleteDoc(cartRef);
      console.log('Cart deleted from Firestore!');
    }

    await signOut(auth);
    console.log('User signed out successfully!');
  } catch (error) {
    console.error('Error signing out and deleting cart: ', error);
    Alert.alert('Error', 'Failed to sign out.');
  }
};

const CustomerHome = () => {
  const [publishableKey, setPublishableKey] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://192.168.0.142:8080"; // Replace with your actual backend URL
  // Adjust the above URL based on your environment:
  // - Android Emulator: http://10.0.2.2:8080
  // - iOS Simulator: http://localhost:8080 or http://127.0.0.1:8080
  // - Physical Devices: Use your machine's local network IP, e.g., http://192.168.x.x:8080

  // Fetch the publishable key from your backend
  const fetchPublishableKey = async () => {
    try {
      const response = await fetch(`${API_URL}/get-publishable-key`);
      if (!response.ok) {
        throw new Error('Failed to fetch publishable key');
      }
      const data = await response.json();
      setPublishableKey(data.key);
    } catch (error) {
      console.error('Error fetching publishable key:', error);
      Alert.alert('Error', 'Failed to load payment configuration. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading payment configuration...</Text>
      </View>
    );
  }

  if (!publishableKey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load payment configuration.</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <Stack.Navigator>
        <Stack.Screen
          name="CustomerTabs"
          component={CustomerTabs}
          options={({ navigation }) => ({
            headerTitle: 'OTAi Burger',
            headerRight: () => (
              <Icon
                name="user-circle"
                size={30}
                color="#000"
                style={{ marginRight: 25 }}
                onPress={() => navigation.navigate('Settings')}
              />
            ),
          })}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          initialParams={{ handleSignOut }} 
        />
        <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default CustomerHome;
