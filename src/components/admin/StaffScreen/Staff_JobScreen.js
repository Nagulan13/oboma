import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import StaffScreen from './StaffScreen';
import JobVacancyScreen from './JobVacancyScreen';

const Tab = createMaterialTopTabNavigator();

const Staff_JobScreen = () => (
  <Tab.Navigator>
    <Tab.Screen name="StaffTab" component={StaffScreen} options={{ title: 'Staff' }} />
    <Tab.Screen name="JobVacancyTab" component={JobVacancyScreen} options={{ title: 'Job Vacancy' }} />
  </Tab.Navigator>
);

export default Staff_JobScreen;
