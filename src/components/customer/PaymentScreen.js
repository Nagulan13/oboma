import React, { useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { totalAmount } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [publishableKey, setPublishableKey] = useState('');
  const API_URL = 'http://192.168.0.142:8080'; // Replace with your backend IP

  useEffect(() => {
    const initializePaymentSheet = async () => {
      try {
        const keyResponse = await fetch(`${API_URL}/get-publishable-key`);
        const { key } = await keyResponse.json();
        setPublishableKey(key);

        const paymentResponse = await fetch(`${API_URL}/payment-sheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount * 100 }),
        });
        const { paymentIntent, ephemeralKey, customer } = await paymentResponse.json();

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          customerEphemeralKeySecret: ephemeralKey,
          customerId: customer,
          allowsDelayedPaymentMethods: true,
        });

        if (error) {
          console.error('Error initializing payment sheet:', error.message);
          Alert.alert('Error', 'Payment initialization failed.');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Unable to initialize payment.');
      }
    };

    initializePaymentSheet();
  }, [totalAmount]);

  const handlePayment = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else {
        Alert.alert('Success', 'Your payment was successful!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error during payment:', error);
      Alert.alert('Error', 'Payment process failed.');
    }
  };

  return (
    <StripeProvider publishableKey={publishableKey}>
      <View style={styles.container}>
        <Button title="Pay Now" onPress={handlePayment} disabled={!publishableKey} />
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;
