"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
  Platform,
  Easing,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import CustomDrawer from "./CustomDrawer"

const { width, height } = Dimensions.get("window")

// Function to get status bar height for different devices
const getStatusBarHeight = () => {
  if (Platform.OS === "ios") {
    if (height >= 812) {
      return 44
    }
    return 20
  }
  return StatusBar.currentHeight || 24
}

// Animated Weather Element
const WeatherElement = ({ type, delay = 0, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const rotateValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ),
        Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ),
      ]).start()
    }

    setTimeout(startAnimation, delay)
  }, [delay])

  const translateY = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  })

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const getIcon = () => {
    switch (type) {
      case "leaf":
        return <Ionicons name="leaf" size={20} color="#22c55e" />
      case "water":
        return <Ionicons name="water" size={16} color="#3b82f6" />
      case "sun":
        return <Ionicons name="sunny" size={18} color="#f59e0b" />
      default:
        return <Ionicons name="leaf" size={20} color="#22c55e" />
    }
  }

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      {getIcon()}
    </Animated.View>
  )
}

// Plant Care Card Component
const PlantCareCard = ({ title, icon, description, color, onPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
      <Animated.View
        style={[
          styles.plantCareCard,
          { backgroundColor: color },
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <View style={styles.cardIconContainer}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// Weather Status Component
const WeatherStatus = ({ weatherMode }) => {
  const pulseAnimation = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const getWeatherIcon = () => {
    switch (weatherMode) {
      case "sunny":
        return <Ionicons name="sunny" size={24} color="#f59e0b" />
      case "rainy":
        return <Ionicons name="rainy" size={24} color="#3b82f6" />
      case "cloudy":
        return <Ionicons name="cloudy" size={24} color="#6b7280" />
      default:
        return <Ionicons name="sunny" size={24} color="#f59e0b" />
    }
  }

  const getWeatherText = () => {
    switch (weatherMode) {
      case "sunny":
        return "Perfect day for outdoor plants!"
      case "rainy":
        return "Great natural watering day!"
      case "cloudy":
        return "Gentle light for sensitive plants"
      default:
        return "Perfect day for outdoor plants!"
    }
  }

  return (
    <Animated.View
      style={[
        styles.weatherStatus,
        {
          transform: [{ scale: pulseAnimation }],
        },
      ]}
    >
      {getWeatherIcon()}
      <Text style={styles.weatherText}>{getWeatherText()}</Text>
    </Animated.View>
  )
}

const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [weatherMode, setWeatherMode] = useState("sunny")
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const headerAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Header entrance animation
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Change weather mode periodically
    const weatherInterval = setInterval(() => {
      const modes = ["sunny", "rainy", "cloudy"]
      setWeatherMode(modes[Math.floor(Math.random() * modes.length)])
    }, 8000)

    return () => clearInterval(weatherInterval)
  }, [])

  const openDrawer = () => {
    setDrawerVisible(true)

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
      }),
    ]).start()
  }

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
      }),
    ]).start(() => {
      setDrawerVisible(false)
    })
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

  const plantCareOptions = [
    {
      title: "My Plants",
      icon: "leaf",
      description: "View your plant collection",
      color: "#22c55e",
      onPress: () => navigation.navigate("MyPlants"),
    },
    {
      title: "Watering Schedule",
      icon: "water",
      description: "Check watering reminders",
      color: "#3b82f6",
      onPress: () => navigation.navigate("WateringSchedule"),
    },
    {
      title: "Plant Care Tips",
      icon: "bulb",
      description: "Learn plant care basics",
      color: "#f59e0b",
      onPress: () => navigation.navigate("PlantTips"),
    },
    {
      title: "Plant Journal",
      icon: "journal",
      description: "Track plant growth",
      color: "#8b5cf6",
      onPress: () => navigation.navigate("PlantJournal"),
    },
  ]

  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const headerTranslateY = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={getWeatherGradient()[0]} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Floating Weather Elements */}
        {Array.from({ length: 8 }, (_, i) => (
          <WeatherElement
            key={i}
            type={weatherMode === "rainy" ? "water" : weatherMode === "sunny" ? "sun" : "leaf"}
            delay={i * 600}
            style={[
              styles.floatingElement,
              {
                left: Math.random() * width * 0.8,
                top: Math.random() * height * 0.3 + 100,
              },
            ]}
          />
        ))}

        {/* Header Section */}
        <LinearGradient colors={getWeatherGradient()} style={styles.header}>
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={openDrawer} style={styles.headerButton} activeOpacity={0.7}>
                <Ionicons name="menu" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Search")}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.headerTitle}>Welcome back!</Text>
              <Text style={styles.headerSubtitle}>What would you like to learn today?</Text>
            </View>

            <WeatherStatus weatherMode={weatherMode} />
          </Animated.View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Plant Care Dashboard */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Plant Care Dashboard</Text>
            <View style={styles.plantCareGrid}>
              {plantCareOptions.map((option, index) => (
                <PlantCareCard
                  key={index}
                  title={option.title}
                  icon={option.icon}
                  description={option.description}
                  color={option.color}
                  onPress={option.onPress}
                />
              ))}
            </View>
          </View>

          {/* Daily Plant Tip */}
          <View style={styles.section}>
            <View style={styles.tipCard}>
              <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.tipGradient}>
                <View style={styles.tipContent}>
                  <Ionicons name="leaf" size={32} color="#fff" style={styles.tipIcon} />
                  <View style={styles.tipTextContainer}>
                    <Text style={styles.tipTitle}>Daily Plant Tip</Text>
                    <Text style={styles.tipText}>
                      Most houseplants prefer bright, indirect light. Place them near a window but not in direct
                      sunlight to avoid leaf burn.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("AddPlant")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.quickActionGradient}>
                  <Ionicons name="add" size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Add Plant</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate("WaterPlants")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#3b82f6", "#1d4ed8"]} style={styles.quickActionGradient}>
                  <Ionicons name="water" size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Water Plants</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
                marginLeft: 0,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeDrawer} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <CustomDrawer navigation={navigation} onClose={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingBottom: 30,
    paddingTop: getStatusBarHeight(),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  weatherStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  weatherText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  floatingElement: {
    position: "absolute",
    opacity: 0.6,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  plantCareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  plantCareCard: {
    width: "48%",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIconContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  tipCard: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tipGradient: {
    padding: 20,
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipIcon: {
    marginRight: 15,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  drawerContainer: {
    width: width * 0.8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
})

export default Home
