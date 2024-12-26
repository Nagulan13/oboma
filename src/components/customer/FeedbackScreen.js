import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import StarRating from '../../components/customer/StarRating';

const FeedbackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { orderId, item, customerId } = route.params || {}; // Ensure customerId is passed
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const checkFeedback = async () => {
      try {
        const feedbackQuery = query(
          collection(db, 'feedback'),
          where('order_id', '==', orderId),
          where('item_id', '==', item.id)
        );
        const feedbackSnapshot = await getDocs(feedbackQuery);
        if (!feedbackSnapshot.empty) {
          setFeedbackSubmitted(true);
        }
      } catch (error) {
        console.error('Error checking feedback:', error);
      }
    };
    checkFeedback();
  }, [orderId, item.id]);

  const handleSubmitFeedback = async () => {
    if (rating < 1) {
      Alert.alert('Error', 'Please select at least 1 star for your rating.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }

    if (!customerId) {
      Alert.alert('Error', 'Customer ID is missing. Unable to submit feedback.');
      return;
    }

    try {
      const feedbackData = {
        item_id: item.id,
        order_id: orderId,
        customer_id: customerId, // Ensure this is used correctly
        rating,
        comment: comment.trim(),
        created_at: serverTimestamp(),
      };

      await addDoc(collection(db, 'feedback'), feedbackData);
      setFeedbackSubmitted(true);
      Alert.alert('Success', 'Your feedback has been submitted!');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Could not submit feedback. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Feedback</Text>
      {feedbackSubmitted ? (
        <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
      ) : (
        <>
          <Text style={styles.label}>Rating:</Text>
          <StarRating
            rating={rating}
            onChangeRating={setRating}
            size={32}
            color="#FFD700"
          />
          <Text style={styles.label}>Comment:</Text>
          <TextInput
            style={[styles.input, styles.commentInput]}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            placeholder="Write your comment..."
          />
          <Button
            title="Submit Feedback"
            onPress={handleSubmitFeedback}
            color="#1E90FF"
          />
        </>
      )}
    </View>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  commentInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  thankYouText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#32CD32',
    marginTop: 20,
    fontWeight: 'bold',
  },
});
