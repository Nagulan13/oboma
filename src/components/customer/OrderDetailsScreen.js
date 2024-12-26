import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackStatus = async () => {
      try {
        const feedbackQuery = query(
          collection(db, 'feedback'),
          where('order_id', '==', order.id)
        );
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const feedbackStatuses = {};
        feedbackSnapshot.forEach((doc) => {
          const data = doc.data();
          feedbackStatuses[data.item_id] = true;
        });
        setFeedbackStatus(feedbackStatuses);
      } catch (error) {
        console.error('Error fetching feedback status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackStatus();
  }, [order.id]);

  const mapCustomerStatus = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'Order Placed';
      case 'preparing':
        return 'Preparing';
      case 'ready for pickup':
        return 'Ready for Pickup';
      case 'picked up':
        return 'Picked Up';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'preparing':
        return '#1E90FF';
      case 'ready for pickup':
      case 'picked up':
      case 'completed':
        return '#32CD32';
      case 'cancelled':
        return '#FF4500';
      default:
        return '#808080';
    }
  };

  const OrderHeader = () => {
    const orderDate = order.order_date?.seconds
      ? new Date(order.order_date.seconds * 1000)
      : new Date(order.order_date);

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Order ID: {order.id}</Text>
          <Text
            style={[
              styles.orderStatus,
              { color: getStatusColor(order.order_status) },
            ]}
          >
            {mapCustomerStatus(order.order_status)}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.orderDate}>
            Order Date: {orderDate.toLocaleString()}
          </Text>
          <Text style={styles.orderPrice}>
            Total Price: RM {order.total_price.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.invoiceButton}
          onPress={() =>
            navigation.navigate('InvoiceDetails', {
              invoice: {
                invoice_id: order.id,
                customer_id: order.customerId,
                order_id: order.id,
                total_amount: order.total_price,
                payment_date: order.order_date,
              },
            })
          }
        >
          <Text style={styles.invoiceButtonText}>View Invoice</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const feedbackSubmitted = feedbackStatus[item.id];

    return (
      <View style={styles.itemContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.itemImage}
            resizeMode="cover"
          />
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

        {order.order_status?.toLowerCase() === 'completed' && !feedbackSubmitted ? (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() =>
              navigation.navigate('FeedbackScreen', {
                orderId: order.id,
                item,
                customerId: order.customerId,
              })
            }
          >
            <Text style={styles.feedbackButtonText}>Feedback</Text>
          </TouchableOpacity>
        ) : feedbackSubmitted ? (
          <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={OrderHeader}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  container: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  headerInfo: {
    marginTop: 15,
  },
  orderDate: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  invoiceButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  invoiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  itemImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  placeholderImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  itemRequests: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  feedbackButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    marginLeft: 10,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  thankYouText: {
    fontSize: 14,
    color: '#32CD32',
    fontWeight: '600',
    marginLeft: 10,
  },
  separator: {
    height: 15,
  },
});
