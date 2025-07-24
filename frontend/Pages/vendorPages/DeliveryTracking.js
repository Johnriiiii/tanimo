import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';
import { showToast } from '../../utils/toast';

const DeliveryStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
};

const TrackDelivery = ({ route, navigation }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the delivery ID from navigation params
  const deliveryId = route.params?.deliveryId;

  useEffect(() => {
    if (!deliveryId) {
      showToast('error', 'Error', 'No delivery ID provided');
      navigation.goBack();
      return;
    }
    fetchDeliveryDetails();
  }, [deliveryId]);

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('vendorToken') || await AsyncStorage.getItem('userToken');
      console.log('Fetching delivery details for ID:', deliveryId);
      console.log('API Base URL:', API_BASE_URL);
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/delivery/${deliveryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch delivery details: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed delivery API response:', data);
      setDelivery(data.delivery || data); // Handle both {delivery: {...}} and direct delivery object
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return '#4CAF50'; // Green
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return '#2196F3'; // Blue
      case DeliveryStatus.SHIPPED:
        return '#FF9800'; // Orange
      case DeliveryStatus.PROCESSING:
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Grey
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return 'Pending';
      case DeliveryStatus.PROCESSING:
        return 'Processing';
      case DeliveryStatus.SHIPPED:
        return 'Shipped';
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case DeliveryStatus.DELIVERED:
        return 'Delivered';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDeliveryDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No delivery information found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Delivery Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Status</Text>
        <View style={styles.statusContainer}>
          {Object.values(DeliveryStatus).map((status, index, array) => {
            const isCompleted = delivery.status === status || 
              array.indexOf(delivery.status) > array.indexOf(status);
            const isCurrent = delivery.status === status;

            return (
              <View key={status} style={styles.statusItem}>
                <View style={styles.statusLine}>
                  <View
                    style={[
                      styles.statusDot,
                      isCompleted && { backgroundColor: getStatusColor(status) },
                      isCurrent && styles.currentStatusDot,
                    ]}
                  />
                  {index < array.length - 1 && (
                    <View
                      style={[
                        styles.statusConnector,
                        isCompleted && { backgroundColor: getStatusColor(status) },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      isCurrent && {
                        color: getStatusColor(status),
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                  {isCurrent && delivery.updatedAt && (
                    <Text style={styles.timestampText}>
                      {new Date(delivery.updatedAt).toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Delivery Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Details</Text>
        <View style={styles.detailItem}>
          <MaterialIcons name="local-shipping" size={24} color="#4CAF50" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Tracking Number</Text>
            <Text style={styles.detailValue}>{delivery.trackingNumber || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="location-on" size={24} color="#4CAF50" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Delivery Address</Text>
            <Text style={styles.detailValue}>{delivery.address || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="access-time" size={24} color="#4CAF50" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Expected Delivery</Text>
            <Text style={styles.detailValue}>
              {delivery.expectedDeliveryDate
                ? new Date(delivery.expectedDeliveryDate).toLocaleDateString()
                : 'To be confirmed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Items</Text>
        {delivery.items?.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusContainer: {
    marginVertical: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#fff',
  },
  currentStatusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
  },
  statusConnector: {
    width: 2,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  statusTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrackDelivery;
