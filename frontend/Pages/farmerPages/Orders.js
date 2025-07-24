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
      const userType = await AsyncStorage.getItem('userType');
      
      console.log('=== DEBUG ORDER FETCH ===');
      console.log('User Type:', userType);
      console.log('Token present:', !!token);
      if (token) console.log('Token:', token.substring(0, 20) + '...');
      
      if (!token) {
        navigation.replace('Login');
        return;
      }

      console.log('Fetching deliveries from:', `${API_BASE_URL}/api/delivery`);
      console.log('Using complete token:', token);

      // First check if the API is accessible
      try {
        const testResponse = await fetch(API_BASE_URL);
        const testText = await testResponse.text();
        console.log('API root response:', testText.substring(0, 200)); // Log first 200 chars
        if (testText.includes('<!DOCTYPE html>')) {
          throw new Error('API server is returning HTML instead of JSON. Server might be down.');
        }
      } catch (testError) {
        console.error('API connection test failed:', testError);
        throw new Error(`Cannot connect to API server at ${API_BASE_URL}. Server might be down.`);
      }

      // Now try to fetch orders
      console.log('Using token:', token); // Debug log
      
      let response = await fetch(`${API_BASE_URL}/api/delivery`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Log the complete response for debugging
      console.log('Response status:', response.status);
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Get the raw response text first
      const text = await response.text();
      console.log('Raw response:', text.substring(0, 200)); // Log first 200 chars

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Response parsing error. Raw response:', text);
        if (text.includes('<!DOCTYPE html>')) {
          throw new Error('Server returned HTML instead of JSON. The API server might be returning an error page.');
        }
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      console.log('Fetched orders:', data); // Debug log
      
      // Transform the data to include timeline and use orderNumber as orderId
      let ordersWithTimeline = [];
      if (Array.isArray(data)) {
        ordersWithTimeline = data.map(order => ({
          ...order,
          orderId: order.orderNumber, // Use orderNumber as the orderId
          status: order.status, // Keep original status format
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
      } else if (Array.isArray(data.deliveries)) {
        ordersWithTimeline = data.deliveries.map(order => ({
          ...order,
          orderId: order.orderNumber, // Use orderNumber as the orderId
          status: order.status, // Keep original status format
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
      } else {
        ordersWithTimeline = [];
      }
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

    // Find the delivery in our local state and ensure we have the full order data
    console.log('Looking for order with ID:', orderId);
    console.log('Available orders:', orders.map(o => ({ 
      id: o._id, 
      gardener: o.gardener,
      orderNumber: o.orderNumber,
      status: o.status
    })));
    
    const delivery = orders.find(o => o._id === orderId);
    if (!delivery) {
      throw new Error('Order not found in local state');
    }

    // Clone the delivery object to ensure we have all fields
    const deliveryData = JSON.parse(JSON.stringify(delivery));
    
    console.log('Found order:', {
      id: deliveryData._id,
      orderNumber: deliveryData.orderNumber,
      gardener: deliveryData.gardener,
      customerContact: deliveryData.customerContact,
      status: deliveryData.status
    });

    // Get current status from the delivery
    const currentStatus = delivery.status;

    // Normalize status for comparison
    const normalizeStatus = (status) => {
      return status.toLowerCase().replace(/_/g, ' ');
    };

    const normalizedCurrentStatus = normalizeStatus(currentStatus);
    const normalizedNewStatus = normalizeStatus(newStatus);

    // Find exact status match with more robust matching
    const getExactStatus = (normalizedStatus) => {
      const match = Object.values(STATUS).find(s => 
        normalizeStatus(s) === normalizedStatus || 
        s.toLowerCase() === normalizedStatus ||
        s === normalizedStatus
      );
      if (!match) {
        throw new Error(`Invalid status. Allowed statuses are: ${Object.values(STATUS).join(', ')}`);
      }
      return match;
    };

    // Get properly formatted statuses
    let formattedCurrentStatus = currentStatus;
    let formattedNewStatus = newStatus;

    // Only reformat if the status doesn't exactly match one of our valid statuses
    if (!Object.values(STATUS).includes(currentStatus)) {
      formattedCurrentStatus = getExactStatus(normalizedCurrentStatus);
    }
    if (!Object.values(STATUS).includes(newStatus)) {
      formattedNewStatus = getExactStatus(normalizedNewStatus);
    }

    // Check if transition is allowed
    const allowedNextStatuses = statusTransitionMap[formattedCurrentStatus.toLowerCase()] || [];
    if (!allowedNextStatuses.includes(formattedNewStatus)) {
      console.log('Current status:', formattedCurrentStatus);
      console.log('Attempted new status:', formattedNewStatus);
      console.log('Allowed next statuses:', allowedNextStatuses);
      throw new Error(`Cannot update from ${formattedCurrentStatus} to ${formattedNewStatus}. Allowed next statuses are: ${allowedNextStatuses.join(', ')}`);
    }

    // Calculate total amount from items
    const calculatedTotalAmount = delivery.items.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0);

    // Ensure required fields are properly structured and populated
    // First, validate that customer contact exists and has required fields
    // Always provide a valid customerContact object
    // Always build a valid customerContact object
    let safeCustomerContact = {
      name: '',
      phone: '',
      email: ''
    };
    if (delivery.customerContact && typeof delivery.customerContact === 'object') {
      safeCustomerContact.name = typeof delivery.customerContact.name === 'string' && delivery.customerContact.name.trim() !== ''
        ? delivery.customerContact.name.trim()
        : (typeof delivery.customerName === 'string' && delivery.customerName.trim() !== '' ? delivery.customerName.trim() : 'Customer');
      safeCustomerContact.phone = typeof delivery.customerContact.phone === 'string' && delivery.customerContact.phone.trim() !== ''
        ? delivery.customerContact.phone.trim()
        : (delivery.address?.phone || 'N/A');
      safeCustomerContact.email = typeof delivery.customerContact.email === 'string' && delivery.customerContact.email.trim() !== ''
        ? delivery.customerContact.email.trim()
        : (delivery.address?.email || '');
    } else {
      safeCustomerContact.name = typeof delivery.customerName === 'string' && delivery.customerName.trim() !== ''
        ? delivery.customerName.trim()
        : 'Customer';
      safeCustomerContact.phone = delivery.address?.phone || 'N/A';
      safeCustomerContact.email = delivery.address?.email || '';
    }
    // Guarantee customerContact is always present
    if (!safeCustomerContact.name) safeCustomerContact.name = 'Customer';
    if (!safeCustomerContact.phone) safeCustomerContact.phone = 'N/A';
    if (!safeCustomerContact.email) safeCustomerContact.email = '';

    // Strictly validate and filter items
    const originalItems = delivery.items;
    // Defensive items mapping with proper vegetable_id field
    const mappedItems = Array.isArray(originalItems) ? originalItems.map(item => {
      // Extract vegetable ID with better handling of nested objects
      let vegetableId;
      if (item.vegetable) {
        if (typeof item.vegetable === 'object') {
          // If it's an object, try to get the _id
          vegetableId = item.vegetable._id;
        } else {
          // If it's already a string (ID), use it directly
          vegetableId = item.vegetable;
        }
      }
      // Fallbacks for legacy data formats
      if (!vegetableId) {
        vegetableId = item.vegetableId || item.vegetable_id || item._id;
      }

      // Ensure we have a clean string ID
      const cleanVegetableId = typeof vegetableId === 'string' ? vegetableId.trim() : '';
      
      // Get quantity and price, preserve existing values
      const quantity = item.quantity || 0;
      const price = item.price || 0;

      return {
        quantity: !isNaN(quantity) && quantity >= 1 ? quantity : 1,
        price: !isNaN(price) && price >= 0 ? price : 0,
        name: typeof item.name === 'string' ? item.name.trim() : '',
        vegetable: cleanVegetableId, // Backend expects 'vegetable' field
      };
    }) : [];
    // Only keep items with valid vegetable ID, quantity, and price
    const validItems = mappedItems.filter(item => {
      // Debug: Log each item's vegetable field for troubleshooting
      console.log('Processing item:', {
        name: item.name,
        vegetable: item.vegetable,
        quantity: item.quantity,
        price: item.price
      });

      // Ensure vegetable field is a valid ObjectId (24 character hex string)
      const hasValidVegetableId = typeof item.vegetable === 'string' && 
        item.vegetable.match(/^[0-9a-fA-F]{24}$/);
      
      // Ensure quantity is a valid number >= 1
      const hasValidQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity >= 1;
      
      // Ensure price is a valid number >= 0
      const hasValidPrice = typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0;

      // Log validation results for debugging
      if (!hasValidVegetableId) console.log('Invalid vegetable ID for item:', item);
      if (!hasValidQuantity) console.log('Invalid quantity for item:', item);
      if (!hasValidPrice) console.log('Invalid price for item:', item);

      return hasValidVegetableId && hasValidQuantity && hasValidPrice;
    });

    // Debug log
    console.log('Original items:', originalItems);
    console.log('Mapped items:', mappedItems);
    console.log('Valid items after filtering:', validItems);

    // Debug: Log item validation results
    if (!validItems || validItems.length === 0) {
      console.log('Original order items:', originalItems);
      console.log('Items after mapping:', mappedItems);
      
      // Give more specific error message about what's missing
      const itemErrors = mappedItems.map(item => {
        const errors = [];
        if (!item.vegetable?.match(/^[0-9a-fA-F]{24}$/)) errors.push('invalid vegetable ID');
        if (!item.quantity || item.quantity < 1) errors.push('invalid quantity');
        if (!item.price || item.price < 0) errors.push('invalid price');
        return `${item.name || 'Item'}: ${errors.join(', ')}`;
      }).join('; ');
      
      showToast('error', 'Error', `Invalid items: ${itemErrors}`);
      throw new Error('Order items validation failed: ' + itemErrors);
    }

    // Always build a valid deliveryAddress object
    let safeDeliveryAddress = {
      street: '', city: '', state: '', zipCode: '' // Match schema exactly
    };
    if (delivery.deliveryAddress && typeof delivery.deliveryAddress === 'object') {
      safeDeliveryAddress.street = delivery.deliveryAddress.street || '';
      safeDeliveryAddress.city = delivery.deliveryAddress.city || '';
      safeDeliveryAddress.state = delivery.deliveryAddress.state || '';
      safeDeliveryAddress.zipCode = delivery.deliveryAddress.postalCode || delivery.deliveryAddress.zipCode || '';
    } else if (delivery.address && typeof delivery.address === 'object') {
      safeDeliveryAddress.street = delivery.address.street || '';
      safeDeliveryAddress.city = delivery.address.city || '';
      safeDeliveryAddress.state = delivery.address.state || '';
      safeDeliveryAddress.zipCode = delivery.address.postalCode || delivery.address.zipCode || '';
      safeDeliveryAddress.country = delivery.address.country || '';
      safeDeliveryAddress.phone = delivery.address.phone || '';
      safeDeliveryAddress.email = delivery.address.email || '';
    }
    // Ensure delivery address fields match schema
    safeDeliveryAddress = {
      street: safeDeliveryAddress.street || '',
      city: safeDeliveryAddress.city || '',
      state: safeDeliveryAddress.state || '',
      zipCode: safeDeliveryAddress.zipCode || '' // Only include fields defined in schema
    };

    // Calculate and validate total amount
    const safeTotalAmount = validItems.reduce((sum, i) => {
      const itemTotal = Number(i.price) * Number(i.quantity);
      return isNaN(itemTotal) ? sum : sum + itemTotal;
    }, 0);
    
    // Ensure we have a valid number
    if (typeof safeTotalAmount !== 'number' || isNaN(safeTotalAmount) || safeTotalAmount < 0) {
      throw new Error('Cannot calculate valid total amount from items');
    }

    // Get customer contact ID - must be a valid ObjectId reference to User model
    let customerContactId;
    
    // Debug logging for customer contact related fields
    console.log('Customer contact debug:', {
      customerContact: delivery.customerContact,
      gardener: delivery.gardener,
      customerId: delivery.customerId,
      _id: delivery._id
    });

    // Extract the user ID (could be gardener or customer) with detailed validation
    if (deliveryData.gardener && typeof deliveryData.gardener === 'string' && 
        deliveryData.gardener.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Using gardener ID:', deliveryData.gardener);
      customerContactId = deliveryData.gardener;
    } 
    // If no gardener ID, try using the JWT token's user ID since this is a gardener's view
    else {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          // Decode JWT token to get user ID
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id && typeof payload.id === 'string' && 
                payload.id.match(/^[0-9a-fA-F]{24}$/)) {
              console.log('Using authenticated user ID:', payload.id);
              customerContactId = payload.id;
            }
          }
        }
      } catch (e) {
        console.error('Failed to extract user ID from token:', e);
      }
    }

    // Validate the ID format with detailed error reporting
    if (!customerContactId) {
      console.error('Missing customer contact ID. Order data:', {
        gardener: delivery.gardener,
        customerContact: delivery.customerContact,
        customerId: delivery.customerId
      });
      throw new Error('Customer contact ID is missing. Please ensure the order has a valid gardener or customer reference.');
    }
    
    if (typeof customerContactId !== 'string') {
      console.error('Customer contact ID is not a string:', customerContactId);
      throw new Error('Customer contact ID must be a string value.');
    }
    
    if (!customerContactId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Customer contact ID is not a valid MongoDB ObjectId:', customerContactId);
      throw new Error(`Customer contact ID must be a 24-character hexadecimal string. Got: ${customerContactId}`);
    }
    
    console.log('Using validated customer contact ID:', customerContactId);

    // Create a minimal update payload with only the required fields
    const updateData = {
      status: formattedNewStatus,
      customerContact: customerContactId,
      totalAmount: safeTotalAmount,
      items: [{
        vegetable: validItems[0].vegetable,
        quantity: validItems[0].quantity,
        price: validItems[0].price
      }]
    };

    // Log each required field for validation
    console.log('Validation check:', {
      status: updateData.status,
      customerContact: updateData.customerContact,
      totalAmount: updateData.totalAmount,
      firstItem: updateData.items[0]
    });

    // Debug the final payload
    console.log('Final PATCH payload:', JSON.stringify(updateData, null, 2));

    // Debug log outgoing payload
    console.log('PATCH updateData:', JSON.stringify(updateData, null, 2));

    // Pre-request validation with detailed error messages
    const validationErrors = [];
    
    if (!updateData.status || typeof updateData.status !== 'string') {
      validationErrors.push('Invalid status format');
    }
    
    if (!updateData.customerContact || !updateData.customerContact.match(/^[0-9a-fA-F]{24}$/)) {
      validationErrors.push('Invalid customerContact ID format');
    }
    
    if (!updateData.totalAmount || typeof updateData.totalAmount !== 'number' || updateData.totalAmount < 0) {
      validationErrors.push('Invalid totalAmount');
    }
    
    if (!updateData.items || !Array.isArray(updateData.items) || updateData.items.length === 0) {
      validationErrors.push('Items array is required');
    } else {
      const item = updateData.items[0];
      if (!item.vegetable || !item.vegetable.match(/^[0-9a-fA-F]{24}$/)) {
        validationErrors.push('Invalid vegetable ID format');
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        validationErrors.push('Invalid quantity');
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        validationErrors.push('Invalid price');
      }
    }
    
    if (validationErrors.length > 0) {
      throw new Error('Validation failed: ' + validationErrors.join(', '));
    }

    // Log the validated update data
    console.log('Update request data:', updateData);

    // Update the status using the order ID with the correct endpoint
    let response, responseData, responseText;
    try {
      const endpoint = `${API_BASE_URL}/api/delivery/${orderId}/status`;
      console.log('Making PATCH request to:', endpoint);
      
      response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { error: 'Invalid JSON', raw: responseText };
      }
      console.log('Server response:', responseData);
    } catch (e) {
      console.error('Fetch error:', e);
      throw new Error('Network or server error during PATCH');
    }

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || 'Failed to update status';
      console.error('Status update failed:', errorMessage);
      throw new Error(errorMessage);
    }

    // Success!
    showToast('success', 'Success', `Order status updated to ${newStatus}`);

    // Refresh the orders list
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
              <Text style={styles.orderNumber}>Order #{order.orderNumber || order._id}</Text>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerContact?.name}</Text>
                <Text style={styles.customerAddress}>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</Text>
              </View>
            </View>
            {order.items && (
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items:</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemQuantity}>{item.quantity}kg</Text>
                      <Text style={styles.itemPrice}>₱ {item.price?.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.timelineSection}>
              <Text style={styles.timelineLabel}>Timeline:</Text>
              <View style={styles.timelineContainer}>
                {order.timeline?.map((event, index) => (
                  <View key={index} style={styles.timelineEvent}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: getStatusColor(event.status) }]} />
                      {index < order.timeline.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStatus}>{event.status}</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(event.timestamp).toLocaleString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            <TouchableOpacity
            style={[
              styles.updateButton,
              updatingStatus === (order.orderNumber || order._id) && { opacity: 0.7 }
            ]}
            onPress={() => {
              setSelectedOrder(order);
              // Normalize the status when setting it
              const normalizedStatus = order.status
                .split(/[_\s]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              setSelectedStatus(normalizedStatus);
              setModalVisible(true);
            }}
            disabled={updatingStatus === (order.orderNumber || order._id)}
            >
              {updatingStatus === order._id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update Status</Text>
              )}
            </TouchableOpacity>
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
              <Text style={styles.modalOrderNumber}>Order #{selectedOrder?.orderNumber ? selectedOrder.orderNumber.slice(-6) : selectedOrder?._id.slice(-6)}</Text>
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
                  // Only show valid next statuses
                  if (!selectedOrder) return true;
                  const currentNormalizedStatus = selectedOrder.status.toLowerCase().replace(/_/g, ' ');
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
                        }
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
