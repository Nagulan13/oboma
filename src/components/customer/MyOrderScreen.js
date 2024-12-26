import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MyOrderScreen = () => {
  // ---------------------------
  // State Variables
  // ---------------------------
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // ---------------------------
  // Map Customer Status
  // ---------------------------
  const mapCustomerStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Order Placed';
      case 'preparing':
        return 'Preparing';
      case 'ready for pickup':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  // ---------------------------
  // Status Color
  // ---------------------------
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'preparing':
        return '#1E90FF'; // Blue
      case 'ready for pickup':
        return '#32CD32'; // Green
      case 'completed':
        return '#8B4513'; // Brown
      default:
        return '#808080'; // Gray
    }
  };

  // ---------------------------
  // Fetch Orders on Mount
  // ---------------------------
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', user.uid), orderBy('order_date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Failed to fetch orders.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ---------------------------
  // Refresh Orders
  // ---------------------------
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        setOrders([]);
        setRefreshing(false);
        return;
      }

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('customerId', '==', user.uid), orderBy('order_date', 'desc'));

      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      Alert.alert('Error', 'Failed to refresh orders.');
    } finally {
      setRefreshing(false);
    }
  };

  // ---------------------------
  // Render Single Order
  // ---------------------------
  const renderItem = ({ item }) => {
    const totalPrice =
      item.total_price != null && typeof item.total_price === 'number'
        ? item.total_price.toFixed(2)
        : 'N/A';

    return (
      <TouchableOpacity
        style={styles.orderContainer}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order ID: {item.id}</Text>
          <Text style={[styles.orderStatus, { color: getStatusColor(item.order_status) }]}>
            {mapCustomerStatus(item.order_status)}
          </Text>
        </View>

        <Text style={styles.orderDate}>
          Order Date:{' '}
          {item.order_date?.seconds
            ? new Date(item.order_date.seconds * 1000).toLocaleString()
            : 'N/A'}
        </Text>

        <Text style={styles.orderPrice}>Total Price: RM {totalPrice}</Text>
      </TouchableOpacity>
    );
  };

  // ---------------------------
  // Loading UI
  // ---------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // ---------------------------
  // No Orders
  // ---------------------------
  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={60} color="#555" />
        <Text style={styles.emptyText}>You have no orders yet.</Text>

        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('MenuView')}
        >
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------------
  // Main Return
  // ---------------------------
  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<Text style={styles.title}>My Orders</Text>}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7', // Slightly lighter background for a modern look
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  listContainer: {
    padding: 10,
  },
  orderContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#aaa',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDate: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  orderPrice: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3edf7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3edf7',
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginVertical: 10,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 15,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyOrderScreen;
