import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig'; // Adjust the path as needed

const InboxScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'User not authenticated.');
          setLoading(false);
          return;
        }

        const paymentsRef = collection(db, 'payment');
        const q = query(
          paymentsRef,
          where('customer_id', '==', user.uid),
          orderBy('payment_date', 'desc'),
          limit(10) // Limit to the latest 10 invoices
        );

        const querySnapshot = await getDocs(q);
        const fetchedInvoices = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        Alert.alert('Error', 'Failed to fetch invoices.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.invoiceContainer}
      onPress={() => navigation.navigate('InvoiceDetails', { invoice: item })} // Navigate to InvoiceDetailsScreen
    >
      <Text style={styles.invoiceId}>Invoice ID: {item.invoice_id || item.id}</Text>
      <Text style={styles.invoiceAmount}>Amount: RM {item.total_amount.toFixed(2)}</Text>
      <Text style={styles.invoiceDate}>
        Date: {item.payment_date?.seconds ? new Date(item.payment_date.seconds * 1000).toLocaleString() : 'N/A'}
      </Text>
    </TouchableOpacity>
  );
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (invoices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No invoices found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invoices}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  invoiceContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceAmount: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#555',
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
    color: '#555',
  },
});

export default InboxScreen;
