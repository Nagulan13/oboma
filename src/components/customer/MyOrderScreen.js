import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as Animatable from 'react-native-animatable';

const MyOrderScreen = () => {
  const dummyOrders = [
    {
      id: '1',
      item: 'Beef Burger with Cheese',
      quantity: 2,
      price: 8.00,
      status: 'Preparing',
    },
    {
      id: '2',
      item: 'Chicken Burger',
      quantity: 1,
      price: 4.00,
      status: 'Done',
    },
    {
      id: '3',
      item: 'Veggie Burger',
      quantity: 3,
      price: 12.00,
      status: 'Preparing',
    },
  ];

  const renderOrder = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.orderContainer}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderItem}>{item.item}</Text>
        <Text style={[styles.orderStatus, item.status === 'Done' ? styles.done : styles.preparing]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderQuantity}>Quantity: {item.quantity}</Text>
      <Text style={styles.orderPrice}>Price: RM {item.price.toFixed(2)}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={dummyOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 10,
  },
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItem: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 5,
  },
  done: {
    color: 'green',
    backgroundColor: '#e0f7e9',
  },
  preparing: {
    color: 'orange',
    backgroundColor: '#fff4e0',
  },
  orderQuantity: {
    fontSize: 16,
    color: '#555',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MyOrderScreen;
