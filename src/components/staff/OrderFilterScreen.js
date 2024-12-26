import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../../services/firebaseConfig';

const OrderSearchScreen = () => {
  const [orders, setOrders] = useState([]);
  const [orderID, setOrderID] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const navigation = useNavigation();
  const db = getFirestore(app);

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, 'orders');
        const snapshot = await getDocs(ordersCollection);
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          order_date: doc.data().order_date?.toDate(), // Convert Firestore Timestamp to JavaScript Date
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const searchOrders = async () => {
    const filtered = await Promise.all(
      orders.map(async (order) => {
        const matchesOrderID = !orderID || order.id.toLowerCase().includes(orderID.toLowerCase());
        if (matchesOrderID) {
          try {
            // Fetch customer name using customerId
            const customerDoc = doc(db, 'customer', order.customerId);
            const customerSnapshot = await getDoc(customerDoc);
            const customerData = customerSnapshot.exists() ? customerSnapshot.data() : { name: 'Unknown' };
            return { ...order, customerName: customerData.name };
          } catch (error) {
            console.error('Error fetching customer:', error);
            return { ...order, customerName: 'Error fetching name' };
          }
        }
        return null;
      })
    );

    const validFilteredOrders = filtered.filter((order) => order !== null);
    setFilteredOrders(validFilteredOrders);
  };

  const navigateToOrderDetails = (order) => {
    navigation.navigate('SearchedOrderDetailsScreen', { order });
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToOrderDetails(item)} style={styles.orderItem}>
      <Text style={styles.orderText}>Customer Name: {item.customerName}</Text>
      <Text style={styles.orderText}>Order ID: {item.id}</Text>
      <Text style={styles.orderText}>Order Status: {item.order_status}</Text>
      <Text style={styles.orderText}>Date: {item.order_date?.toLocaleDateString()}</Text>
      <Text style={styles.orderText}>Total: RM {item.total_price?.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Orders</Text>

      {/* Order ID Search */}
      <Text style={styles.label}>Order ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Order ID"
        value={orderID}
        onChangeText={(text) => setOrderID(text)}
      />

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={searchOrders}>
        <Text style={styles.searchButtonText}>Search Order</Text>
      </TouchableOpacity>

      {/* Results */}
      <Text style={styles.title}>Search Results</Text>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <Text style={styles.noOrdersText}>No orders match the search criteria.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  searchButton: {
    height: 50,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  orderText: {
    fontSize: 14,
    color: '#333',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OrderSearchScreen;
