import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  StatusBar,
  Platform,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VendorCustomDrawer from './vendorCustomDrawer';

const { width, height } = Dimensions.get('window');

const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    if (height >= 812) return 44;
    return 20;
  }
  return StatusBar.currentHeight || 24;
};

const VendorHomepage = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Sample data for featured vegetables
  const featuredVegetables = [
    {
      id: '1',
      title: 'Organic Kale',
      description: 'Freshly harvested leafy greens',
      price: '$2.99/lb',
      image: require('../../assets/apple.png'),
      rating: 4.8,
      farmer: 'Green Valley Farms'
    },
    {
      id: '2',
      title: 'Heirloom Tomatoes',
      description: 'Juicy and flavorful',
      price: '$3.49/lb',
      image: require('../../assets/tomato.png'),
      rating: 4.9,
      farmer: 'Sunny Acres'
    },
    {
      id: '3',
      title: 'Rainbow Carrots',
      description: 'Sweet and colorful',
      price: '$2.79/lb',
      image: require('../../assets/cucumber.png'),
      rating: 4.7,
      farmer: 'Organic Harvest'
    }
  ];

  // Sample top farmers
  const topFarmers = [
    { id: '1', name: 'Green Valley Farms', rating: 4.9, distance: '5 miles', specialty: 'Leafy Greens' },
    { id: '2', name: 'Sunny Acres', rating: 4.8, distance: '8 miles', specialty: 'Tomatoes' },
    { id: '3', name: 'Organic Harvest Co.', rating: 4.7, distance: '12 miles', specialty: 'Root Vegetables' },
  ];

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      setDrawerVisible(false);
    });
  };

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredItem}
      onPress={() => navigation.navigate('VegetableDetail', { item })}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredDescription}>{item.description}</Text>
        <Text style={styles.featuredFarmer}>From: {item.farmer}</Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredPrice}>{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFarmerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.farmerCard}
      onPress={() => navigation.navigate('FarmerDetail', { farmer: item })}
      activeOpacity={0.8}
    >
      <Image 
        source={require('../../assets/default-profile.png')} 
        style={styles.farmerImage} 
      />
      <Text style={styles.farmerName}>{item.name}</Text>
      <Text style={styles.farmerSpecialty}>{item.specialty}</Text>
      <View style={styles.farmerInfo}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.farmerDistance}>📍 {item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                onPress={openDrawer} 
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={28} color="#fff" />
              </TouchableOpacity>
         
              <TouchableOpacity 
                onPress={() => navigation.navigate('VendorSearch')} 
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Welcome back, Vendor!</Text>
            <Text style={styles.headerSubtitle}>Find fresh vegetables today</Text>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Featured Vegetables Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Vegetables</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BrowseVegetables')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredVegetables}
              renderItem={renderFeaturedItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          {/* Top Farmers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Farmers Near You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BrowseFarmers')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topFarmers}
              renderItem={renderFarmerItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.farmersList}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BrowseVegetables')}
              activeOpacity={0.8}
            >
              <Ionicons name="leaf-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Browse Vegetables</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('VendorOrders')}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
          </View>

          {/* Weather Update */}
          <TouchableOpacity 
            style={styles.weatherCard}
            onPress={() => navigation.navigate('Weather')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.weatherGradient}
            >
              <View style={styles.weatherContent}>
                <View>
                  <Text style={styles.weatherTitle}>Weather Update</Text>
                  <Text style={styles.weatherText}>Sunny, 75°F - Perfect for fresh produce!</Text>
                </View>
                <Ionicons name="partly-sunny-outline" size={40} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Drawer Modal */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          {/* Animated Overlay */}
          <Animated.View 
            style={[
              styles.overlay, 
              { 
                opacity: overlayOpacity,
                marginLeft: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            ]}
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={closeDrawer}
            />
          </Animated.View>
          
          {/* Drawer */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <VendorCustomDrawer navigation={navigation} onClose={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingBottom: 30,
    paddingTop: getStatusBarHeight(),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  featuredList: {
    paddingBottom: 10,
  },
  featuredItem: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  featuredInfo: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  featuredFarmer: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    color: '#666',
  },
  farmersList: {
    paddingBottom: 10,
  },
  farmerCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  farmerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  farmerSpecialty: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  farmerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  farmerDistance: {
    fontSize: 10,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  weatherCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  weatherGradient: {
    padding: 20,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  weatherText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Drawer Modal Styles
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContainer: {
    width: width * 0.8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default VendorHomepage;