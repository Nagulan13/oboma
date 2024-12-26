// CartScreen.js
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const CartScreen = () => {  
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');
  const [quantity, setQuantity] = useState(1); // Track quantity for editing
  const [payableAmount, setPayableAmount] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state for any future use
  const navigation = useNavigation(); // Initialize navigation

  // Calculate the total payable amount whenever cartItems change
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalInSen = Math.round(total * 100);
    setPayableAmount(totalInSen);
  }, [cartItems]);

  // Fetch cart items from Firestore
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setCartItems([]);
          return;
        }

        const userId = user.uid; 
        const cartRef = doc(db, 'carts', userId); 

        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            setCartItems(docSnap.data().cartItems);
          } else {
            setCartItems([]);
          }
        });

        return () => unsubscribe();
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

      const updatedCart = cartItems.filter(
        (cartItem) => cartItem.id !== item.id || cartItem.specialRequest !== item.specialRequest
      );

      if (updatedCart.length === 0) {
        await deleteDoc(cartRef);
      } else {
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
    setQuantity(item.quantity || 1); // Set initial quantity
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
        if (cartItem.id === selectedItem.id && cartItem.specialRequest === selectedItem.specialRequest) {
          return { ...cartItem, specialRequest, quantity };
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

  // Handle checkout by navigating to CheckoutScreen
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checking out.');
      return;
    }

    navigation.navigate('CheckoutScreen', {
      cartItems,
      payableAmount,
    });
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
            keyExtractor={(item, index) => `${item.id}-${item.specialRequest}-${index}`}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: RM {(payableAmount / 100).toFixed(2)}
            </Text>
            <TouchableOpacity 
              onPress={handleCheckout}
              style={styles.checkoutButton}
              disabled={loading}
            >
              {loading ? (
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

                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Text style={styles.quantityButton}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>

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
  // ... (Keep your existing styles unchanged)
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
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    color: '#007BFF',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default CartScreen;
