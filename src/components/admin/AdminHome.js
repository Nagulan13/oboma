import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './HomeScreen/HomeScreen';
import ItemScreen from './ItemScreen/ItemScreen';
import UpdateItemScreen from './ItemScreen/UpdateItemScreen';
import AddItemScreen from './ItemScreen/AddItemScreen';
import Staff_JobScreen from './StaffScreen/Staff_JobScreen';
import AdminFeedbackScreen from './FeedbackScreen/AdminFeedbackScreen';
import ReportScreen from './ReportScreen/ReportScreen';
import SettingsScreen from './SettingsScreen';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import UpdatePersonalDetailsScreen from './UpdatePersonalDetailsScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import StaffDetails from './StaffScreen/StaffDetails';
import JobVacancyDetails from './StaffScreen/JobVacancyDetails';
import AdminJobVacancyToggleScreen from './AdminJobVacancyToggleScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case 'AdminHomeScreen':
            iconName = 'home';
            break;
          case 'Item':
            iconName = 'archive';
            break;
          case 'StaffManagement':
            iconName = 'users';
            break;
          case 'Feedback':
            iconName = 'comments';
            break;
          case 'Report':
            iconName = 'file-text';
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
    <Tab.Screen
      name="AdminHomeScreen"
      component={HomeScreen}
      options={{ headerShown: false, tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="Item"
      component={ItemScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="StaffManagement"
      component={Staff_JobScreen}
      options={{ headerShown: false, tabBarLabel: 'Staff' }}
    />
    <Tab.Screen
      name="Feedback"
      component={AdminFeedbackScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Report"
      component={ReportScreen}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const AdminHome = ({ handleSignOut }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminTabs"
      component={AdminTabs}
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
                handleSignOut,
              })
            }
          />
        ),
      })}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      initialParams={{ handleSignOut }}
    />
    <Stack.Screen
      name="PersonalDetails"
      component={PersonalDetailsScreen}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
    />
    <Stack.Screen
      name="ItemScreen"
      component={ItemScreen}
    />
    <Stack.Screen
      name="AddItemScreen"
      component={AddItemScreen}
    />
    <Stack.Screen
      name="UpdateItemScreen"
      component={UpdateItemScreen}
    />
    <Stack.Screen
      name="StaffDetails"
      component={StaffDetails}
    />
    <Stack.Screen
      name="JobVacancyDetails"
      component={JobVacancyDetails}
    />
    <Stack.Screen
      name="UpdatePersonalDetails"
      component={UpdatePersonalDetailsScreen}
    />
    <Stack.Screen
      name="AdminJobVacancyToggle"
      component={AdminJobVacancyToggleScreen}
    />

  </Stack.Navigator>
);

export default AdminHome;
