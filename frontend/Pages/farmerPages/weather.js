"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native"
import * as Location from "expo-location"
import axios from "axios"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")
const API_KEY = "cc52e22304b978c2fb595a2b7e58cff6"

// Philippine Cities Data
const PH_CITIES = [
  { name: "Angeles City", lat: 15.1455, lon: 120.5876 },
  { name: "Antipolo", lat: 14.5878, lon: 121.176 },
  { name: "Bacolod", lat: 10.6319, lon: 122.9951 },
  { name: "Bago City", lat: 10.5333, lon: 122.8333 },
  { name: "Baguio City", lat: 16.4023, lon: 120.596 },
  { name: "Manila", lat: 14.5995, lon: 120.9842 },
  { name: "Cebu City", lat: 10.3157, lon: 123.8854 },
  { name: "Davao City", lat: 7.1907, lon: 125.4553 },
  { name: "Quezon City", lat: 14.676, lon: 121.0437 },
  { name: "Caloocan", lat: 14.6507, lon: 120.9672 },
  // ... (keeping all other cities for brevity)
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8F0",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    marginRight: 8,
  },
  locationButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginRight: 8,
  },
  mapButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FF5722",
    borderRadius: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.5,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  mainWeatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  temperatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  temperatureCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEB3B",
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  highLowTemp: {
    fontSize: 12,
    color: "#757575",
  },
  mainTemperature: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },
  temperatureUnit: {
    fontSize: 12,
    color: "#757575",
  },
  feelsLike: {
    fontSize: 14,
    color: "#757575",
  },
  conditionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  weatherConditionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  weatherCondition: {
    fontSize: 16,
    color: "#000000",
    marginTop: 8,
  },
  windSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  compassContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  windDirection: {
    fontSize: 16,
    color: "#000000",
    marginLeft: 8,
  },
  windSpeed: {
    fontSize: 16,
    color: "#000000",
  },
  windLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 8,
  },
  farmingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  farmingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  farmingContent: {
    marginBottom: 16,
  },
  farmingSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cropIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  cropName: {
    fontSize: 16,
    color: "#000000",
  },
  suitabilityTag: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#000000",
  },
  temperatureInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  tempLabel: {
    fontSize: 12,
    color: "#757575",
  },
  farmingTip: {
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    padding: 16,
  },
  farmingTipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  farmingTipText: {
    fontSize: 14,
    color: "#000000",
  },
  conditionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "48%",
  },
  conditionLabel: {
    fontSize: 14,
    color: "#757575",
    marginRight: 8,
  },
  conditionValue: {
    fontSize: 14,
    color: "#000000",
  },
  precipitationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  precipitationPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  precipitationText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginTop: 8,
  },
  rainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  rainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButtonText: {
    fontSize: 14,
    color: "#2E7D32",
    marginLeft: 4,
  },
  rainContent: {
    marginBottom: 16,
  },
  rainSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rainCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  rainSummaryText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 8,
  },
  rainList: {
    flexDirection: "column",
  },
  rainItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rainItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rainIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0277BD",
    marginRight: 8,
  },
  rainCityName: {
    fontSize: 16,
    color: "#000000",
  },
  showMoreButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: "#2E7D32",
  },
  noRainContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.5,
  },
  noRainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 16,
  },
  noRainDescription: {
    fontSize: 16,
    color: "#757575",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    marginLeft: 8,
  },
  currentLocationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  currentLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  currentLocationName: {
    fontSize: 16,
    color: "#000000",
  },
  currentLocationCoords: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 8,
  },
  cityList: {
    padding: 16,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cityName: {
    fontSize: 16,
    color: "#000000",
  },
  cityCoords: {
    fontSize: 14,
    color: "#757575",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    position: "absolute",
  },
  backLine: {
    position: "absolute",
  },
  plantStem: {
    position: "absolute",
  },
  plantLeaf: {
    position: "absolute",
  },
  calendarBase: {
    position: "absolute",
  },
  calendarTop: {
    position: "absolute",
  },
  calendarHook: {
    position: "absolute",
  },
  sunIcon: {
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
  },
  sunRay: {
    position: "absolute",
  },
  cloudIcon: {
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
  },
  rainDrop: {
    position: "absolute",
  },
  locationPin: {
    borderWidth: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
  },
  locationDot: {
    borderRadius: 50,
    position: "absolute",
  },
  compassCircle: {
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
  },
  compassNeedle: {
    position: "absolute",
  },
  loadingSpinner: {
    borderWidth: 4,
    borderRadius: 50,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    position: "absolute",
  },
  refreshCircle: {
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
  },
  refreshArrow: {
    borderWidth: 8,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRadius: 4,
    position: "absolute",
  },
  expandArrow: {
    position: "absolute",
  },
  searchCircle: {
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
  },
  searchHandle: {
    position: "absolute",
  },
  closeLine: {
    position: "absolute",
  },
  mapIcon: {
    borderWidth: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: "absolute",
  },
  mapLine: {
    position: "absolute",
  },
  farmingInfoCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  farmingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  farmingLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#388E3C",
  },
  farmingValue: {
    fontSize: 14,
    color: "#2E7D32",
  },
  cropsCard: {
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cropsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 8,
  },
  cropsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cropTag: {
    backgroundColor: "#DCEDC8",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  cropText: {
    fontSize: 12,
    color: "#2E7D32",
  },
  adviceCard: {
    backgroundColor: "#E0F2F1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 8,
  },
  farmingAdvice: {
    fontSize: 14,
    color: "#2E7D32",
  },
  soilCard: {
    backgroundColor: "#F9FBE7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  soilTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 8,
  },
  currentConditionsCard: {
    backgroundColor: "#FFFDE7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  conditionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#388E3C",
    marginBottom: 8,
  },
  farmingCondition: {
    fontSize: 14,
    color: "#2E7D32",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
})

