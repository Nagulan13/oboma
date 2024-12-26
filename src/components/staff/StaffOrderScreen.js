import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PendingOrdersScreen from './PendingOrdersScreen';
import PreparingOrdersScreen from './PreparingOrdersScreen';
import CompletedOrdersScreen from './CompletedOrdersScreen';
import { useNavigation, useRoute } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const StaffOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const filterParams = route.params?.filterParams || {};

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('OrderFilter')}
        >
          <Text style={styles.filterButtonText}>Search/Filter Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <Tab.Navigator>
        <Tab.Screen
          name="PendingOrders"
          options={{ title: 'Pending' }}
        >
          {() => <PendingOrdersScreen filterParams={filterParams} />}
        </Tab.Screen>
        <Tab.Screen
          name="PreparingOrders"
          options={{ title: 'Preparing' }}
        >
          {() => <PreparingOrdersScreen filterParams={filterParams} />}
        </Tab.Screen>
        <Tab.Screen
          name="CompletedOrders"
          options={{ title: 'Completed' }}
        >
          {() => <CompletedOrdersScreen filterParams={filterParams} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    alignItems: 'center',
    padding: 10,
  },
  filterButton: {
    height: 40,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StaffOrderScreen;
