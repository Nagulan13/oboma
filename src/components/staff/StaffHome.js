import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import OrderScreen from './OrderScreen'; // Correct import path
import SettingsScreen from '../shared/SettingsScreen';
import PersonalDetailsScreen from '../shared/PersonalDetailsScreen';
import ChangePasswordScreen from '../shared/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StaffTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = 'home';
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
    <Tab.Screen name="Home" component={OrderScreen} options={{ headerShown: false }}/>
  </Tab.Navigator>
);

const StaffHome = ({ handleSignOut }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="StaffTabs"
      component={StaffTabs}
      options={({ navigation }) => ({
        headerTitle: 'OTAi Burger',
        headerRight: () => (
          <Icon
            name="user-circle"
            size={30}
            color="#000"
            style={{ marginRight: 25 }}
            onPress={() => navigation.navigate('Settings', { handleSignOut })}
          />
        ),
      })}
    />
    
    <Stack.Screen name="Settings" component={SettingsScreen} initialParams={{ handleSignOut }} />
    <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Stack.Navigator>
);

export default StaffHome;
