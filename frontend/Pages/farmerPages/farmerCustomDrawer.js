"use client"

import { useState, useEffect, useRef } from "react"
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
  ActivityIndicator,
  Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { showToast } from "../../utils/toast"
import API_BASE_URL from "../../utils/api"


const { height } = Dimensions.get("window")

// Animated Plant Component for Drawer (keep existing animation code)
const DrawerPlant = ({ delay = 0 }) => {
  const growAnimation = useRef(new Animated.Value(0)).current
  const swayAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(growAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start()

      Animated.loop(
        Animated.sequence([
          Animated.timing(swayAnimation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(swayAnimation, {
            toValue: -1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }, delay)
  }, [delay])

  const swayInterpolate = swayAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-3deg", "3deg"],
  })

  const scaleInterpolate = growAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        styles.drawerPlant,
        {
          transform: [{ scale: scaleInterpolate }, { rotate: swayInterpolate }],
        },
      ]}
    >
      <Ionicons name="leaf" size={16} color="#22c55e" />
    </Animated.View>
  )
}

const CustomDrawer = ({ navigation, onClose }) => {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weatherMode, setWeatherMode] = useState("sunny")

  // Original menu items
  const menuItems = [
    { id: "1", title: "Garden Home", icon: "home-outline", route: "Home" },
    { id: "2", title: "Ai ChatBot", icon: "hardware-chip-outline", route: "AiChatBot" }



  ]

  // New sales-related menu items
  const salesItems = [
    { id: "s1", title: "Sell Plants", icon: "cash-outline", route: "SellPlants" },
    { id: "s2", title: "View Inquiries/Orders", icon: "list-outline", route: "Orders" },
    { id: "s3", title: "Chat with Vendors", icon: "chatbubbles-outline", route: "VendorChat" },
    { id: "s4", title: "Manage Vegetable Stocks", icon: "archive-outline", route: "Inventory" },
  ]

  // New monitoring items
  const monitoringItems = [
    { id: "m1", title: "Weather Updates", icon: "partly-sunny-outline", route: "weather" },
    { id: "m2", title: "Plant Care Monitoring", icon: "analytics-outline", route: "imageProcessing" },
    { id: "m3", title: "Plant Library", icon: "library-outline", route: "PlantLibrary" },
  ]

  // Original bottom items
  const bottomItems = [
    { id: "9", title: "Settings", icon: "settings-outline", route: "Settings" },
    { id: "10", title: "Plant Tips", icon: "bulb-outline", route: "PlantTips" },
    { id: "11", title: "About Garden", icon: "information-circle-outline", route: "About" },
  ]

  // Keep all existing effects and methods
  useEffect(() => {
    fetchProfile()

    const weatherInterval = setInterval(() => {
      const modes = ["sunny", "rainy", "cloudy"]
      setWeatherMode(modes[Math.floor(Math.random() * modes.length)])
    }, 8000)

    return () => clearInterval(weatherInterval)
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("userToken")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Profile fetch failed")

      setProfileData(data.user)
    } catch (error) {
      console.error("Profile fetch error:", error)
      showToast("error", "Profile Error", error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleNavigation = (route) => {
    onClose?.()
    navigation.navigate(route)
  }

  const handleLogout = () => {
    Alert.alert(
      "Leave Garden",
      "Are you sure you want to leave your garden?",
      [
        {
          text: "Stay",
          style: "cancel",
        },
        {
          text: "Leave Garden",
          style: "destructive",
          onPress: performLogout,
        },
      ],
      { cancelable: true },
    )
  }

  const performLogout = async () => {
    try {
      onClose?.()
      await AsyncStorage.multiRemove(["userToken", "userData", "isAuthenticated"])

      showToast("success", "Garden Left", "Your plants will miss you! Come back soon 🌱")

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      console.error("Logout error:", error)
      showToast("error", "Logout Failed", "Something went wrong. Please try again.")
    }
  }

  const getWeatherGradient = () => {
    switch (weatherMode) {
      case "sunny":
        return ["#fbbf24", "#f59e0b", "#22c55e", "#16a34a"]
      case "rainy":
        return ["#60a5fa", "#3b82f6", "#22c55e", "#15803d"]
      case "cloudy":
        return ["#9ca3af", "#6b7280", "#22c55e", "#16a34a"]
      default:
        return ["#fbbf24", "#f59e0b", "#22c55e", "#16a34a"]
    }
  }

  const getWeatherIcon = () => {
    switch (weatherMode) {
      case "sunny":
        return "sunny"
      case "rainy":
        return "rainy"
      case "cloudy":
        return "cloudy"
      default:
        return "sunny"
    }
  }

  const renderMenuItem = (item, isBottom = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isBottom && styles.bottomMenuItem]}
      onPress={() => handleNavigation(item.route)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={24} color="#22c55e" />
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  const renderMenuSection = (title, items) => (
    <View style={styles.menuSection}>
      {title && <Text style={styles.sectionHeader}>{title}</Text>}
      {items.map((item) => renderMenuItem(item))}
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Growing your garden...</Text>
      </SafeAreaView>
    )
  }

  const user = profileData || {
    name: "Plant Parent",
    email: "user@example.com",
    profilePhoto: null,
    address: null,
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Keep all existing decorative elements */}
        <DrawerPlant delay={0} />
        <DrawerPlant delay={500} />
        <DrawerPlant delay={1000} />

        {/* Original header section */}
        <LinearGradient colors={getWeatherGradient()} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={user.profilePhoto ? { uri: user.profilePhoto } : require("../../assets/default-profile.png")}
                style={styles.profileImage}
              />
              <View style={styles.plantBadge}>
                <Ionicons name="leaf" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.weatherBadge}>
                <Ionicons name={getWeatherIcon()} size={16} color="#fff" />
                <Text style={styles.weatherText}>{weatherMode.charAt(0).toUpperCase() + weatherMode.slice(1)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Plants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Healthy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Container - Now with added sections */}
        <View style={styles.menuContainer}>
          {/* Original Garden Menu */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>🌱 Garden Menu</Text>
            {menuItems.map((item) => renderMenuItem(item))}
          </View>

          {/* New Sales Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>💰 Sales</Text>
            {salesItems.map((item) => renderMenuItem(item))}
          </View>

          {/* New Monitoring Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>🔍 Plant Monitoring</Text>
            {monitoringItems.map((item) => renderMenuItem(item))}
          </View>

          {/* Keep original plant care tip banner */}
          <TouchableOpacity
            style={styles.offerBanner}
            onPress={() => handleNavigation("PlantTips")}
            activeOpacity={0.8}
          >
            <LinearGradient colors={["rgba(34, 197, 94, 0.1)", "rgba(22, 163, 74, 0.1)"]} style={styles.offerGradient}>
              <View style={styles.offerContent}>
                <Ionicons name="leaf" size={32} color="#22c55e" />
                <View style={styles.offerText}>
                  <Text style={styles.offerTitle}>Plant Care Pro</Text>
                  <Text style={styles.offerSubtitle}>Unlock advanced plant care features</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#22c55e" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Keep original daily tip */}
          <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color="#22c55e" />
              <Text style={styles.tipHeaderText}>Daily Plant Tip</Text>
            </View>
            <Text style={styles.tipText}>
              💧 Water your plants in the morning to give them energy for the day and reduce evaporation!
            </Text>
          </View>

          {/* Original bottom items */}
          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            {bottomItems.map((item) => renderMenuItem(item, true))}
          </View>

          {/* Keep original logout button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Leave Garden</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "500",
  },
  drawerPlant: {
    position: "absolute",
    right: 20,
    top: 100,
    zIndex: 1,
    opacity: 0.6,
  },
  header: {
    paddingBottom: 25,
    paddingTop: 10,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginBottom: 20,
    padding: 5,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  plantBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  weatherText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  bottomMenuItem: {
    backgroundColor: "transparent",
    borderLeftWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
    fontWeight: "500",
  },
  offerBanner: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  offerGradient: {
    padding: 15,
  },
  offerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerText: {
    flex: 1,
    marginLeft: 15,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 2,
  },
  offerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  tipContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 18,
  },
  bottomSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    fontSize: 16,
    color: "#ef4444",
    marginLeft: 15,
    fontWeight: "600",
  },
})

export default CustomDrawer