// Weather Icon Component
const WeatherIcon = ({ type, size = 24, color = "#4CAF50" }) => {
  const getWeatherIcon = () => {
    switch (type) {
      case "back":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.backArrow,
                {
                  width: size * 0.6,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "45deg" }],
                  top: size * 0.35,
                  left: size * 0.25,
                },
              ]}
            />
            <View
              style={[
                styles.backArrow,
                {
                  width: size * 0.6,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "-45deg" }],
                  top: size * 0.55,
                  left: size * 0.25,
                },
              ]}
            />
            <View
              style={[
                styles.backLine,
                {
                  width: size * 0.7,
                  height: 2,
                  backgroundColor: color,
                  top: size * 0.45,
                  left: size * 0.15,
                },
              ]}
            />
          </View>
        )
      case "plant":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.plantStem,
                {
                  width: 2,
                  height: size * 0.6,
                  backgroundColor: color,
                  top: size * 0.4,
                  left: size * 0.49,
                },
              ]}
            />
            <View
              style={[
                styles.plantLeaf,
                {
                  width: size * 0.3,
                  height: size * 0.2,
                  borderRadius: size * 0.1,
                  backgroundColor: color,
                  top: size * 0.2,
                  left: size * 0.35,
                },
              ]}
            />
            <View
              style={[
                styles.plantLeaf,
                {
                  width: size * 0.25,
                  height: size * 0.15,
                  borderRadius: size * 0.075,
                  backgroundColor: color,
                  top: size * 0.3,
                  right: size * 0.35,
                },
              ]}
            />
          </View>
        )
      case "clear":
      case "sunny":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.6, height: size * 0.6, borderColor: "#FF8F00" }]} />
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.sunRay,
                  {
                    width: size * 0.15,
                    height: 2,
                    backgroundColor: "#FF8F00",
                    transform: [{ rotate: `${i * 45}deg` }],
                    top: size * 0.1,
                    left: size * 0.425,
                  },
                ]}
              />
            ))}
          </View>
        )
      case "cloudy":
      case "partly-cloudy":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.4, height: size * 0.4, borderColor: "#FFA500" }]} />
            <View
              style={[
                styles.cloudIcon,
                {
                  width: size * 0.6,
                  height: size * 0.35,
                  borderColor: "#78909C",
                  position: "absolute",
                  bottom: size * 0.1,
                  right: size * 0.1,
                },
              ]}
            />
          </View>
        )
      case "rain":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.cloudIcon, { width: size * 0.7, height: size * 0.4, borderColor: "#78909C" }]} />
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.rainDrop,
                  {
                    width: 2,
                    height: size * 0.3,
                    backgroundColor: "#0277BD",
                    left: size * 0.25 + i * size * 0.15,
                    top: size * 0.5,
                  },
                ]}
              />
            ))}
          </View>
        )
      case "location":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.locationPin, { width: size * 0.6, height: size * 0.8, borderColor: color }]} />
            <View
              style={[
                styles.locationDot,
                {
                  width: size * 0.2,
                  height: size * 0.2,
                  backgroundColor: color,
                  top: size * 0.15,
                  left: size * 0.4,
                },
              ]}
            />
          </View>
        )
      case "compass":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.compassCircle, { width: size * 0.8, height: size * 0.8, borderColor: color }]} />
            <View
              style={[
                styles.compassNeedle,
                {
                  width: 2,
                  height: size * 0.4,
                  backgroundColor: color,
                  top: size * 0.1,
                  left: size * 0.49,
                },
              ]}
            />
          </View>
        )
      case "loading":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.loadingSpinner, { width: size * 0.8, height: size * 0.8, borderColor: color }]} />
          </View>
        )
      case "refresh":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.refreshCircle, { width: size * 0.7, height: size * 0.7, borderColor: color }]} />
            <View
              style={[
                styles.refreshArrow,
                {
                  width: size * 0.15,
                  height: size * 0.15,
                  borderTopColor: color,
                  borderRightColor: color,
                  top: size * 0.2,
                  right: size * 0.15,
                },
              ]}
            />
          </View>
        )
      case "expand":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.expandArrow,
                {
                  width: size * 0.4,
                  height: 2,
                  backgroundColor: color,
                  top: size * 0.4,
                },
              ]}
            />
            <View
              style={[
                styles.expandArrow,
                {
                  width: 2,
                  height: size * 0.4,
                  backgroundColor: color,
                  left: size * 0.4,
                  top: size * 0.2,
                },
              ]}
            />
          </View>
        )
      case "collapse":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.expandArrow,
                {
                  width: size * 0.4,
                  height: 2,
                  backgroundColor: color,
                  top: size * 0.4,
                },
              ]}
            />
          </View>
        )
      case "search":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.searchCircle, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
            <View
              style={[
                styles.searchHandle,
                {
                  width: size * 0.25,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "45deg" }],
                  top: size * 0.65,
                  left: size * 0.65,
                },
              ]}
            />
          </View>
        )
      case "close":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.closeLine,
                {
                  width: size * 0.7,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "45deg" }],
                },
              ]}
            />
            <View
              style={[
                styles.closeLine,
                {
                  width: size * 0.7,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: "-45deg" }],
                  position: "absolute",
                },
              ]}
            />
          </View>
        )
      case "map":
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.mapIcon, { width: size * 0.8, height: size * 0.6, borderColor: color }]} />
            <View
              style={[
                styles.mapLine,
                {
                  width: size * 0.6,
                  height: 1,
                  backgroundColor: color,
                  top: size * 0.35,
                  left: size * 0.1,
                },
              ]}
            />
            <View
              style={[
                styles.mapLine,
                {
                  width: size * 0.6,
                  height: 1,
                  backgroundColor: color,
                  top: size * 0.5,
                  left: size * 0.1,
                },
              ]}
            />
          </View>
        )
      default:
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.sunIcon, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
          </View>
        )
    }
  }

  return <View style={{ width: size, height: size, position: "relative" }}>{getWeatherIcon()}</View>
}

