import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  Pressable,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import API_BASE_URL from "../../utils/api";

const VegetableManagement = ({ navigation }) => {
  // State declarations
  const [vegetables, setVegetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    description: '',
    isAvailable: true
  });

  // Configure axios instance with interceptors
  const authAxios = axios.create({
    baseURL: API_BASE_URL,
  });

  // Request interceptor to add token
  authAxios.interceptors.request.use(
    async (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle 401 errors
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await handleLogout();
      }
      return Promise.reject(error);
    }
  );

  // Load user data and token on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [userData, userToken] = await AsyncStorage.multiGet(['userData', 'userToken']);
        if (userData[1]) setUser(JSON.parse(userData[1]));
        if (userToken[1]) setToken(userToken[1]);
      } catch (error) {
        console.error('Failed to load user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
  }, []);

  // Load vegetables when user or token changes
  useEffect(() => {
    if (user && token) {
      fetchVegetables();
    }
  }, [user, token]);

  const fetchVegetables = async () => {
    try {
      setIsLoading(true);
      const response = await authAxios.get('/vegetables', {
        params: {
          gardener: user._id // Only fetch vegetables for the current gardener
        }
      });
      setVegetables(response.data.data.vegetables);
    } catch (error) {
      handleApiError(error, 'Failed to fetch vegetables');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchVegetables();
  };

  const handleEditVegetable = (vegetable) => {
    setSelectedVegetable(vegetable);
    setEditForm({
      name: vegetable.name,
      category: vegetable.category,
      quantity: vegetable.quantity.toString(),
      price: vegetable.price.toString(),
      description: vegetable.description,
      isAvailable: vegetable.isAvailable
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateVegetable = async () => {
    if (!validateVegetable(editForm)) return;

    try {
      setIsLoading(true);
      const response = await authAxios.patch(`/vegetables/${selectedVegetable._id}`, {
        ...editForm,
        quantity: parseInt(editForm.quantity),
        price: parseFloat(editForm.price)
      });

      // Update the local state
      setVegetables(vegetables.map(veg => 
        veg._id === selectedVegetable._id ? response.data.data.vegetable : veg
      ));

      setIsEditModalVisible(false);
      Alert.alert('Success', 'Vegetable updated successfully');
    } catch (error) {
      handleApiError(error, 'Failed to update vegetable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVegetable = async (vegetableId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this vegetable?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => confirmDelete(vegetableId),
          style: 'destructive'
        }
      ]
    );
  };

const confirmDelete = async (vegetableId) => {
  if (!vegetableId) {
    Alert.alert('Error', 'Invalid vegetable ID');
    return;
  }

  try {
    setIsLoading(true);

    // Send delete request
    await authAxios.delete(`/vegetables/${vegetableId}`);

    // Remove from local state
    setVegetables(prev => prev.filter(veg => veg._id !== vegetableId));

    Alert.alert('Success', 'Vegetable deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    
    // Handle error more gracefully
    const message =
      error?.response?.data?.message || 'Failed to delete vegetable. Please try again.';
    Alert.alert('Error', message);

  } finally {
    setIsLoading(false);
  }
};


  // Helper functions
  const validateVegetable = (formData) => {
    if (!formData.name || !formData.category || 
        !formData.quantity || !formData.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    return true;
  };

  const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      Alert.alert('Session Expired', 'Please login again');
    } else {
      Alert.alert('Error', error.response?.data?.message || defaultMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'isAuthenticated']);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Render item for FlatList
  const renderVegetableItem = ({ item }) => (
    <View style={styles.vegetableCard}>
      {/* Vegetable Image */}
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.vegetableImage}
          resizeMode="cover"
          onError={() => console.log('Failed to load image')}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon name="image" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      
      <View style={styles.vegetableHeader}>
        <Text style={styles.vegetableName}>{item.name}</Text>
        <Text style={styles.vegetableCategory}>{item.category}</Text>
      </View>
      
      <View style={styles.vegetableDetails}>
        <Text>Quantity: {item.quantity}</Text>
        <Text>Price: ${item.price.toFixed(2)}</Text>
        <Text>Status: {item.isAvailable ? 'Available' : 'Unavailable'}</Text>
      </View>
      
      {item.description && (
        <Text style={styles.vegetableDescription}>{item.description}</Text>
      )}
      
      <View style={styles.vegetableActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditVegetable(item)}
        >
          <Icon name="edit" size={18} color="white" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteVegetable(item._id)}
        >
          <Icon name="delete" size={18} color="white" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // UI Components
  if (!user || !token) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vegetables</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Icon name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : vegetables.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="info-outline" size={48} color="#888" />
          <Text style={styles.emptyText}>No vegetables found</Text>
          <Text style={styles.emptySubText}>Add some vegetables to get started</Text>
        </View>
      ) : (
        <FlatList
          data={vegetables}
          renderItem={renderVegetableItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Vegetable</Text>
            
            {/* Show current image in edit modal */}
            {selectedVegetable?.image && (
              <Image 
                source={{ uri: selectedVegetable.image }} 
                style={styles.modalImage}
                resizeMode="cover"
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Vegetable Name*"
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Category* (e.g., Leafy, Root)"
              value={editForm.category}
              onChangeText={(text) => setEditForm({...editForm, category: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Quantity*"
              keyboardType="numeric"
              value={editForm.quantity}
              onChangeText={(text) => setEditForm({...editForm, quantity: text.replace(/[^0-9]/g, '')})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Price*"
              keyboardType="numeric"
              value={editForm.price}
              onChangeText={(text) => setEditForm({...editForm, price: text.replace(/[^0-9.]/g, '')})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={3}
              value={editForm.description}
              onChangeText={(text) => setEditForm({...editForm, description: text})}
            />
            
            <View style={styles.switchContainer}>
              <Text>Available:</Text>
              <Switch
                value={editForm.isAvailable}
                onValueChange={(value) => setEditForm({...editForm, isAvailable: value})}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={editForm.isAvailable ? "#4CAF50" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdateVegetable}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Update</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  vegetableCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  vegetableImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    marginTop: 8,
  },
  vegetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vegetableName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vegetableCategory: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegetableDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vegetableDescription: {
    color: '#666',
    marginBottom: 12,
  },
  vegetableActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    padding: 10,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VegetableManagement;