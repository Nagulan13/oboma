import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../../services/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';

const AdminFeedbackScreen = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const feedbackCollection = collection(db, 'feedback');

    const unsubscribe = onSnapshot(
      feedbackCollection,
      async (snapshot) => {
        try {
          const feedbackData = await Promise.all(
            snapshot.docs.map(async (feedbackDoc) => {
              const feedback = feedbackDoc.data();

              let customerName = 'Unknown Customer';
              if (feedback.customer_id) {
                const customerDocRef = doc(db, 'customer', feedback.customer_id);
                const customerDoc = await getDoc(customerDocRef);
                if (customerDoc.exists()) {
                  customerName = customerDoc.data().name;
                }
              }

              let itemName = 'Unknown Item';
              let category = 'Unknown Category';
              if (feedback.item_id) {
                const itemDocRef = doc(db, 'menu', feedback.item_id);
                const itemDoc = await getDoc(itemDocRef);
                if (itemDoc.exists()) {
                  itemName = itemDoc.data().name;
                  category = itemDoc.data().category;
                }
              }

              return {
                id: feedbackDoc.id,
                ...feedback,
                customerName,
                itemName,
                category,
              };
            })
          );

          const uniqueCategories = [
            'All',
            ...new Set(feedbackData.map((feedback) => feedback.category).filter(Boolean)),
          ];

          const sortedFeedback = feedbackData.sort((a, b) => {
            const dateA = a.created_at?.seconds || 0;
            const dateB = b.created_at?.seconds || 0;
            return dateB - dateA;
          });

          setFeedbackList(sortedFeedback);
          setCategories(uniqueCategories);
        } catch (error) {
          console.error('Error processing feedback data:', error);
          Alert.alert('Error', 'Failed to process feedback data.');
        }
      },
      (error) => {
        console.error('Error fetching feedbacks:', error);
        Alert.alert('Error', 'Failed to fetch feedbacks.');
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleVisibility = async (id, visible) => {
    try {
      const feedbackDoc = doc(db, 'feedback', id);
      await updateDoc(feedbackDoc, { visible: !visible });
      Alert.alert('Success', `Feedback visibility updated to ${!visible ? 'Show' : 'Hide'}.`);
    } catch (error) {
      console.error('Error toggling feedback visibility:', error);
      Alert.alert('Error', 'Failed to update feedback visibility.');
    }
  };

  const renderRatingStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: 5 }, (_, i) => (
          <Icon
            key={i}
            name={i < rating ? 'star' : 'star-o'}
            size={18}
            color="#FFD700"
            style={{ marginRight: 5 }}
          />
        ))}
      </View>
    );
  };

  const getCardColor = (rating) => {
    switch (rating) {
      case 5:
        return '#32CD32'; // Bright Green
      case 4:
        return '#1E90FF'; // Bright Blue
      case 3:
        return '#FFD700'; // Gold
      case 2:
        return '#FFA500'; // Orange
      case 1:
        return '#FF4500'; // Bright Red
      default:
        return '#808080'; // Gray
    }
  };

  const filteredFeedbackList =
    selectedCategory === 'All'
      ? feedbackList
      : feedbackList.filter((feedback) => feedback.category === selectedCategory);

  const renderItem = ({ item }) => (
    <View
      style={[styles.feedbackCard, { borderLeftWidth: 8, borderLeftColor: getCardColor(item.rating) }]}
    >
      <Text style={styles.itemText}>Item: {item.itemName}</Text>
      <Text style={styles.customerText}>Customer: {item.customerName}</Text>
      <Text style={styles.dateText}>
        {item.created_at
          ? new Date(item.created_at.seconds * 1000).toLocaleString()
          : 'No Date'}
      </Text>

      <View style={styles.highlightSection}>
        <Text style={styles.ratingLabel}>Rating:</Text>
        {renderRatingStars(item.rating)}
      </View>

      <View style={styles.highlightSection}>
        <Text style={styles.commentText}>Comment:</Text>
        <Text style={styles.commentHighlight}>{item.comment || 'No Comment'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.toggleButton, item.visible ? styles.buttonHide : styles.buttonShow]}
        onPress={() => toggleVisibility(item.id, item.visible)}
      >
        <Text style={styles.toggleButtonText}>{item.visible ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback Management</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
          style={styles.picker}
        >
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>
      <FlatList
        data={filteredFeedbackList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No feedback available</Text>}
      />
    </View>
  );
};

export default AdminFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
  },
  filterContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  customerText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  highlightSection: {
    marginVertical: 5,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  commentHighlight: {
    fontSize: 16,
    color: '#000',
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonShow: {
    backgroundColor: '#32CD32', // Bright Green for Show
  },
  buttonHide: {
    backgroundColor: '#FF4500', // Bright Red for Hide
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
