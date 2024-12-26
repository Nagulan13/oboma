import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const InvoiceDetailsScreen = ({ route }) => {
  const { invoice } = route.params;
  const [customerName, setCustomerName] = useState(null);
  const [orderedItems, setOrderedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch customer name
        const customerRef = doc(db, 'customer', invoice.customer_id);
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          const customerData = customerSnap.data();
          setCustomerName(customerData.name);
        } else {
          setCustomerName('Unknown Customer');
        }

        // Fetch ordered items
        const orderRef = doc(db, 'orders', invoice.order_id);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setOrderedItems(orderData.items || []);
        } else {
          setOrderedItems([]);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        Alert.alert('Error', 'Failed to fetch invoice details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [invoice.customer_id, invoice.order_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Invoice Receipt</Text>
      <View style={styles.receipt}>
        {/* Store Details */}
        <View style={styles.section}>
          <Text style={styles.storeName}>OTAi Burger</Text>
          <Text style={styles.storeAddress}>123, Main Street, Puncak Alam</Text>
          <Text style={styles.storeContact}>Contact: +60 12-345 6789</Text>
        </View>

        <View style={styles.divider} />

        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={styles.row}>Invoice ID: {invoice.invoice_id || invoice.id}</Text>
          <Text style={styles.row}>Customer Name: {customerName}</Text>
          <Text style={styles.row}>
            Purchase Date:{' '}
            {invoice.payment_date?.seconds
              ? new Date(invoice.payment_date.seconds * 1000).toLocaleString()
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Ordered Items */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ordered Items:</Text>
          {orderedItems.length > 0 ? (
            orderedItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.name} (x{item.quantity})
                </Text>
                <Text style={styles.itemPrice}>RM {item.price.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.row}>No items found.</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Total Amount */}
        <View style={styles.section}>
          <Text style={styles.row}>Total Amount: RM {invoice.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Thank You Note */}
        <View style={styles.section}>
          <Text style={styles.thankYou}>Thank You for Your Purchase!</Text>
          <Text style={styles.note}>Visit us again at OTAi Burger!</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  receipt: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  section: {
    marginBottom: 15,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  storeAddress: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  storeContact: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
  row: {
    fontSize: 16,
    marginVertical: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  thankYou: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InvoiceDetailsScreen;
