import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const { height } = Dimensions.get('window');

const VendorCustomDrawer = ({ navigation, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: '1', title: 'Dashboard', icon: 'home-outline', route: 'VendorHome' },
    { id: '2', title: 'Browse Farmers', icon: 'people-outline', route: 'BrowseFarmers' },
    { id: '3', title: 'Vegetables', icon: 'leaf-outline', route: 'BrowseVegetables' },
    { id: '4', title: 'Orders', icon: 'cart-outline', route: 'VendorOrders' },
    { id: '5', title: 'Delivery Tracking', icon: 'navigate-outline', route: 'TrackDelivery' },
    { id: '6', title: 'Chat', icon: 'chatbubbles-outline', route: 'VendorChat' },
  ];

  const bottomItems = [
    { id: '7', title: 'Settings', icon: 'settings-outline', route: 'VendorSettings' },
    { id: '8', title: 'Help & Support', icon: 'help-circle-outline', route: 'VendorSupport' },
  ];

  useEffect(() => {
    fetchProfile()
  }, []);

const fetchProfile = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken"); // <-- or "vendorToken" if that's what you're using
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Profile fetch failed");

    setProfileData(data.user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    // You can use a toast if available or fallback to console
    // showToast("error", "Profile Error", error.message || "Failed to load profile");
  } finally {
    setLoading(false);
  }
};

  const handleNavigation = (route) => {
    onClose?.();
    navigation.navigate(route);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const performLogout = async () => {
    try {
      onClose?.();
      await AsyncStorage.removeItem('vendorToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderMenuItem = (item, isBottom = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isBottom && styles.bottomMenuItem]}
      onPress={() => handleNavigation(item.route)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={24} color="#4CAF50" />
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const user = profileData || {
    name: 'Vendor',
    email: 'vendor@example.com',
    profilePhoto: null,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <Image
              source={user.profilePhoto 
                ? { uri: user.profilePhoto } 
                : require('../../assets/default-profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.7</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Vendor Menu</Text>
            {menuItems.map(item => renderMenuItem(item))}
          </View>

          {/* Special Offer Banner */}
          <TouchableOpacity
            style={styles.offerBanner}
            onPress={() => handleNavigation('PremiumFarmers')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.1)', 'rgba(46, 125, 50, 0.1)']}
              style={styles.offerGradient}
            >
              <View style={styles.offerContent}>
                <Ionicons name="ribbon" size={32} color="#4CAF50" />
                <View style={styles.offerText}>
                  <Text style={styles.offerTitle}>Premium Farmers</Text>
                  <Text style={styles.offerSubtitle}>Connect with top-rated suppliers</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Menu Items */}
          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            {bottomItems.map(item => renderMenuItem(item, true))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff4757" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    paddingBottom: 25,
    paddingTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
    padding: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  bottomMenuItem: {
    backgroundColor: 'transparent',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
    fontWeight: '500',
  },
  offerBanner: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  offerGradient: {
    padding: 15,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerText: {
    flex: 1,
    marginLeft: 15,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  offerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  bottomSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4757',
    marginLeft: 15,
    fontWeight: '600',
  },
});

export default VendorCustomDrawer;