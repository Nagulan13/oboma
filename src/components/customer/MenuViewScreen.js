// src/components/customer/MenuViewScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import PosterImage from '../../../assets/poster.jpg';

const { width } = Dimensions.get('window');

const MenuViewScreen = () => {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

  // NEW: Listen for jobVacancyOpen from Firestore
  const [jobVacancyOpen, setJobVacancyOpen] = useState(true);

  useEffect(() => {
    // Listen to the same doc: adminConfig/jobVacancySettings
    const docRef = doc(db, 'adminConfig', 'jobVacancySettings');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setJobVacancyOpen(snapshot.data().jobVacancyOpen);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load menu items & orders
  useEffect(() => {
    const dbRef = getFirestore();

    // Subscribe to 'menu'
    const unsubscribeMenu = onSnapshot(collection(dbRef, 'menu'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const availableItems = items.filter((item) => item.status === 'available');

      setMenuItems(availableItems);
      setFilteredMenuItems(availableItems);

      // Gather categories
      const uniqueCategories = ['All', ...new Set(availableItems.map((item) => item.category))];
      setCategories(uniqueCategories);
    });

    // Subscribe to 'orders'
    const unsubscribeOrders = onSnapshot(collection(dbRef, 'orders'), (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => doc.data());
      setOrders(ordersData);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  // Compute top sales
  useEffect(() => {
    const computeTopSales = () => {
      const itemCount = {};

      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((itm) => {
            if (itm.id) {
              itemCount[itm.id] = (itemCount[itm.id] || 0) + (itm.quantity || 1);
            }
          });
        }
      });

      const sortedItems = Object.keys(itemCount)
        .map((itemId) => ({ id: itemId, count: itemCount[itemId] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const topItems = sortedItems
        .map((topItem) => {
          const menuItem = menuItems.find((m) => m.id === topItem.id);
          return menuItem ? { ...menuItem, orderCount: topItem.count } : null;
        })
        .filter((m) => m !== null);

      setFeaturedItems(topItems);
    };

    computeTopSales();
  }, [orders, menuItems]);

  // Filter by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredMenuItems(menuItems);
    } else {
      const filtered = menuItems.filter((item) => item.category === selectedCategory);
      setFilteredMenuItems(filtered);
    }
  }, [selectedCategory, menuItems]);

  // Open modal + fetch feedback
  const openModal = async (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);

    try {
      const dbRef = getFirestore();
      const feedbackRef = collection(dbRef, 'feedback');
      const feedbackQuery = query(
        feedbackRef,
        where('item_id', '==', item.id),
        where('visible', '==', true)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = feedbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (feedbackData.length === 0) {
        setFeedbacks([]);
        return;
      }

      // Gather unique customer_ids
      const customerIds = [...new Set(feedbackData.map((fb) => fb.customer_id))];

      // If you want to load real names from "customer" collection
      let customers = [];
      const chunkSize = 10;
      for (let i = 0; i < customerIds.length; i += chunkSize) {
        const slice = customerIds.slice(i, i + chunkSize);
        if (slice.length > 0) {
          const customerQuery = query(
            collection(dbRef, 'customer'),
            where('__name__', 'in', slice)
          );
          const customerSnapshot = await getDocs(customerQuery);
          const customersData = customerSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          customers = [...customers, ...customersData];
        }
      }

      // Build map: customer_id => name
      const customerIdToName = {};
      customers.forEach((cust) => {
        customerIdToName[cust.id] = cust.name;
      });

      // Prepare final feedback array
      const preparedFeedbacks = feedbackData.map((fb) => {
        const dateField = fb.created_at ? fb.created_at.toDate() : null;
        const dateString = dateField ? dateField.toLocaleString() : 'N/A';

        return {
          id: fb.id,
          maskedName: maskName(customerIdToName[fb.customer_id]),
          rating: fb.rating,
          comment: fb.comment,
          created_date: dateString,
        };
      });

      setFeedbacks(preparedFeedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      Alert.alert('Error', 'Failed to fetch customer feedback.');
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    setQuantity(1);
    setSpecialRequest('');
    setFeedbacks([]);
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add items to the cart.');
        return;
      }
      const userId = user.uid;
      const dbRef = getFirestore();
      const cartRef = doc(dbRef, 'carts', userId);

      const newItem = {
        ...selectedItem,
        quantity,
        specialRequest,
      };

      const cartSnap = await getDoc(cartRef);
      let cartItems = cartSnap.exists() ? cartSnap.data().cartItems : [];

      // Check if a similar item (same ID + specialRequest) is in the cart
      const existingItemIndex = cartItems.findIndex(
        (itm) => itm.id === newItem.id && itm.specialRequest === newItem.specialRequest
      );
      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        cartItems.push(newItem);
      }

      await setDoc(cartRef, { cartItems });

      Alert.alert('Success', `${selectedItem.name} has been added to your cart.`);
      closeModal();
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  // Mask customer name
  const maskName = (name) => {
    if (!name) return 'U****';
    const firstChar = name.charAt(0);
    return firstChar + '****';
  };

  // Poster click => navigate to job vacancy (customer side form)
  const handleJobVacancyClick = () => {
    navigation.navigate('JobVacancy');
  };

  // List header
  const ListHeader = () => (
    <>
      {/* Only show the poster if jobVacancyOpen is TRUE */}
      {jobVacancyOpen && (
        <View style={styles.banner}>
          <TouchableOpacity onPress={handleJobVacancyClick}>
            <Image
              source={PosterImage}
              style={styles.posterImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text style={styles.bannerText}>Welcome to Otai Burger</Text>
        </View>
      )}

      {/* Top Sales */}
      <Text style={styles.sectionHeader}>Top Sales</Text>
      <FlatList
        data={featuredItems}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      />

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(cat) => cat}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* All Menus */}
      <Text style={styles.sectionHeader}>All Menus</Text>
    </>
  );

  // Render a featured item
  const renderFeaturedItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.featuredTouchable}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={styles.featuredItemContainer}
      >
        <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
        <View style={styles.featuredTextContainer}>
          <Text style={styles.featuredName}>{item.name}</Text>
          <Text style={styles.featuredCount}>{item.orderCount} Orders</Text>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  // Render a category button
  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonSelected,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render each menu item
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
            <Text style={styles.price}>RM {item.price.toFixed(2)}</Text>
          </View>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMenuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedItem && (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <Image source={{ uri: selectedItem.image_url }} style={styles.modalImage} />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalName}>{selectedItem.name}</Text>
                  <Text style={styles.modalPrice}>RM {selectedItem.price.toFixed(2)}</Text>
                </View>

                <TextInput
                  style={styles.specialRequestInput}
                  placeholder="Special Request"
                  value={specialRequest}
                  onChangeText={setSpecialRequest}
                  multiline
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

                {/* Feedback */}
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackHeader}>Customer Feedback</Text>
                  {feedbacks.length > 0 ? (
                    <FlatList
                      data={feedbacks}
                      renderItem={({ item }) => (
                        <View style={styles.feedbackItem}>
                          <Text style={styles.feedbackName}>{item.maskedName}</Text>
                          <Text style={styles.feedbackRating}>Rating: {item.rating}/5</Text>
                          <Text style={styles.feedbackText}>{item.comment}</Text>
                          <Text style={styles.feedbackDate}>{item.created_date}</Text>
                        </View>
                      )}
                      keyExtractor={(fb) => fb.id}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <Text style={styles.noFeedbackText}>No feedback available.</Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MenuViewScreen;

// ---------------------
// Styles (ENHANCED ONLY)
// ---------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3edf7', // Subtle background for a nicer look
  },
  menuList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  posterImage: {
    width: width - 40,
    height: 160,
    borderRadius: 12,
  },
  bannerText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 15,
    color: '#333',
    paddingHorizontal: 10,
  },
  featuredList: {
    paddingVertical: 10,
    paddingLeft: 10,
  },
  featuredTouchable: {
    marginRight: 15,
  },
  featuredItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    width: width / 3 - 20,
    alignItems: 'center',
  },
  featuredImage: {
    width: width / 3 - 44,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  featuredTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  featuredName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  featuredCount: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    marginTop: 2,
  },
  categoriesContainer: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  categoriesList: {
    paddingRight: 10,
  },
  categoryButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#1E90FF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E90FF',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    maxHeight: '90%',
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  modalContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ff5555',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E90FF',
  },
  specialRequestInput: {
    width: '100%',
    minHeight: 70,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 14,
    color: '#1E90FF',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 14,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  feedbackSection: {
    width: '100%',
    marginTop: 10,
  },
  feedbackHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  feedbackItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  feedbackName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  feedbackRating: {
    fontSize: 14,
    color: '#1E90FF',
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#555',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 5,
  },
  noFeedbackText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
});
