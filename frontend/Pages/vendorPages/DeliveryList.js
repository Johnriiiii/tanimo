import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const DeliveryList = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try both possible token keys
      let token = await AsyncStorage.getItem('vendorToken');
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
      }
      
      if (!token) {
        console.log('Checking available keys in AsyncStorage...');
        const keys = await AsyncStorage.getAllKeys();
        console.log('Available keys:', keys);
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${API_BASE_URL}/api/delivery`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', errorText);
        throw new Error(`Failed to fetch deliveries: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);  // Log the response data

      let deliveryData = [];
      if (Array.isArray(data)) {
        deliveryData = data.map(order => ({
          _id: order._id,
          orderId: order.orderNumber,
          status: order.status,
          deliveryAddress: order.deliveryAddress,
          expectedDeliveryDate: order.createdAt,
          customerName: order.customerContact?.name || 'Unknown',
          customerPhone: order.customerContact?.phone || '',
          customerEmail: order.customerContact?.email || '',
          statusHistory: order.statusHistory,
          items: order.items?.map(item => ({
            name: item.vegetable?.name || 'Unknown Item',
            quantity: item.quantity || 0,
            price: item.price || 0
          })) || [],
          totalAmount: order.totalAmount || 0
        }));
      } else if (Array.isArray(data.deliveries)) {
        deliveryData = data.deliveries.map(order => ({
          _id: order._id,
          orderId: order.orderNumber,
          status: order.status,
          deliveryAddress: order.deliveryAddress,
          expectedDeliveryDate: order.createdAt,
          customerName: order.customerContact?.name || 'Unknown',
          customerPhone: order.customerContact?.phone || '',
          customerEmail: order.customerContact?.email || '',
          statusHistory: order.statusHistory,
          items: order.items?.map(item => ({
            name: item.vegetable?.name || 'Unknown Item',
            quantity: item.quantity || 0,
            price: item.price || 0
          })) || [],
          totalAmount: order.totalAmount || 0
        }));
      } else {
        deliveryData = [];
      }
      setDeliveries(deliveryData);
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      console.error('Error fetching deliveries:', {
        message: errorMessage,
        url: `${API_BASE_URL}/api/delivery`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = [
      { key: 'pending', label: 'Pending', color: '#FFA500', icon: 'time-outline' },
      { key: 'picked up', label: 'Picked Up', color: '#2196F3', icon: 'checkmark-circle-outline' },
      { key: 'in transit', label: 'In Transit', color: '#4CAF50', icon: 'car-outline' },
      { key: 'out for delivery', label: 'Out for Delivery', color: '#2196F3', icon: 'bicycle-outline' },
      { key: 'delivered', label: 'Delivered', color: '#4CAF50', icon: 'checkmark-done-circle-outline' },
      { key: 'cancelled', label: 'Cancelled', color: '#FF0000', icon: 'close-circle-outline' }
    ];

    const currentIndex = statuses.findIndex(s => s.key === status?.toLowerCase());
    return { statuses, currentIndex: currentIndex === -1 ? 0 : currentIndex };
  };

  const renderDeliveryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('TrackDelivery', { deliveryId: item._id })}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.orderId}>Order #{item.orderId}</Text>
          <Text style={styles.customerName}>
            {item.customerName}
            {item.customerPhone && ` • ${item.customerPhone}`}
          </Text>
          <Text style={[styles.status, { color: getStatusInfo(item.status).statuses.find(s => s.key === item.status?.toLowerCase())?.color || '#757575' }]}>
            {item.status}
          </Text>
          {item.items && item.items.length > 0 && (
            <Text style={styles.itemCount}>{item.items.length} items • ${item.totalAmount}</Text>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#757575" />
        </View>
      </View>

      <View style={styles.deliveryDetails}>
        <View style={styles.timelineContainer}>
          {getStatusInfo(item.status).statuses.map((status, index) => {
            const isCompleted = index <= getStatusInfo(item.status).currentIndex;
            const isLast = index === getStatusInfo(item.status).statuses.length - 1;
            
            return (
              <View key={status.key} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isCompleted ? status.color : '#E0E0E0' }
                  ]}>
                    <Ionicons
                      name={status.icon}
                      size={16}
                      color="#FFF"
                    />
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: isCompleted ? status.color : '#E0E0E0' }
                    ]} />
                  )}
                </View>
                <Text style={[
                  styles.timelineText,
                  { color: isCompleted ? '#333' : '#757575' }
                ]}>
                  {status.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.detailRow, styles.addressContainer]}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>
            {item.deliveryAddress ? 
              `${item.deliveryAddress.street}, ${item.deliveryAddress.city}, ${item.deliveryAddress.state} ${item.deliveryAddress.postalCode}` 
              : 'Address not specified'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>
            {new Date(item.expectedDeliveryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveries}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchDeliveries}
        >
          <Ionicons name="refresh-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchDeliveries}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#757575" />
            <Text style={styles.emptyText}>No deliveries found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
  },
  deliveryDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  timelineContainer: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    height: 24,
    position: 'absolute',
    top: 28,
    left: 13,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    paddingTop: 4,
  },
  addressContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    marginTop: 8,
  },
});

export default DeliveryList;