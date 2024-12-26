// src/components/customer/CustomerHome.js

import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuViewScreen from './MenuViewScreen';
import MyOrderScreen from './MyOrderScreen';
import OrderDetailsScreen from './OrderDetailsScreen';
import CartScreen from './CartScreen';
import JobVacancyScreen from './JobVacancyScreen'; // This is the CUSTOMER "job vacancy" form screen
import InvoiceScreen from './InvoiceScreen';
import CheckoutScreen from './CheckoutScreen';
import FeedbackScreen from './FeedbackScreen';
import InboxScreen from './InboxScreen';
import InvoiceDetailsScreen from './InvoiceDetailsScreen';
import SettingsScreen from './SettingsScreen';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import UpdatePersonalDetailsScreen from './UpdatePersonalDetailsScreen';
import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';

// Initialize Navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tab Navigator
const CustomerTabs = ({ jobVacancyOpen }) => (
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
      headerShown: false,
    })}
  >
    {/* Conditionally show the JobVacancy tab */}
    {jobVacancyOpen && (
      <Tab.Screen name="JobVacancy" component={JobVacancyScreen} />
    )}
    <Tab.Screen name="MenuView" component={MenuViewScreen} />
    <Tab.Screen name="MyOrder" component={MyOrderScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
  </Tab.Navigator>
);

// Handle Sign Out
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
    Alert.alert('Signed Out', 'You have been successfully signed out.');
  } catch (error) {
    console.error('Error signing out and deleting cart: ', error);
    Alert.alert('Error', 'Failed to sign out.');
  }
};

const CustomerHome = () => {
  const [publishableKey, setPublishableKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // jobVacancyOpen from Firestore
  const [jobVacancyOpen, setJobVacancyOpen] = useState(true);

  useEffect(() => {
    // 1) Fetch Stripe key
    const fetchPublishableKey = async () => {
      try {
        const response = await fetch('http://192.168.134.232:8082/get-publishable-key');
        const data = await response.json();
        setPublishableKey(data.key);
      } catch (error) {
        console.error('Error fetching publishable key:', error);
        Alert.alert('Error', 'Failed to load payment configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublishableKey();

    // 2) Listen to "jobVacancyOpen"
    const docRef = doc(db, 'adminConfig', 'jobVacancySettings');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setJobVacancyOpen(snapshot.data().jobVacancyOpen);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!publishableKey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading payment configuration.</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <Stack.Navigator>
        {/* Main Tabs */}
        <Stack.Screen
          name="CustomerTabs"
          // Pass jobVacancyOpen to the tab navigator
          children={() => <CustomerTabs jobVacancyOpen={jobVacancyOpen} />}
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

        {/* Settings */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerTitle: 'Settings',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
          initialParams={{ handleSignOut }}
        />
        <Stack.Screen
          name="PersonalDetails"
          component={PersonalDetailsScreen}
          options={{ headerTitle: 'Personal Details' }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ headerTitle: 'Change Password' }}
        />
        <Stack.Screen
          name="UpdatePersonalDetails"
          component={UpdatePersonalDetailsScreen}
          options={{ headerTitle: 'Update Personal Details' }}
        />

        {/* Additional Screens */}
        <Stack.Screen
          name="InvoiceScreen"
          component={InvoiceScreen}
          options={{ title: 'Invoice' }}
        />
        <Stack.Screen
          name="CheckoutScreen"
          component={CheckoutScreen}
          options={{ title: 'Checkout' }}
        />

        {/* Order Details */}
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ title: 'Order Details' }}
        />

        <Stack.Screen
          name="FeedbackScreen"
          component={FeedbackScreen}
          options={{ title: 'Feedback' }}
        />

        <Stack.Screen
          name="InboxScreen"
          component={InboxScreen}
          options={{ title: 'Inbox' }}
        />

        <Stack.Screen
          name="InvoiceDetails"
          component={InvoiceDetailsScreen}
          options={{ title: 'Invoice Details' }}
        />
      </Stack.Navigator>
    </StripeProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default CustomerHome;
