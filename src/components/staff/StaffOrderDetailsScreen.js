import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const StaffOrderDetailsScreen = ({ route }) => {
  const { order } = route.params;
  const navigation = useNavigation();
  const [currentStatus, setCurrentStatus] = useState(order.order_status || 'new order');
  const [pickedUpDate, setPickedUpDate] = useState(order.picked_up_date || null);

  useEffect(() => {
    if (order.picked_up_date) {
      setPickedUpDate(order.picked_up_date);
    }
  }, [order.picked_up_date]);

  const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'new order':
        return '#FFA500'; // Orange
      case 'preparing':
        return '#1E90FF'; // Blue
      case 'ready for pickup':
        return '#32CD32'; // Green
      case 'completed':
        return '#8B4513'; // Brown
      default:
        return '#808080'; // Gray
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const orderRef = doc(db, 'orders', order.id);

    try {
      await updateDoc(orderRef, {
        order_status: newStatus,
        updated_at: serverTimestamp(),
        updated_by: 'staff',
      });
      setCurrentStatus(newStatus);

      if (newStatus.toLowerCase() === 'completed') {
        setPickedUpDate(new Date());
      }

      Alert.alert('Success', `Order status updated to "${newStatus}".`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('StaffOrders', { updatedStatus: newStatus }),
        },
      ]);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const renderStatusButtons = () => {
    const lowerStatus = (currentStatus || '').toLowerCase();

    if (lowerStatus === 'pending') {
      return (
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: '#1E90FF' }]}
          onPress={() => handleStatusUpdate('preparing')}
        >
          <Text style={styles.buttonText}>Set to Preparing</Text>
        </TouchableOpacity>
      );
    } else if (lowerStatus === 'preparing') {
      return (
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: '#32CD32' }]}
          onPress={() => handleStatusUpdate('ready for pickup')}
        >
          <Text style={styles.buttonText}>Set to Ready for Pickup</Text>
        </TouchableOpacity>
      );
    } else if (lowerStatus === 'ready for pickup') {
      return (
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: '#8B4513' }]}
          onPress={() => handleStatusUpdate('completed')}
        >
          <Text style={styles.buttonText}>Set to Completed</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const OrderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.orderId}>Order ID: {order.id}</Text>
      <Text style={[styles.orderStatus, { color: getStatusColor(currentStatus) }]}>
        Status: {currentStatus}
      </Text>
      <Text style={styles.orderDate}>Order Date: {formatFirestoreTimestamp(order.order_date)}</Text>
      <Text style={styles.orderPrice}>Total Price: RM {order.total_price.toFixed(2)}</Text>
      {pickedUpDate && (
        <Text style={styles.orderPickedUp}>
          Picked Up At: {formatFirestoreTimestamp(pickedUpDate)}
        </Text>
      )}
      <View style={styles.updateContainer}>
        <Text style={styles.updateTitle}>Update Status:</Text>
        {renderStatusButtons()}
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemRequests}>
          Special Requests: {item.special_requests || 'None'}
        </Text>
        <Text style={styles.itemPrice}>Price: RM {item.price.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={order.items}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      ListHeaderComponent={OrderHeader}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  headerContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderPickedUp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4C35',
    marginTop: 5,
  },
  updateContainer: {
    marginTop: 15,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemQuantity: {
    fontSize: 14,
    marginVertical: 5,
  },
  itemRequests: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 10,
  },
});

export default StaffOrderDetailsScreen;
