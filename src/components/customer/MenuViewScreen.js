import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore methods
import { auth } from '../../services/firebaseConfig'; // Corrected path to Firebase config
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window'); // Get screen width

const MenuViewScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');

  useEffect(() => {
    const db = getFirestore(); // Get Firestore instance
    const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const availableItems = items.filter(item => item.status === 'available');
      const featured = availableItems.slice(0, 3); // Limit to exactly 3 items for Top Sales
      setMenuItems(availableItems);
      setFeaturedItems(featured);
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    setQuantity(1);  // Reset quantity
    setSpecialRequest('');  // Reset special request
  };

  const handleAddToCart = async () => {
    try {
      const userId = auth.currentUser.uid; // Assuming the user is logged in
      const db = getFirestore();
      const cartRef = doc(db, 'carts', userId);

      const newItem = {
        ...selectedItem,
        quantity,
        specialRequest,
      };

      const cartSnap = await getDoc(cartRef);
      let cartItems = [];

      if (cartSnap.exists()) {
        cartItems = cartSnap.data().cartItems;
      }

      cartItems.push(newItem);
      await setDoc(cartRef, { cartItems });

      closeModal();
    } catch (error) {
      console.error('Error adding to cart: ', error);
    }
  };

  // Render item for Top Sales (featured items)
  const renderFeaturedItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={styles.featuredItemContainer}
      >
        <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
        <View style={styles.featuredTextContainer}>
          <Text style={styles.featuredName}>{item.name}</Text>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  // Render item for All Menus (including description)
  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={styles.itemContainer}
      >
        <View style={styles.itemContent}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>RM {item.price}</Text>
          </View>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome to Otai Burger</Text>
      </View>

      <Text style={styles.sectionHeader}>Top Sales</Text>
      <FlatList
        data={featuredItems}
        renderItem={renderFeaturedItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />

      <Text style={styles.sectionHeader}>All Menus</Text>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedItem && (
              <>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <Image source={{ uri: selectedItem.image_url }} style={styles.modalImage} />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalName}>{selectedItem.name}</Text>
                  <Text style={styles.modalPrice}>RM {selectedItem.price}</Text>
                </View>

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

                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  banner: {
    backgroundColor: '#000',
    height: 170,
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  featuredList: {
    paddingBottom: 60,
  },
  featuredItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    width: width / 3 - 20, // Adjust width to fit 3 items in a row
    alignItems: 'center', // Center contents
  },
  featuredImage: {
    width: width / 3 - 40, // Make the image fit the container with some padding
    height: 50,
    borderRadius: 10,
    marginBottom: 5,
  },
  featuredTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  featuredName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 10,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  itemContent: {
    flexDirection: 'row', // Ensures items are aligned horizontally
    alignItems: 'center',
  },
  image: {
    width: 80,  // Adjust image size
    height: 80,
    borderRadius: 10,
    marginRight: 10,  // Space between image and text
  },
  textContainer: {
    flex: 1, // Allows text container to fill available space
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: 500,
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff0000',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  specialRequestInput: {
    width: '100%',
    height: 70,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MenuViewScreen;
