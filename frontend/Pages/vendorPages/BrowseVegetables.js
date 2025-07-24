import React, { useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
  SlideInRight,
} from 'react-native-reanimated';
import API_BASE_URL, { api } from '../../utils/api';
import { MaterialIcons } from '@expo/vector-icons';
import { showToast } from '../../utils/toast';

const { width } = Dimensions.get('window');

const BrowseVegetables = ({ navigation }) => {
  const theme = useTheme();
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const checkAuthAndRedirect = async () => {
    try {
      const [token, userData] = await AsyncStorage.multiGet(['userToken', 'userData']);
      if (!token[1] || !userData[1]) {
        navigation.replace('Login');
        return false;
      }
      return token[1];
    } catch (err) {
      navigation.replace('Login');
      return false;
    }
  };

  const defaultImage = require('../../assets/tomato.png');

const fetchVegetables = async (retryCount = 0) => {
    setError(null);
    setLoading(true);
    setRefreshing(true);
    
    try {
      const token = await AsyncStorage.getItem('vendorToken') || await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      console.log('Fetching from:', `${API_BASE_URL}/vegetables`);
      const response = await fetch(`${API_BASE_URL}/vegetables`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch vegetables: ${response.status} ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed data:', data);

      // Transform the data to handle both array and object response formats
      const vegetablesArray = Array.isArray(data) ? data : 
                            data.data?.vegetables ? data.data.vegetables :
                            data.vegetables ? data.vegetables : [];

      // Transform the data to include default images if needed
      const transformedVegetables = vegetablesArray.map(veg => ({
        _id: veg._id, // Keep the original MongoDB ObjectId
        name: veg.name || 'Unnamed Vegetable',
        category: veg.category || 'Uncategorized',
        quantity: parseInt(veg.quantity) || 0,
        price: parseFloat(veg.price) || 0,
        description: veg.description || '',
        isAvailable: veg.isAvailable !== false && (parseInt(veg.quantity) || 0) > 0,
        gardener: veg.gardener || { name: 'Unknown Gardener' },
        image: veg.image ? { uri: veg.image } : defaultImage,
        createdAt: veg.createdAt
      }));

      console.log('Transformed vegetables:', transformedVegetables);
      setVegetables(transformedVegetables);
      setError(null);
      
      // Cache the vegetables data
      await AsyncStorage.setItem('localVegetables', JSON.stringify(transformedVegetables));
    } catch (err) {
      console.error('Error loading vegetables:', err);
      let errorMessage = 'Failed to load vegetables';
      
      if (err.message.includes('login') || err.message.includes('401')) {
        navigation.replace('Login');
        return;
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid data format from server';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err.message.includes('Unable to connect to server')) {
        errorMessage = 'Server is unreachable. Please try again later.';
      }

      setError(errorMessage);
      
      // Try to load cached data if network request fails
      try {
        const storedVegetables = await AsyncStorage.getItem('localVegetables');
        if (storedVegetables) {
          const cachedVegetables = JSON.parse(storedVegetables);
          setVegetables(cachedVegetables);
          showToast('warning', 'Using Cached Data', 'Showing previously loaded vegetables');
        }
      } catch (cacheError) {
        console.error('Error loading cached vegetables:', cacheError);
      }
      
      // Retry logic for network errors
      if (retryCount < 3 && err.message.includes('Network')) {
        setTimeout(() => fetchVegetables(retryCount + 1), 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
};
  useEffect(() => {
    fetchVegetables();
  }, []);

  const onRefresh = React.useCallback(() => {
    fetchVegetables();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme?.colors?.primary ?? '#4CAF50'} />
        <Text style={styles.loadingText}>Loading vegetables...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <Animated.View 
        entering={FadeInDown} 
        exiting={FadeOutUp}
        style={styles.centered}
      >
        <MaterialIcons name="error-outline" size={64} color={theme?.colors?.error ?? '#FF5252'} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchVegetables}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const renderVegetableItem = ({ item, index }) => {
    const isAvailable = item.isAvailable && item.quantity > 0;
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 100)}
        layout={Layout.springify()}
        style={styles.card}
      >
        <Image
          source={item.image}
          style={styles.vegetableImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.vegetableName}>{item.name}</Text>
          <Text style={styles.vegetableCategory}>{item.category || 'Uncategorized'}</Text>
          <Text style={styles.vegetablePrice}>₱{item.price.toFixed(2)}/kg</Text>
          <View style={styles.stockContainer}>
            <Text style={[
              styles.stockText,
              { color: isAvailable ? '#4CAF50' : '#FF5252' }
            ]}>
              {isAvailable ? 'In Stock' : 'Out of Stock'}
            </Text>
            <Text style={styles.quantityText}>
              Qty: {item.quantity}kg
            </Text>
          </View>
          {item.gardener && item.gardener.name && (
            <Text style={styles.gardenerInfo}>
              Gardener: {item.gardener.name}
            </Text>
          )}
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.orderButton,
            { backgroundColor: isAvailable ? '#4CAF50' : '#ccc' }
          ]}
          disabled={!isAvailable}
          onPress={async () => {
            if (!isAvailable) {
              showToast('error', 'Error', 'This item is currently unavailable');
              return;
            }

            try {
              // Check authentication
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                Alert.alert(
                  'Authentication Required',
                  'Please login to place an order',
                  [
                    {
                      text: 'Login',
                      onPress: () => navigation.navigate('Login')
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    }
                  ]
                );
                return;
              }

              // Get user data and validate
              const userDataStr = await AsyncStorage.getItem('userData');
              if (!userDataStr) {
                showToast('error', 'Error', 'User profile not found');
                return;
              }

              const userData = JSON.parse(userDataStr);
              const hasCompleteAddress = userData && 
                userData.address && 
                typeof userData.address === 'object' && 
                userData.address.street && 
                userData.address.city && 
                userData.address.country;

              if (!hasCompleteAddress) {
                Alert.alert(
                  'Profile Incomplete',
                  'Please complete your profile with delivery address before placing an order.',
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

              // Validate item availability one more time
              if (item.quantity <= 0) {
                showToast('error', 'Error', 'Item is out of stock');
                return;
              }

              // Navigate to order details with validated data
              navigation.navigate('OrderDetails', {
                vegetable: {
                  ...item,
                  price: parseFloat(item.price),
                  quantity: parseInt(item.quantity),
                  maxQuantity: parseInt(item.quantity), // Add max quantity for order limit
                  userId: userData._id,
                  userAddress: userData.address,
                  orderDate: new Date().toISOString()
                }
              });

            } catch (err) {
              console.error('Order error:', err);
              showToast('error', 'Error', 'Failed to process order. Please try again.');
            }
          }}
        >
          <Text style={styles.orderButtonText}>
            {isAvailable ? 'Order Now' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={vegetables}
        renderItem={renderVegetableItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        numColumns={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme?.colors?.primary ?? '#4CAF50']}
          />
        }
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Animated.View
            entering={FadeInDown}
            style={styles.emptyContainer}
          >
            <MaterialIcons name="local-florist" size={64} color={theme?.colors?.primary ?? '#4CAF50'} />
            <Text style={styles.emptyText}>No vegetables available</Text>
          </Animated.View>
        }
      />
    </View>
  );
};

export default BrowseVegetables;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    flex: 1,
    margin: 8,
    maxWidth: '32%',
  },
  vegetableImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 8,
  },
  vegetableName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  vegetableCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  vegetablePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  orderButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  gardenerInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
});
