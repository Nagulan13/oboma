import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const FeedbackItem = ({ feedback, onApprove, onReject }) => {
  return (
    <View style={styles.feedbackItem}>
      <Text style={styles.feedbackText}>{feedback.text}</Text>
      <View style={styles.buttonsContainer}>
        <Button title="Approve" onPress={() => onApprove(feedback.id)} />
        <Button title="Reject" onPress={() => onReject(feedback.id)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  feedbackText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default FeedbackItem;
