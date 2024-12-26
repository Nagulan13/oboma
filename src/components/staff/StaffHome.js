import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig'; // Adjust path as necessary
import StaffOrderScreen from './StaffOrderScreen'; // Correct import path
import StaffOrderDetailsScreen from './StaffOrderDetailsScreen'; // Correct import path
import OrderFilterScreen from './OrderFilterScreen'; // Import the filter screen
import SearchedOrderDetailsScreen from './SearchedOrderDetailsScreen'; // Import the SearchedOrderDetails screen
import SettingsScreen from './SettingsScreen';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import UpdatePersonalDetailsScreen from './UpdatePersonalDetailsScreen';

const Stack = createNativeStackNavigator();

const StaffHome = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Signed Out', 'You have been successfully signed out.');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (
    <Stack.Navigator>
      {/* Main Order Screen */}
      <Stack.Screen
        name="StaffOrders"
        component={StaffOrderScreen}
        options={({ navigation }) => ({
          headerTitle: 'OTAi Burger',
          headerRight: () => (
            <Icon
              name="user-circle"
              size={30}
              color="#000"
              style={{ marginRight: 25 }}
              onPress={() =>
                navigation.navigate('Settings', {
                  handleSignOut: () => handleSignOut(navigation),
                })
              }
            />
          ),
        })}
      />

      {/* Order Details */}
      <Stack.Screen
        name="OrderDetails"
        component={StaffOrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />

      {/* Order Filter */}
      <Stack.Screen
        name="OrderFilter"
        component={OrderFilterScreen}
        options={{ headerTitle: 'Search Orders' }}
      />

      {/* Searched Order Details */}
      <Stack.Screen
        name="SearchedOrderDetails"
        component={SearchedOrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
        initialParams={{ handleSignOut }}
      />

      {/* Personal Details */}
      <Stack.Screen
        name="PersonalDetails"
        component={PersonalDetailsScreen}
        options={{ title: 'Personal Details' }}
      />

      {/* Update Personal Details */}
      <Stack.Screen
        name="UpdatePersonalDetails"
        component={UpdatePersonalDetailsScreen}
        options={{ title: 'Update Personal Details' }}
      />

      {/* Change Password */}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </Stack.Navigator>
  );
};

export default StaffHome;
