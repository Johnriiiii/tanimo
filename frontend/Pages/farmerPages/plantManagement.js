import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from "../../utils/api";

const SellVegetable = ({ navigation }) => {
  // State declarations
  const [newVegetable, setNewVegetable] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    description: '',
    isAvailable: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

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

  const handleSellVegetable = async () => {
    if (!validateVegetable()) return;

    try {
      setIsLoading(true);
      await authAxios.post('/vegetable', {
        ...newVegetable,
        user: user._id,
        quantity: parseInt(newVegetable.quantity),
        price: parseFloat(newVegetable.price)
      });

      resetForm();
      Alert.alert('Success', 'Vegetable listed for sale successfully');
    } catch (error) {
      handleApiError(error, 'Failed to list vegetable for sale');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const validateVegetable = () => {
    if (!newVegetable.name || !newVegetable.category || 
        !newVegetable.quantity || !newVegetable.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setNewVegetable({
      name: '',
      category: '',
      quantity: '',
      price: '',
      description: '',
      isAvailable: true
    });
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sell Your Vegetable</Text>
      
      {/* Sell Vegetable Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Vegetable Name*"
          value={newVegetable.name}
          onChangeText={(text) => setNewVegetable({...newVegetable, name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Category* (e.g., Leafy, Root)"
          value={newVegetable.category}
          onChangeText={(text) => setNewVegetable({...newVegetable, category: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Quantity*"
          keyboardType="numeric"
          value={newVegetable.quantity}
          onChangeText={(text) => setNewVegetable({...newVegetable, quantity: text.replace(/[^0-9]/g, '')})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price*"
          keyboardType="numeric"
          value={newVegetable.price}
          onChangeText={(text) => setNewVegetable({...newVegetable, price: text.replace(/[^0-9.]/g, '')})}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          multiline
          numberOfLines={3}
          value={newVegetable.description}
          onChangeText={(text) => setNewVegetable({...newVegetable, description: text})}
        />
        
        <View style={styles.switchContainer}>
          <Text>Available:</Text>
          <Switch
            value={newVegetable.isAvailable}
            onValueChange={(value) => setNewVegetable({...newVegetable, isAvailable: value})}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={newVegetable.isAvailable ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.addButton]} 
          onPress={handleSellVegetable}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>List Vegetable for Sale</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
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
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SellVegetable;