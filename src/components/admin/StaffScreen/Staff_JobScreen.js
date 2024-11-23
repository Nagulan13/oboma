import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import StaffScreen from './StaffScreen';
import JobVacancyScreen from './JobVacancyScreen';

const Tab = createMaterialTopTabNavigator();

const Staff_JobScreen = () => (
  <Tab.Navigator>
    <Tab.Screen name="Staff" component={StaffScreen} />
    <Tab.Screen name="Job Vacancy" component={JobVacancyScreen} />
  </Tab.Navigator>
);

export default Staff_JobScreen;
