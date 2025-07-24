import React, { useState, useEffect, useCallback } from 'react';
import { 
  Animated,
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import API_BASE_URL from '../../utils/api';
import { showToast } from '../../utils/toast';

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  detailLabel: {
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDetails: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalOrderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statusButtonsContainer: {
    marginTop: 8,
  },
  animatedModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalUpdateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalUpdateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalUpdateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  statusButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderInfo: {
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  customerInfo: {
    marginTop: 4,
  },
  customerName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timelineSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: 14,
    bottom: -6,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
    color: '#666',
  },
});

const formatStatus = (status) => {
  // Server always returns properly formatted status, so we can return it as is
  return status;
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#FFA726';
    case 'picked up':
      return '#2196F3';
    case 'in transit':
      return '#7C4DFF';
    case 'out for delivery':
      return '#00BCD4';
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

// Define allowed status values
const STATUS = {
  PENDING: "Pending",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

// Status transition map
const statusTransitionMap = {
  [STATUS.PENDING.toLowerCase()]: [STATUS.PICKED_UP, STATUS.CANCELLED],
  [STATUS.PICKED_UP.toLowerCase()]: [STATUS.IN_TRANSIT],
  [STATUS.IN_TRANSIT.toLowerCase()]: [STATUS.OUT_FOR_DELIVERY],
  [STATUS.OUT_FOR_DELIVERY.toLowerCase()]: [STATUS.DELIVERED],
  [STATUS.DELIVERED.toLowerCase()]: [],
  [STATUS.CANCELLED.toLowerCase()]: []
};

const Orders = ({ navigation }) => {
  // Animation states
  const [cardAnimVals, setCardAnimVals] = useState([]);
  const [timelineAnimVals, setTimelineAnimVals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which order is being updated

  // Animate cards when orders change
  useEffect(() => {
    const anims = orders.map(() => new Animated.Value(0));
    setCardAnimVals(anims);
    Animated.stagger(120, anims.map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      })
    )).start();
  }, [orders]);

  // Animate timeline events
  useEffect(() => {
    const anims = orders.map(order =>
      (order.timeline ? order.timeline.map(() => new Animated.Value(0)) : [])
    );
    setTimelineAnimVals(anims);
    anims.forEach((timelineArr) => {
      Animated.stagger(80, timelineArr.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )).start();
    });
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/delivery`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server.');
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      // Always use the deliveries array from the backend
      const deliveries = Array.isArray(data.deliveries) ? data.deliveries : (Array.isArray(data) ? data : []);
      const ordersWithTimeline = deliveries.map(order => ({
        ...order,
        orderId: order.orderNumber,
        status: order.status,
        timeline: [
          {
            status: order.status,
            timestamp: order.createdAt || new Date()
          }
        ].concat((order.statusHistory || []).map(history => ({
          ...history,
          status: history.status
        })))
      }));
      setOrders(ordersWithTimeline);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Error', err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus, currentStatus) => {
    if (!orderId || !newStatus) {
      showToast('error', 'Error', 'Invalid order data');
      return;
    }

    // No need to format the status as it should already be in the correct format
    const formattedNewStatus = newStatus;
    const formattedCurrentStatus = currentStatus;

    if (formattedNewStatus === formattedCurrentStatus) {
      showToast('info', 'Info', 'Order is already in this status');
      return;
    }

    try {
      console.log('Starting status update:', { orderId, newStatus, currentStatus });
      setUpdatingStatus(orderId);
      
      const result = await updateOrderStatus(orderId, newStatus);
      console.log('Update completed:', result);
      
      // Show success message
      showToast('success', 'Success', `Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Update failed:', err);
      showToast('error', 'Error', err.message || 'Failed to update order status');
      
      // Refresh orders list even on error to ensure we have the latest state
      await fetchOrders();
    } finally {
      setUpdatingStatus(null);
    }
  };

 const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const token = await AsyncStorage.getItem('jwt');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    // Only send the status field as required by backend
    const updateData = { status: newStatus };
    console.log('PATCH updateData:', JSON.stringify(updateData, null, 2));
    const endpoint = `${API_BASE_URL}/api/delivery/${orderId}/status`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { error: 'Invalid JSON', raw: responseText };
    }
    console.log('Server response:', responseData);
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || 'Failed to update status';
      console.error('Status update failed:', errorMessage);
      throw new Error(errorMessage);
    }
    showToast('success', 'Success', `Order status updated to ${newStatus}`);
    await fetchOrders();
    return responseData;
  } catch (err) {
    showToast('error', 'Error', err.message);
  }
};


  const getNextStatus = (currentStatus) => {
    // Define transitions using STATUS values
    const statusTransitions = {
      [STATUS.PENDING]: [STATUS.PICKED_UP, STATUS.CANCELLED],
      [STATUS.PICKED_UP]: [STATUS.IN_TRANSIT],
      [STATUS.IN_TRANSIT]: [STATUS.OUT_FOR_DELIVERY],
      [STATUS.OUT_FOR_DELIVERY]: [STATUS.DELIVERED],
      [STATUS.DELIVERED]: [],
      [STATUS.CANCELLED]: []
    };

    // Get exact status match
    const normalized = currentStatus.toLowerCase().replace(/_/g, ' ');
    const exactStatus = Object.values(VALID_STATUSES).find(
      status => status.toLowerCase() === normalized
    );

    return statusTransitions[exactStatus]?.[0] || null;
  };
  
  const handleModalUpdate = async () => {
    if (selectedOrder && selectedStatus) {
      try {
        // Compare the statuses as is, since they should already be in the correct format
        if (selectedOrder.status === selectedStatus) {
          showToast('info', 'Info', 'Order is already in this status');
          return;
        }
        
        console.log('Modal update starting:', { 
          orderId: selectedOrder._id, 
          newStatus: selectedStatus,
          orderNumber: selectedOrder.orderNumber 
        });
        setUpdatingStatus(selectedOrder._id);
        await updateOrderStatus(selectedOrder._id, selectedStatus);
        setModalVisible(false);
        await fetchOrders(); // Refresh the list after successful update
      } catch (err) {
        console.error('Modal update failed:', err);
        showToast('error', 'Error', err.message);
      } finally {
        setUpdatingStatus(null);
      }
    }
  };

  const renderStatusBadge = (status) => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>
          Order #{item.orderNumber ? item.orderNumber.slice(-6) : item._id.slice(-6)}
        </Text>
        {renderStatusBadge(item.status)}
      </View>

      <View style={styles.orderDetails}>
        {item.customerContact && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Customer: </Text>
              {item.customerContact.name}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Contact: </Text>
            {item.customerContact?.phone || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.detailText} numberOfLines={2}>
            <Text style={styles.detailLabel}>Delivery to: </Text>
            {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
          </Text>
        </View>

        {getNextStatus(item.status) && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleUpdateStatus(item.orderNumber || item._id, getNextStatus(item.status), item.status)}
            disabled={updatingStatus === (item.orderNumber || item._id)}
          >
            {updatingStatus === item._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="update" size={20} color="#fff" />
                <Text style={styles.updateButtonText}>
                  Update to {getNextStatus(item.status)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
      >
        {orders.map((order) => (
          <View key={order.orderNumber || order._id} style={styles.simpleOrderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order #{order.orderNumber ? order.orderNumber : order._id}</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>Customer Name: {order.customerName || (order.customerContact && typeof order.customerContact === 'object' ? order.customerContact.name : order.customerContact) || '-'}</Text>
              <Text style={styles.customerAddress}>Address: {order.address?.street || order.deliveryAddress?.street || '-'}, {order.address?.city || order.deliveryAddress?.city || '-'}</Text>
              <Text style={styles.customerAddress}>Gardener: {typeof order.gardener === 'object' ? order.gardener._id || '-' : order.gardener || '-'}</Text>
              <Text style={styles.customerAddress}>Customer: {typeof order.customer === 'object' ? order.customer._id || '-' : order.customer || '-'}</Text>
              <Text style={styles.customerAddress}>Vendor: {typeof order.vendor === 'object' ? order.vendor._id || '-' : order.vendor || '-'}</Text>
              <Text style={styles.customerAddress}>Customer Contact: {order.customerContact && typeof order.customerContact === 'object' ? (order.customerContact._id || '-') : (order.customerContact || '-')}</Text>
              <Text style={styles.customerAddress}>Total Amount: {order.totalAmount || '-'}</Text>
              <Text style={styles.customerAddress}>Status: {order.status}</Text>
              <Text style={styles.customerAddress}>Created At: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</Text>
              <Text style={styles.customerAddress}>Updated At: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}</Text>
              <Text style={styles.customerAddress}>_id: {order._id}</Text>
            </View>
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items:</Text>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>Vegetable: {item.vegetable || '-'}</Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity || '-'}</Text>
                        <Text style={styles.itemPrice}>Price: {item.price || '-'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.itemName}>No items</Text>
                )}
              </View>
              <View style={styles.timelineSection}>
                <Text style={styles.timelineLabel}>Timeline:</Text>
                {Array.isArray(order.timeline) && order.timeline.length > 0 ? (
                  order.timeline.map((event, idx) => (
                    <View key={idx} style={styles.timelineEvent}>
                      <View style={styles.timelineLeft}>
                        <View style={styles.timelineDot} />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineStatus}>{event.status}</Text>
                        <Text style={styles.timelineTime}>{event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.timelineStatus}>No timeline events</Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              {renderStatusBadge(order.status)}
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => {
                  setSelectedOrder(order);
                  setSelectedStatus(order.status);
                  setModalVisible(true);
                }}
                disabled={updatingStatus === (order.orderNumber || order._id)}
              >
                {updatingStatus === (order.orderNumber || order._id) ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="update" size={20} color="#fff" />
                    <Text style={styles.updateButtonText}>Update Status</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {orders.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.animatedModalContent}>
            <LinearGradient colors={["#4CAF50", "#388E3C"]} style={styles.modalHeader}>
              <Ionicons name="create-outline" size={28} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.modalTitle}>Update Order Status</Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <Text style={styles.modalOrderNumber}>Order #{selectedOrder?.orderNumber ? selectedOrder.orderNumber.slice(-6) : selectedOrder?._id?.slice(-6)}</Text>
              <View style={styles.statusButtonsContainer}>
                {[
                  { status: STATUS.PENDING, icon: 'time-outline', display: STATUS.PENDING },
                  { status: STATUS.PICKED_UP, icon: 'archive-outline', display: STATUS.PICKED_UP },
                  { status: STATUS.IN_TRANSIT, icon: 'car-outline', display: STATUS.IN_TRANSIT },
                  { status: STATUS.OUT_FOR_DELIVERY, icon: 'bicycle-outline', display: STATUS.OUT_FOR_DELIVERY },
                  { status: STATUS.DELIVERED, icon: 'checkmark-circle-outline', display: STATUS.DELIVERED },
                  { status: STATUS.CANCELLED, icon: 'close-circle-outline', display: STATUS.CANCELLED }
                ]
                .filter(({ status }) => {
                  if (!selectedOrder) return true;
                  const currentNormalizedStatus = selectedOrder.status?.toLowerCase().replace(/_/g, ' ');
                  const allowedNextStatuses = statusTransitionMap[currentNormalizedStatus] || [];
                  return allowedNextStatuses.includes(status) || status === selectedOrder.status;
                })
                .map(({ status, icon, display }) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      { 
                        backgroundColor: '#f5f5f5',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginVertical: 4,
                        borderRadius: 8
                      },
                      selectedStatus === status && styles.statusButtonSelected
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <View style={[
                      styles.radioButton,
                      selectedStatus === status && styles.radioButtonSelected
                    ]}>
                      {selectedStatus === status && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Ionicons
                      name={icon}
                      size={20}
                      color="#666"
                      style={{ marginHorizontal: 8 }}
                    />
                    <Text style={styles.statusButtonText}>{display}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleModalUpdate}
                  style={[
                    styles.modalUpdateButton,
                    (!selectedStatus || selectedStatus === selectedOrder?.status) && styles.modalUpdateButtonDisabled
                  ]}
                  disabled={!selectedStatus || selectedStatus === selectedOrder?.status}
                >
                  <Text style={styles.modalUpdateText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default Orders;
