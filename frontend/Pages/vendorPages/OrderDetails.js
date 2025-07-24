import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../../utils/toast';
import API_BASE_URL, { checkApiConnection } from '../../utils/api';

const OrderDetails = ({ route, navigation }) => {
  const routeVegetable = route.params?.vegetable;
  const [vegetable, setVegetable] = useState(routeVegetable || {});
  const [quantity, setQuantity] = useState('1');
  const [totalAmount, setTotalAmount] = useState(routeVegetable?.price || 0);
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cleanup function to handle unmounting
  useEffect(() => {
    let mounted = true;

    const cleanup = () => {
      mounted = false;
    };

    return cleanup;
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        if (!routeVegetable?._id) {
          console.error('No vegetable ID provided in route params');
          throw new Error('Invalid vegetable data');
        }

        // Always fetch fresh vegetable data to ensure we have current stock levels
        const token = await AsyncStorage.getItem('vendorToken') || await AsyncStorage.getItem('userToken');
        if (!token || !mounted) {
          throw new Error('Authentication required');
        }
        console.log('Using auth token:', token.substring(0, 10) + '...');

        // Construct and log the request URL
        const requestUrl = `${API_BASE_URL}/vegetables/${routeVegetable._id}`;
        console.log('Making API request to:', requestUrl);
        console.log('Vegetable ID:', routeVegetable._id);
        
        const response = await fetch(requestUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Raw vegetable response:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to fetch vegetable details: ${response.status} ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed vegetable response:', JSON.stringify(data, null, 2));
          
          // Only update state if component is still mounted
          if (!mounted) return;

          // Extract the vegetable data from the response structure
          if (data.status === 'success' && data.data && data.data.vegetable) {
            const updatedVegetable = data.data.vegetable;
            console.log('Extracted vegetable data:', JSON.stringify(updatedVegetable, null, 2));
            
            if (!updatedVegetable._id || !updatedVegetable.name || !updatedVegetable.price) {
              console.error('Missing required vegetable data:', updatedVegetable);
              throw new Error('Incomplete vegetable data received');
            }

            setVegetable(updatedVegetable);
            calculateTotal(quantity, updatedVegetable.price);
          } else {
            console.error('Unexpected response structure:', data);
            throw new Error('Invalid response format from server');
          }
        } catch (e) {
          console.error('Failed to parse or extract vegetable response:', e);
          throw new Error('Invalid response format from server');
        }
        
          // Load address and check connection
          if (mounted) {
            await loadUserAddress();
          }        if (mounted) {
          const isConnected = await checkApiConnection();
          if (!isConnected) {
            Alert.alert(
              'Connection Warning',
              'Cannot connect to the server. Some features may be limited.',
              [{ text: 'Continue Anyway' }]
            );
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) {
          Alert.alert(
            'Error',
            'Failed to load vegetable details. Please try again.',
            [{ 
              text: 'Go Back',
              onPress: () => navigation.goBack()
            }]
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const loadUserAddress = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { address } = JSON.parse(userData);
        setAddress(address);
      }
    } catch (err) {
      console.error('Error loading address:', err);
    }
  };

  const calculateTotal = (qty, price = vegetable?.price) => {
    const parsedQty = parseFloat(qty) || 0;
    const parsedPrice = parseFloat(price) || 0;
    setTotalAmount((parsedQty * parsedPrice).toFixed(2));
  };

  const handleQuantityChange = (text) => {
    // Only allow numbers and validate against available quantity
    const newQty = text.replace(/[^0-9]/g, '');
    if (newQty === '' || parseInt(newQty) === 0) {
      setQuantity('1');
      calculateTotal('1');
    } else if (parseInt(newQty) > vegetable.quantity) {
      setQuantity(vegetable.quantity.toString());
      calculateTotal(vegetable.quantity);
      showToast('error', 'Error', 'Quantity cannot exceed available stock');
    } else {
      setQuantity(newQty);
      calculateTotal(newQty);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('Vegetable data:', {
      id: vegetable._id,
      type: typeof vegetable._id,
      isValidMongoId: typeof vegetable._id === 'string' && /^[0-9a-fA-F]{24}$/.test(vegetable._id),
      fullVegetable: vegetable
    });

    if (!address) {
      Alert.alert(
        'Address Required',
        'Please update your address in profile settings before placing an order.',
        [
          {
            text: 'Update Profile',
            onPress: () => navigation.navigate('VendorDrawer', { screen: 'VendorSettings' })
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    try {
      // Get the authentication token
      let authToken = await AsyncStorage.getItem('vendorToken');
      if (!authToken) {
        authToken = await AsyncStorage.getItem('userToken');
        if (!authToken) {
          Alert.alert('Error', 'Please login again');
          navigation.navigate('Login');
          return;
        }
      }

      // Validate vegetable ID
      if (!vegetable._id) {
        throw new Error('Invalid vegetable data: Missing vegetable ID');
      }

      // Ensure the ID is in the correct format
      if (typeof vegetable._id === 'string' && !vegetable._id.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('Invalid vegetable ID format:', vegetable._id);
        throw new Error('Invalid vegetable ID format');
      }

      // Format order data according to the schema
      const orderData = {
        items: [{
          vegetable: vegetable._id.toString(), // Ensure it's a string
          quantity: parseInt(quantity),
          price: parseFloat(vegetable.price)
        }],
        totalAmount: parseFloat(totalAmount),
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.postalCode || address.zipCode
        },
        status: 'Pending'
      };

      console.log('Sending order request:', {
        url: `${API_BASE_URL}/orders`,
        orderData
      });
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('Response status:', response.status);
      
      // First get the raw response text
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        console.error('Server response:', responseText);
        if (responseText.includes('<!DOCTYPE html>')) {
          throw new Error('Server is returning HTML instead of JSON. The API endpoint might be incorrect.');
        } else {
          throw new Error('Server returned invalid JSON. The API might be down or unreachable.');
        }
      }

      if (!response.ok) {
        let errorMessage = 'Failed to place order';
        if (data.error) {
          errorMessage = data.error;
          if (data.details && data.details.length > 0) {
            errorMessage += '\n' + data.details.map(d => d.message).join('\n');
          }
        }
        throw new Error(errorMessage || `Failed to place order: ${response.status} ${response.statusText}`);
      }

      showToast('success', 'Success', 'Order placed successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error placing order:', err);
      
      // Show a more user-friendly error message
      let errorMessage = err.message;
      if (errorMessage.includes('vegetable ID')) {
        errorMessage = 'There was a problem with the product information. Please try again or contact support.';
      } else if (errorMessage.includes('quantity')) {
        errorMessage = 'The requested quantity is no longer available.';
      }
      
      Alert.alert(
        'Error',
        errorMessage || 'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Helper function to determine the image source
  const getImageSource = (vegetable) => {
    if (!vegetable) return null;
    
    if (typeof vegetable.image === 'string' && vegetable.image.startsWith('http')) {
      // If it's a URL (from Cloudinary)
      return { uri: vegetable.image };
    } else if (vegetable.image) {
      // If it's a local asset reference
      return vegetable.image;
    }
    // Default image
    return require('../../assets/default-profile.png');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading vegetable details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Product Image */}
        <Image
          source={getImageSource(vegetable)}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{vegetable.name}</Text>
          <Text style={styles.gardenerName}>{vegetable.gardener?.name || 'Local Farmer'}</Text>
          
          <Text style={styles.price}>₱{vegetable.price}/kg</Text>
          
          {/* Quantity Input */}
          <View style={styles.quantityContainer}>
            <Text style={styles.label}>Quantity (kg)</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <Text style={styles.availableText}>
            Available: {vegetable.quantity}kg
          </Text>

          {/* Total Amount */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₱{totalAmount}</Text>
          </View>

          {!address && (
            <Text style={styles.warningText}>
              Please update your address in profile settings
            </Text>
          )}

          {/* Place Order Button */}
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  detailsContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gardenerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 24,
  },
  quantityContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    width: '100%',
  },
  availableText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  orderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OrderDetails;
