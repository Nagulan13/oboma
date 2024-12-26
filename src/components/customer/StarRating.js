// src/components/StarRating.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StarRating = ({ rating, onChangeRating, size = 30, color = '#FFD700' }) => {
  // We'll render 5 stars
  const starArray = [1, 2, 3, 4, 5];

  return (
    <View style={styles.starContainer}>
      {starArray.map((starValue) => {
        const filled = starValue <= rating;
        return (
          <TouchableOpacity
            key={starValue}
            onPress={() => onChangeRating(starValue)}
            activeOpacity={0.7}
          >
            <Icon
              name={filled ? 'star' : 'star-o'}
              size={size}
              color={color}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starIcon: {
    marginRight: 5,
  },
});
