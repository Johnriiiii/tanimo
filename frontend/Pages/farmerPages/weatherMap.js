"use client"

import { useEffect, useState } from "react"
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native"
import * as Location from "expo-location"
import { WebView } from "react-native-webview"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

// Optimized for various screen sizes
const DEVICE_HEIGHT = height
const DEVICE_WIDTH = width
const HEADER_HEIGHT = DEVICE_HEIGHT * 0.12 // 12% of screen height
const SELECTOR_HEIGHT = DEVICE_HEIGHT * 0.08 // 8% of screen height

const weatherOptions = [
  { label: "Rain", value: "rain", icon: "🌧️", color: "#4CAF50" },
  { label: "Wind", value: "wind", icon: "💨", color: "#66BB6A" },
  { label: "Clouds", value: "clouds", icon: "☁️", color: "#81C784" },
  { label: "Temperature", value: "temp", icon: "🌡️", color: "#8BC34A" },
  { label: "Waves", value: "waves", icon: "🌊", color: "#26A69A" },
  { label: "Pressure", value: "pressure", icon: "📊", color: "#7CB342" },
  { label: "Thunder", value: "thunder", icon: "⚡", color: "#9CCC65" },
]

export default function MapScreen() {
  const [region, setRegion] = useState(null)
  const [overlay, setOverlay] = useState("rain")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          alert("🚫 Location permission denied. Please enable location access for weather data.")
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        setRegion({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        })
      } catch (error) {
        console.error("Error getting location:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const selectedOption = weatherOptions.find((option) => option.value === overlay)

  if (isLoading || !region) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0F8F0" />
        <LinearGradient colors={["#F0F8F0", "#E8F5E8", "#C8E6C9"]} style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
            <Text style={styles.loadingText}>🌍 Getting your location...</Text>
            <Text style={styles.loadingSubtext}>🌾 Preparing agricultural weather data</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  const windyURL = `https://embed.windy.com/embed2.html?lat=${region.lat}&lon=${region.lon}&detailLat=${region.lat}&detailLon=${region.lon}&width=100%25&height=100%25&zoom=5&level=surface&overlay=${overlay}&menu=false&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F8F0" />

      {/* Header */}
      <LinearGradient colors={["#E8F5E8", "#F1F8E9"]} style={[styles.header, { height: HEADER_HEIGHT }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🗺️ Weather Map</Text>
          <View style={styles.currentSelection}>
            <Text style={styles.selectedIcon}>{selectedOption?.icon}</Text>
            <Text style={styles.selectedLabel}>{selectedOption?.label}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Weather Options Selector */}
      <View style={[styles.selectorContainer, { height: SELECTOR_HEIGHT }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {weatherOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                overlay === option.value && [styles.selectedOption, { backgroundColor: option.color }],
              ]}
              onPress={() => setOverlay(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[styles.optionText, overlay === option.value && styles.selectedOptionText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <WebView
            source={{ uri: windyURL }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.webviewLoadingText}>🌱 Loading agricultural weather map...</Text>
              </View>
            )}
          />
        </View>
      </View>

      {/* Bottom Info Bar */}
      <View style={styles.bottomInfo}>
        <LinearGradient colors={["#E8F5E8", "#F1F8E9"]} style={styles.bottomGradient}>
          <Text style={styles.bottomText}>🌾 Agricultural Weather Data • {selectedOption?.label} Layer Active</Text>
        </LinearGradient>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#558B2F",
    textAlign: "center",
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#C8E6C9",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
  },
  currentSelection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  selectedIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  selectorContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
    paddingVertical: 12,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  optionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#F1F8E9",
    minWidth: 75,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  optionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#558B2F",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mapContainer: {
    flex: 1,
    padding: 12,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 248, 240, 0.95)",
  },
  webviewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
    textAlign: "center",
  },
  bottomInfo: {
    height: 50,
  },
  bottomGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#C8E6C9",
  },
  bottomText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    textAlign: "center",
  },
})