// Main Weather Screen Component
const WeatherScreen = () => {
  // State Management
  const [location, setLocation] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [rainingCities, setRainingCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState(null)
  const [currentLocationCity, setCurrentLocationCity] = useState(null)
  const [rainListExpanded, setRainListExpanded] = useState(false)

  // Navigation and Animation References
  const navigation = useNavigation()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const loadingRotation = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const bounceAnim = useRef(new Animated.Value(30)).current

  // Weather Data Functions
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      )
      setWeatherData(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching weather:", error)
      return null
    }
  }

  const fetchCurrentLocationCity = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
      )
      if (response.data && response.data.length > 0) {
        const cityData = response.data[0]
        const currentCity = {
          name: cityData.name,
          lat: lat,
          lon: lon,
        }
        setCurrentLocationCity(currentCity)
        setSelectedCity(currentCity)
        return currentCity
      }
    } catch (error) {
      console.error("Error fetching current location city:", error)
      const fallbackCity = { name: "Current Location", lat: lat, lon: lon }
      setCurrentLocationCity(fallbackCity)
      setSelectedCity(fallbackCity)
      return fallbackCity
    }
  }

  const fetchRainInPH = async () => {
    const results = []
    for (const city of PH_CITIES.slice(0, 20)) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`,
        )
        const weather = res.data.weather[0].main.toLowerCase()
        if (weather.includes("rain") || res.data.rain) {
          results.push(city.name)
        }
      } catch (e) {
        console.log(`Failed to fetch ${city.name}`)
      }
    }
    setRainingCities(results)
  }

  const fetchWeatherForCity = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`,
      )
      setWeatherData(response.data)
      setSelectedCity(city)
      setShowLocationPicker(false)
    } catch (error) {
      console.error("Error fetching weather for city:", error)
    }
  }

  const refreshWeatherData = async () => {
    setRefreshing(true)
    try {
      if (selectedCity) {
        await fetchWeatherForCity(selectedCity)
      } else if (location) {
        await fetchWeather(location.latitude, location.longitude)
      }
      await fetchRainInPH()
      Alert.alert("✅ Success", "Weather data has been updated successfully!")
    } catch (error) {
      console.error("Error refreshing weather data:", error)
      Alert.alert("❌ Error", "Failed to refresh weather data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  // Navigation Functions
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      Alert.alert("Navigation", "No previous screen to go back to.")
    }
  }

  const handleViewMap = () => {
    try {
      navigation.navigate("weathermap", {
        weatherData: weatherData,
        selectedCity: selectedCity,
        location: location,
      })
    } catch (error) {
      Alert.alert("🗺️ Map View", "Map screen is not available yet. Would you like to view the location in your browser?", [
        {
          text: "Open in Browser",
          onPress: () => {
            const lat = weatherData?.coord?.lat || location?.latitude || 14.5995
            const lon = weatherData?.coord?.lon || location?.longitude || 120.9842
            const url = `https://www.google.com/maps/@${lat},${lon},12z`
            Alert.alert("📍 Map Location", `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}\n\n${url}`)
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ])
    }
  }

  // Utility Functions
  const getFilteredCities = () => {
    if (!searchQuery) return PH_CITIES
    return PH_CITIES.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const getWeatherIconType = (weatherMain) => {
    const weather = weatherMain.toLowerCase()
    if (weather.includes("clear")) return "clear"
    if (weather.includes("cloud")) return "cloudy"
    if (weather.includes("rain")) return "rain"
    return "clear"
  }

  const getPredictionText = () => {
    if (!weatherData) return ""
    const weather = weatherData.weather[0].main.toLowerCase()
    if (weather.includes("rain") || weatherData.rain) {
      return "🌧️ Slight rain chance in the next 6 hours"
    }
    if (weather.includes("cloud")) {
      return "☁️ Cloudy conditions expected to continue"
    }
    return "☀️ Clear weather conditions expected"
  }

  const getRainChance = () => {
    if (!weatherData) return "0"
    const weather = weatherData.weather[0].main.toLowerCase()
    if (weather.includes("rain") || weatherData.rain) {
      return "85"
    }
    if (weather.includes("cloud")) {
      return "25"
    }
    return "5"
  }

  const getWindDirection = () => {
    if (!weatherData || !weatherData.wind) return "N"
    const deg = weatherData.wind.deg || 0
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  const getDisplayedRainCities = () => {
    if (rainListExpanded) {
      return rainingCities
    }
    return rainingCities.slice(0, 5)
  }

  // Farming Recommendations Function
  const getFarmersRecommendation = () => {
    if (!weatherData) return null

    const currentMonth = new Date().getMonth() + 1
    const currentTemp = weatherData.main.temp
    const humidity = weatherData.main.humidity
    const isRaining = weatherData.weather[0].main.toLowerCase().includes("rain") || weatherData.rain
    const season = currentMonth >= 6 && currentMonth <= 11 ? "wet" : "dry"

    let recommendedCrops = []
    let generalAdvice = ""

    if (season === "wet") {
      generalAdvice = "🌧️ Rainy season (June-November) is good for water-intensive crops."
      if (isRaining) {
        generalAdvice += " Current rain is beneficial for newly planted crops."
      }

      if (currentMonth >= 6 && currentMonth <= 9) {
        recommendedCrops = ["🌾 Rice", "🌽 Corn", "🍆 Eggplant", "🥒 Okra", "🥬 Kangkong", "🥬 Pechay"]
      } else {
        recommendedCrops = ["🥬 Cabbage", "🥦 Broccoli", "🥬 Cauliflower", "🥗 Lettuce", "🥕 Carrots"]
      }
    } else {
      generalAdvice = "☀️ Dry season (December-May) is better for drought-resistant crops."
      if (currentTemp > 30) {
        generalAdvice += " High temperatures - ensure proper irrigation."
      }

      if (currentMonth >= 12 || currentMonth <= 2) {
        recommendedCrops = ["🍅 Tomatoes", "🌶️ Peppers", "🧅 Onions", "🧄 Garlic", "🍠 Sweet Potatoes"]
      } else {
        recommendedCrops = ["🫘 Mung Beans", "🥜 Peanuts", "🍉 Watermelon", "🥒 Cucumber", "🎃 Squash"]
      }
    }

    let soilAdvice = ""
    if (isRaining) {
      soilAdvice = "🚫 Avoid tilling soil when wet to prevent compaction. Wait for drier conditions."
    } else if (humidity < 60) {
      soilAdvice = "💧 Soil may be dry - consider adding organic matter to retain moisture."
    } else {
      soilAdvice = "✅ Good soil conditions for planting. Ensure proper drainage."
    }

    return {
      season,
      currentMonth,
      recommendedCrops,
      generalAdvice,
      soilAdvice,
      currentWeather: weatherData.weather[0].description,
      temperature: currentTemp,
      humidity,
    }
  }

  // Animation Functions
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.sequence([
      Animated.delay(400),
      Animated.spring(bounceAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start()
  }

  // Effects
  useEffect(() => {
    startLoadingAnimation()
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access location was denied")
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc.coords)
      await fetchCurrentLocationCity(loc.coords.latitude, loc.coords.longitude)
      await fetchWeather(loc.coords.latitude, loc.coords.longitude)
      await fetchRainInPH()
      setLoading(false)
      startAnimations()
    })()
  }, [])

  // Animation Interpolations
  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const refreshSpin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F8F0" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button and Action Buttons */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <WeatherIcon type="back" size={20} color="#2E7D32" />
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.locationButton} onPress={() => setShowLocationPicker(true)}>
              <WeatherIcon type="location" size={16} color="#FFFFFF" />
              <Text style={styles.locationButtonText}>
                {selectedCity ? selectedCity.name : currentLocationCity?.name || "Change Location"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
              <WeatherIcon type="map" size={16} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
              onPress={refreshWeatherData}
              disabled={refreshing}
            >
              <Animated.View style={refreshing ? { transform: [{ rotate: refreshSpin }] } : {}}>
                <WeatherIcon type="refresh" size={16} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.refreshButtonText}>{refreshing ? "Refreshing..." : "Refresh"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <WeatherIcon type="loading" size={60} color="#4CAF50" />
                </Animated.View>
                <Text style={styles.loadingText}>🌤️ Loading weather data...</Text>
              </View>
            ) : weatherData ? (
              <>
                {/* Main Weather Display */}
                <Animated.View style={[styles.mainWeatherCard, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.temperatureSection}>
                    {/* Large Temperature Circle */}
                    <View style={styles.temperatureCircle}>
                      <Text style={styles.highLowTemp}>
                        {Math.round(weatherData.main.temp_max)}° | {Math.round(weatherData.main.temp_min)}°
                      </Text>
                      <Text style={styles.mainTemperature}>{Math.round(weatherData.main.temp)}</Text>
                      <Text style={styles.temperatureUnit}>°C</Text>
                      <Text style={styles.feelsLike}>FEELS LIKE {Math.round(weatherData.main.feels_like)}°</Text>
                    </View>

                    {/* Weather Condition and Wind */}
                    <View style={styles.conditionSection}>
                      <View style={styles.weatherConditionContainer}>
                        <WeatherIcon type={getWeatherIconType(weatherData.weather[0].main)} size={60} color="#FF8F00" />
                        <Text style={styles.weatherCondition}>
                          {weatherData.weather[0].description
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Text>
                      </View>

                      <View style={styles.windSection}>
                        <View style={styles.compassContainer}>
                          <WeatherIcon type="compass" size={50} color="#4CAF50" />
                          <Text style={styles.windDirection}>{getWindDirection()}</Text>
                          <Text style={styles.windSpeed}>{Math.round(weatherData.wind?.speed || 0)}</Text>
                        </View>
                        <Text style={styles.windLabel}>Wind {weatherData.wind?.speed || 0} m/s</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>

                {/* Farming Recommendations Card */}
                {weatherData && (
                  <Animated.View style={[styles.farmingCard, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.farmingHeader}>
                      <WeatherIcon type="plant" size={24} color="#4CAF50" />
                      <Text style={styles.sectionTitle}>🌱 FARMING RECOMMENDATIONS</Text>
                    </View>

                    {(() => {
                      const recommendation = getFarmersRecommendation()
                      return (
                        <View style={styles.farmingContent}>
                          <View style={styles.farmingInfoCard}>
                            <View style={styles.farmingRow}>
                              <Text style={styles.farmingLabel}>🗓️ Current Season:</Text>
                              <Text style={styles.farmingValue}>
                                {recommendation.season === "wet" ? "🌧️ Wet Season" : "☀️ Dry Season"}
                              </Text>
                            </View>

                            <View style={styles.farmingRow}>
                              <Text style={styles.farmingLabel}>🌡️ Temperature:</Text>
                              <Text style={styles.farmingValue}>{Math.round(recommendation.temperature)}°C</Text>
                            </View>

                            <View style={styles.farmingRow}>
                              <Text style={styles.farmingLabel}>💧 Humidity:</Text>
                              <Text style={styles.farmingValue}>{recommendation.humidity}%</Text>
                            </View>
                          </View>

                          <View style={styles.cropsCard}>
                            <Text style={styles.cropsTitle}>🌾 Recommended Crops:</Text>
                            <View style={styles.cropsContainer}>
                              {recommendation.recommendedCrops.map((crop, index) => (
                                <View key={index} style={styles.cropTag}>
                                  <Text style={styles.cropText}>{crop}</Text>
                                </View>
                              ))}
                            </View>
                          </View>

                          <View style={styles.adviceCard}>
                            <Text style={styles.adviceTitle}>💡 General Advice:</Text>
                            <Text style={styles.farmingAdvice}>{recommendation.generalAdvice}</Text>
                          </View>

                          <View style={styles.soilCard}>
                            <Text style={styles.soilTitle}>🌱 Soil Conditions:</Text>
                            <Text style={styles.farmingAdvice}>{recommendation.soilAdvice}</Text>
                          </View>

                          <View style={styles.currentConditionsCard}>
                            <Text style={styles.conditionsTitle}>🌤️ Current Weather:</Text>
                            <Text style={styles.farmingCondition}>
                              {recommendation.currentWeather} | {new Date().toLocaleString("default", { month: "long" })}
                            </Text>
                          </View>
                        </View>
                      )
                    })()}
                  </Animated.View>
                )}

                {/* Additional Conditions */}
                <Animated.View style={[styles.conditionsCard, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.sectionTitle}>📊 ADDITIONAL CONDITIONS</Text>
                  <View style={styles.conditionsGrid}>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>🌡️ Pressure</Text>
                      <Text style={styles.conditionValue}>{weatherData.main.pressure} hPa</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>👁️ Visibility</Text>
                      <Text style={styles.conditionValue}>
                        {weatherData.visibility ? Math.round(weatherData.visibility / 1000) : 10} km
                      </Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>☁️ Clouds</Text>
                      <Text style={styles.conditionValue}>{weatherData.clouds?.all || 0}%</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>🌡️ Dew Point</Text>
                      <Text style={styles.conditionValue}>{Math.round(weatherData.main.temp - 5)}°C</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>💧 Humidity</Text>
                      <Text style={styles.conditionValue}>{weatherData.main.humidity}%</Text>
                    </View>
                    <View style={styles.conditionRow}>
                      <Text style={styles.conditionLabel}>🌧️ Rainfall</Text>
                      <Text style={styles.conditionValue}>{weatherData.rain?.["1h"] || 0} mm</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Precipitation Forecast */}
                <Animated.View style={[styles.precipitationCard, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.sectionTitle}>🌧️ PRECIPITATION FORECAST</Text>
                  <Text style={styles.precipitationPercentage}>{getRainChance()}%</Text>
                  <Text style={styles.precipitationText}>{getPredictionText()}</Text>
                </Animated.View>

                {/* Rain Monitor */}
                <Animated.View style={[styles.rainCard, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.rainHeader}>
                    <Text style={styles.sectionTitle}>🌧️ RAIN MONITOR - PHILIPPINES</Text>
                    {rainingCities.length > 5 && (
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => setRainListExpanded(!rainListExpanded)}
                      >
                        <WeatherIcon type={rainListExpanded ? "collapse" : "expand"} size={16} color="#4CAF50" />
                        <Text style={styles.expandButtonText}>
                          {rainListExpanded ? "Show Less" : `Show All (${rainingCities.length})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {rainingCities.length > 0 ? (
                    <View style={styles.rainContent}>
                      <View style={styles.rainSummaryContainer}>
                        <Text style={styles.rainCount}>{rainingCities.length}</Text>
                        <Text style={styles.rainSummaryText}>
                          {rainingCities.length === 1 ? "city experiencing" : "cities experiencing"} rain
                        </Text>
                      </View>

                      <View style={styles.rainList}>
                        {getDisplayedRainCities().map((city, idx) => (
                          <Animated.View
                            key={idx}
                            style={[
                              styles.rainItem,
                              {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }],
                              },
                            ]}
                          >
                            <View style={styles.rainItemLeft}>
                              <View style={styles.rainIndicator} />
                              <Text style={styles.rainCityName}>{city}</Text>
                            </View>
                            <WeatherIcon type="rain" size={16} color="#0277BD" />
                          </Animated.View>
                        ))}

                        {!rainListExpanded && rainingCities.length > 5 && (
                          <TouchableOpacity style={styles.showMoreButton} onPress={() => setRainListExpanded(true)}>
                            <Text style={styles.showMoreText}>+ {rainingCities.length - 5} more cities</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noRainContainer}>
                      <WeatherIcon type="clear" size={48} color="#4CAF50" />
                      <Text style={styles.noRainTitle}>🌞 All Clear</Text>
                      <Text style={styles.noRainDescription}>
                        No rain reported across major Philippine cities at this time.
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </>
            ) : (
              <Text style={styles.errorText}>❌ Unable to load weather data</Text>
            )}
          </ScrollView>
        </Animated.View>

        {/* Location Picker Modal */}
        <Modal visible={showLocationPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📍 Select City</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowLocationPicker(false)}>
                  <WeatherIcon type="close" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <WeatherIcon type="search" size={16} color="#4CAF50" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#7CB342"
                  />
                </View>
              </View>

              {currentLocationCity && (
                <View style={styles.currentLocationSection}>
                  <Text style={styles.currentLocationTitle}>📍 CURRENT LOCATION</Text>
                  <TouchableOpacity
                    style={styles.currentLocationItem}
                    onPress={() => {
                      setSelectedCity(currentLocationCity)
                      fetchWeatherForCity(currentLocationCity)
                    }}
                  >
                    <WeatherIcon type="location" size={16} color="#4CAF50" />
                    <View style={styles.currentLocationInfo}>
                      <Text style={styles.currentLocationName}>{currentLocationCity.name}</Text>
                      <Text style={styles.currentLocationCoords}>
                        {currentLocationCity.lat.toFixed(2)}, {currentLocationCity.lon.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
                data={getFilteredCities()}
                keyExtractor={(item) => item.name}
                style={styles.cityList}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.cityItem} onPress={() => fetchWeatherForCity(item)}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityCoords}>
                      {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

export default WeatherScreen
