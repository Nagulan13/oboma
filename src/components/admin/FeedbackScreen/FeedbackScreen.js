import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import FeedbackItem from './FeedbackItem'; // Adjust the path as needed

const FeedbackScreen = () => {
  const [feedbackList, setFeedbackList] = useState([
    { id: '1', text: 'Great service!' },
    { id: '2', text: 'The burger was delicious!' },
    { id: '3', text: 'Could be better with more toppings.' },
  ]);

  const handleApprove = (id) => {
    Alert.alert('Feedback Approved', `Feedback with id ${id} has been approved.`);
    setFeedbackList(feedbackList.filter((feedback) => feedback.id !== id));
  };

  const handleReject = (id) => {
    Alert.alert('Feedback Rejected', `Feedback with id ${id} has been rejected.`);
    setFeedbackList(feedbackList.filter((feedback) => feedback.id !== id));
  };

  const renderItem = ({ item }) => (
    <FeedbackItem feedback={item} onApprove={handleApprove} onReject={handleReject} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Feedback</Text>
      <FlatList
        data={feedbackList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default FeedbackScreen;
