import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, orderBy, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const OrderListScreen = ({ status }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = () => {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('order_date', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedOrders = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
          });

          const filteredOrders = fetchedOrders.filter((order) => {
            const s = (order.order_status || '').toLowerCase();
            return s === status;
          });

          setOrders(filteredOrders);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching orders:', error);
          Alert.alert('Error', 'Failed to fetch orders.');
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    const unsubscribe = fetchOrders();
    return () => unsubscribe();
  }, [status]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'preparing':
        return '#1E90FF'; // Dodger Blue
      case 'ready for pickup':
        return '#32CD32'; // Lime Green
      case 'completed':
        return '#8B4513'; // Brown
      default:
        return '#808080'; // Gray
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderContainer}
      onPress={() => navigation.navigate('OrderDetails', { order: item })} // Navigation to StaffOrderDetailsScreen
    >
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      <Text style={styles.orderDate}>
        Order Date: {new Date(item.order_date.toDate()).toLocaleString()}
      </Text>
      <Text style={[styles.orderStatus, { color: getStatusColor(item.order_status) }]}>
        Status: {item.order_status}
      </Text>
      <Text style={styles.orderPrice}>Total Price: RM {item.total_price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  orderContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  orderPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 5,
  },
});

export default OrderListScreen;
