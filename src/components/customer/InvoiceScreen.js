import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const InvoiceScreen = ({ route }) => {
  const { invoiceId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    if (!invoiceId) {
      Alert.alert('Error', 'No invoice ID provided.');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(db, 'orders', invoiceId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const fetchedOrder = orderSnap.data();
          console.log('Fetched Order:', fetchedOrder); // Debugging log
          setOrder(fetchedOrder);
        } else {
          Alert.alert('Error', 'Invoice not found.');
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        Alert.alert('Error', 'Failed to fetch invoice details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invoice not found.</Text>
      </View>
    );
  }

  // Check if total_price exists and is a number
  const isTotalPriceValid = typeof order.total_price === 'number';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice</Text>
      <View style={styles.invoiceDetails}>
        <Text style={styles.label}>Invoice ID:</Text>
        <Text style={styles.value}>{invoiceId}</Text>
      </View>
      <View style={styles.invoiceDetails}>
        <Text style={styles.label}>Order Date:</Text>
        <Text style={styles.value}>
          {order.order_date
            ? new Date(order.order_date.seconds * 1000).toLocaleString()
            : 'N/A'}
        </Text>
      </View>
      <View style={styles.invoiceDetails}>
        <Text style={styles.label}>Total Price:</Text>
        <Text style={styles.value}>
          RM {isTotalPriceValid ? order.total_price.toFixed(2) : 'N/A'}
        </Text>
      </View>

      <Text style={styles.subtitle}>Order Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>RM {item.price.toFixed(2)}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              {item.specialRequest ? (
                <Text style={styles.specialRequest}>
                  Special Requests: {item.specialRequest}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('MyOrder')}
      >
        <Text style={styles.buttonText}>View All Orders</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#777',
    fontSize: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#ff0000',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
  },
  specialRequest: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InvoiceScreen;
