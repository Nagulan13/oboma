// CartScreen.js DNA
import React, { useState, useEffect } from 'react'; // Add useEffect
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  TextInput, 
  Modal, 
  Alert, 
  ActivityIndicator 
} from 'react-native'; // Add ActivityIndicator
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'; // Import Firestore methods
import { auth, db } from '../../services/firebaseConfig'; // Import Firebase configurations
import { useStripe } from '@stripe/stripe-react-native'; // Import useStripe hook

const CartScreen = () => {  // Change to functional component
  const [cartItems, setCartItems] = useState([]); // For storing cart items
  const [selectedItem, setSelectedItem] = useState(null); // For storing the item being edited
  const [isModalVisible, setIsModalVisible] = useState(false); // For controlling modal visibility
  const [specialRequest, setSpecialRequest] = useState(''); // Track special request

  const [payableAmount, setPayableAmount] = useState(0); // Track total payable amount

  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // Stripe hook
  const [loading, setLoading] = useState(false); // Loading state for payment sheet
  const [paymentLoading, setPaymentLoading] = useState(false); // Loading state for payment

  const API_URL = "http://192.168.0.142:8080"; // Replace with your actual backend URL
  // Adjust based on your testing environment:
  // - Android Emulator: http://10.0.2.2:8080
  // - iOS Simulator: http://localhost:8080 or http://127.0.0.1:8080
  // - Physical Devices: Use your machine's local network IP, e.g., http://192.168.x.x:8080

  // Calculate the total payable amount whenever cartItems change
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Convert RM to sen and ensure it's an integer
    const totalInSen = Math.round(total * 100);
    console.log(`Total in RM: ${total}`);
    console.log(`Total in Sen (integer): ${totalInSen}`);
    setPayableAmount(totalInSen);
  }, [cartItems]);

  // Fetch cart items from Firestore
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          // Handle unauthenticated state
          setCartItems([]);
          return;
        }

        const userId = user.uid; // Get the current user ID
        const cartRef = doc(db, 'carts', userId); // Reference to the user's cart document

        // Listen for real-time updates on the cart document
        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            setCartItems(docSnap.data().cartItems); // Update cart items from Firestore
          } else {
            setCartItems([]); // If no cart, set to an empty array
          }
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
      } catch (error) {
        console.error('Error fetching cart items:', error);
        Alert.alert('Error', 'Failed to fetch cart items.');
      }
    };

    fetchCartItems();
  }, []);

  // Function to remove an item from the cart
  const removeItem = async (item) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const userId = user.uid;
      const cartRef = doc(db, 'carts', userId);

      const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);

      if (updatedCart.length === 0) {
        // Delete the cart document if no items are left
        await deleteDoc(cartRef);
      } else {
        // Otherwise, update the cart
        await updateDoc(cartRef, { cartItems: updatedCart });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  // Open the edit modal and set the item being edited
  const editItem = (item) => {
    setSelectedItem(item);
    setSpecialRequest(item.specialRequest || ''); // Set initial special request if available
    setIsModalVisible(true); // Show the modal
  };

  // Function to update the item in the cart
  const updateItemInCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const userId = user.uid;
      const cartRef = doc(db, 'carts', userId);

      const updatedCart = cartItems.map(cartItem => {
        if (cartItem.id === selectedItem.id) {
          return { ...cartItem, specialRequest };
        }
        return cartItem;
      });

      await updateDoc(cartRef, { cartItems: updatedCart });
      setIsModalVisible(false); // Hide the modal after updating
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  // Fetch payment sheet parameters from backend
  const fetchPaymentSheetParams = async () => {
    try {
      console.log('Fetching Payment Sheet Params...');
      console.log(`Amount sent to backend: ${payableAmount}`); // Log the amount
      const response = await fetch(`${API_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: payableAmount }), // amount is now in sen (integer)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch payment sheet parameters: ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment Sheet Params:', data);

      const { paymentIntent, ephemeralKey, customer } = data;

      if (!paymentIntent || !ephemeralKey || !customer) {
        throw new Error('Missing required payment sheet parameters from backend.');
      }

      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  // Initialize the payment sheet
  const initializePaymentSheet = async () => {
    try {
      console.log('Initializing Payment Sheet...');
      setLoading(true);
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams();

      console.log('Fetched Payment Sheet Params:', { paymentIntent, ephemeralKey, customer });

      const { error } = await initPaymentSheet({
        merchantDisplayName: "OBOMA",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Nagulan',
        }
      });

      if (error) {
        console.error('Error initializing Payment Sheet:', error);
        Alert.alert('Error', error.message);
      } else {
        console.log('Payment Sheet initialized successfully');
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
      Alert.alert('Error', 'Failed to initialize payment sheet.');
    } finally {
      setLoading(false);
    }
  };

  // Open the payment sheet
  const openPaymentSheet = async () => {
    try {
      console.log('Presenting Payment Sheet...');
      setPaymentLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error('PaymentSheet Error:', error);
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert('Success', 'Your order is confirmed!');
        await clearCart();
      }
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      Alert.alert('Error', 'Failed to present payment sheet.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle checkout by initializing and then presenting the payment sheet
  const handleCheckout = async () => {
    console.log('Checkout button pressed');
    try {
      await initializePaymentSheet();
      console.log('Payment sheet initialized');

      // Only present the payment sheet if initialization was successful
      await openPaymentSheet();

      console.log('Payment sheet opened');
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'Failed to process checkout: ' + error.message);
    }
  };

  // Clear the cart after successful payment
  const clearCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const userId = user.uid;
      const cartRef = doc(db, 'carts', userId);
      await deleteDoc(cartRef);
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart.');
    }
  };

  // Render each cart item
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>RM {(item.price * item.quantity).toFixed(2)}</Text>
        <Text style={styles.specialRequestText}>
          Special Request: {item.specialRequest || 'None'}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => editItem(item)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: RM {(payableAmount / 100).toFixed(2)}
            </Text>
            <TouchableOpacity 
              onPress={handleCheckout}
              style={styles.checkoutButton}
              disabled={loading || paymentLoading}
            >
              {loading || paymentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal for Editing Item */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Edit {selectedItem?.name}</Text>

                <TextInput
                  style={styles.specialRequestInput}
                  placeholder="Special Request"
                  value={specialRequest}
                  onChangeText={setSpecialRequest}
                />

                <TouchableOpacity style={styles.saveButton} onPress={updateItemInCart}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Loading Indicator for Payment Sheet Initialization */}
          {(loading || paymentLoading) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  details: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#ff0000',
  },
  specialRequestText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editText: {
    color: '#007BFF',
    fontSize: 16,
  },
  removeText: {
    color: '#ff0000',
    fontSize: 16,
  },
  totalContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  specialRequestInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff0000',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default CartScreen;
