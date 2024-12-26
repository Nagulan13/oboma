import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../services/firebaseConfig';
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useStripe } from '@stripe/stripe-react-native';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, payableAmount } = route.params || {};

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const API_URL = "http://192.168.134.232:8082"; // Replace with your backend URL

  const fetchPaymentSheetParams = async () => {
    if (!payableAmount || payableAmount <= 0) {
      Alert.alert('Error', 'Invalid payment amount.');
      throw new Error('Invalid payment amount.');
    }

    try {
      const response = await fetch(`${API_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: payableAmount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching PaymentSheet params: ${errorText}`);
        throw new Error(`Failed to fetch payment sheet parameters: ${errorText}`);
      }

      const data = await response.json();
      console.log('PaymentSheet params fetched successfully:', data);

      return {
        paymentIntent: data.paymentIntent,
        ephemeralKey: data.ephemeralKey,
        customer: data.customer,
      };
    } catch (error) {
      console.error('Error in fetchPaymentSheetParams:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
      const user = auth.currentUser;
      const billingName = user ? user.displayName || 'Customer' : 'Customer';

      const { error } = await initPaymentSheet({
        merchantDisplayName: "OBOMA",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: billingName,
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      Alert.alert('Error', 'Failed to initialize payment sheet.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createOrderAndPayment = async (paymentIntentId) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        console.error('User is not authenticated.');
        navigation.navigate('LoginScreen');
        return null;
      }

      console.log('Authenticated User:', user.uid);
      console.log('Payment Intent ID:', paymentIntentId);

      // Create an order in the 'orders' collection
      const ordersCollection = collection(db, 'orders');
      const orderData = {
        customerId: user.uid,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url,
          specialRequest: item.specialRequest || null,
        })),
        total_price: Number((payableAmount / 100).toFixed(2)),
        order_date: serverTimestamp(),
        order_status: 'pending',
      };

      console.log('Creating order with data:', orderData);

      const orderRef = await addDoc(ordersCollection, orderData);
      const orderId = orderRef.id;

      console.log('Order created successfully with ID:', orderId);

      // Create a payment record in the 'payment' collection
      const paymentsCollection = collection(db, 'payment');
      const paymentData = {
        payment_id: paymentIntentId,
        customer_id: user.uid,
        payment_status: 'Paid',
        total_amount: Number((payableAmount / 100).toFixed(2)),
        payment_date: serverTimestamp(),
        order_id: orderId,
        invoice_id: orderId, // Using order ID as the invoice ID
      };

      console.log('Creating payment with data:', paymentData);

      const paymentRef = await addDoc(paymentsCollection, paymentData);

      console.log('Payment created successfully with ID:', paymentRef.id);

      return orderId;
    } catch (error) {
      console.error('Error creating order and payment:', error);
      Alert.alert('Error', 'Failed to create order and payment.');
      return null;
    }
  };

  const clearCart = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const cartRef = doc(db, 'carts', user.uid); // Use `doc` to reference the cart document
        await deleteDoc(cartRef); // Delete the cart document
        console.log('Cart cleared successfully for user:', user.uid);
      } catch (error) {
        console.error('Error clearing cart:', error);
        Alert.alert('Error', 'Failed to clear cart.');
      }
    }
  };

  const openPaymentSheet = async () => {
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error(`Error presenting PaymentSheet: ${error.message}`);
        Alert.alert('Error', `Payment completed with issues: ${error.message}`);
      } else {
        Alert.alert('Success', 'Your payment is confirmed!');
        const paymentIntentId = await fetchPaymentSheetParams().then((data) => data.paymentIntent);

        if (paymentIntentId) {
          const orderId = await createOrderAndPayment(paymentIntentId);
          if (orderId) {
            await clearCart();
            navigation.navigate('InvoiceScreen', { invoiceId: orderId });
          }
        }
      }
    } catch (error) {
      console.error('Error in openPaymentSheet:', error);
      Alert.alert('Error', 'Failed to complete payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const isInitialized = await initializePaymentSheet();
    if (isInitialized) {
      await openPaymentSheet();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Order</Text>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} (x{item.quantity})</Text>
              <Text style={styles.itemPrice}>RM {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            {item.specialRequest && (
              <Text style={styles.specialRequestText}>Special Requests: {item.specialRequest}</Text>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <Text style={styles.totalText}>Total: RM {(payableAmount / 100).toFixed(2)}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  specialRequestText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
