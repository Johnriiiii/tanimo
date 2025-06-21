"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { showToast } from "../../utils/toast"
import API_BASE_URL from "../../utils/api"
import * as ImagePicker from "expo-image-picker"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

// Animated Plant Growth Component
const PlantGrowth = ({ stage, style }) => {
  const growthAnimation = useRef(new Animated.Value(0)).current
  const leafAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(growthAnimation, {
        toValue: stage,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(leafAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [stage])

  const scaleInterpolate = growthAnimation.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0.3, 0.6, 0.8, 1],
  })

  const leafScale = leafAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleInterpolate }],
        },
      ]}
    >
      <View style={styles.plantStem}>
        <Ionicons name="remove" size={20} color="#16a34a" style={{ transform: [{ rotate: "90deg" }] }} />
      </View>
      <Animated.View
        style={{
          transform: [{ scale: leafScale }],
        }}
      >
        <Ionicons name="leaf" size={24} color="#22c55e" />
      </Animated.View>
    </Animated.View>
  )
}

// Floating Seed Animation
const FloatingSeed = ({ delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const rotateValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
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
    outputRange: [0, -20, 0],
  })

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Animated.View
      style={[
        styles.floatingSeed,
        {
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <Ionicons name="ellipse" size={8} color="#a3a3a3" />
    </Animated.View>
  )
}

// Enhanced Input Field with Plant Theme
const PlantInputField = ({
  name,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  focused,
  onFocus,
  onBlur,
}) => {
  const focusAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [focused])

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#22c55e"],
  })

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#f0fdf4"],
  })

  return (
    <Animated.View
      style={[
        styles.inputWrapper,
        {
          borderColor,
          backgroundColor,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color="#22c55e" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, isPassword && styles.passwordInput]}
        placeholder={placeholder}
        placeholderTextColor="#a0a0a0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onTogglePassword}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#22c55e" />
        </TouchableOpacity>
      )}
      {focused && (
        <View style={styles.growthIndicator}>
          <Ionicons name="leaf" size={12} color="#22c55e" />
        </View>
      )}
    </Animated.View>
  )
}

const Register = ({ navigation }) => {
  // User Information
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [formProgress, setFormProgress] = useState(0)
  const [weatherMode, setWeatherMode] = useState("sunny")

  // Address Information
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")

  // Animation refs
  const headerAnimation = useRef(new Animated.Value(0)).current
  const formAnimation = useRef(new Animated.Value(0)).current
  const progressAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Header entrance animation
    Animated.spring(headerAnimation, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start()

    // Form slide up animation
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start()

    // Calculate form progress
    const fields = [name, email, password, confirmPassword, street, city, country]
    const filledFields = fields.filter((field) => field.trim() !== "").length
    const progress = filledFields / fields.length
    setFormProgress(progress)

    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()

    // Change weather mode periodically
    const weatherInterval = setInterval(() => {
      const modes = ["sunny", "rainy", "cloudy"]
      setWeatherMode(modes[Math.floor(Math.random() * modes.length)])
    }, 10000)

    return () => clearInterval(weatherInterval)
  }, [name, email, password, confirmPassword, street, city, country])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      showToast("error", "Permission Denied", "Sorry, we need camera roll permissions to select an image")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const manipulatedImage = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 500, height: 500 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
      })
      setProfilePhoto(manipulatedImage)
    }
  }

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      showToast("error", "Missing Fields", "Please plant all the required seeds (fill required fields)")
      return false
    }

    if (password !== confirmPassword) {
      showToast("error", "Password Mismatch", "Your password seeds don't match!")
      return false
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast("error", "Invalid Email", "Please enter a valid email address")
      return false
    }

    if (!street || !city || !country) {
      showToast("error", "Address Required", "Please provide your garden location (address)")
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("name", name)
      formData.append("email", email.toLowerCase())
      formData.append("password", password)

      formData.append("address[street]", street)
      formData.append("address[city]", city)
      formData.append("address[state]", state)
      formData.append("address[postalCode]", postalCode)
      formData.append("address[country]", country)

      if (profilePhoto) {
        formData.append("profilePhoto", {
          uri: profilePhoto.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        })
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error("Invalid server response")
      }

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      await AsyncStorage.multiSet([
        ["userToken", data.token],
        ["userData", JSON.stringify(data.user)],
      ])

      showToast("success", "Welcome to the Garden!", "Your plant care journey begins now! 🌱")
      navigation.replace("Home")
    } catch (error) {
      console.error("Registration error:", error)
      showToast("error", "Registration Failed", error.message || "Could not plant your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

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

  const getPlantStage = () => {
    if (formProgress < 0.25) return 0
    if (formProgress < 0.5) return 1
    if (formProgress < 0.75) return 2
    return 3
  }

  const headerScale = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const formTranslateY = formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  })

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={getWeatherGradient()} style={styles.gradientContainer}>
        {/* Floating Seeds */}
        {Array.from({ length: 6 }, (_, i) => (
          <FloatingSeed key={i} delay={i * 800} />
        ))}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                transform: [{ scale: headerScale }],
              },
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              <Image
                source={profilePhoto ? { uri: profilePhoto.uri } : require("../../assets/default-profile.png")}
                style={styles.profileImage}
              />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
              {/* Plant growth around profile */}
              <PlantGrowth stage={getPlantStage()} style={styles.plantGrowthLeft} />
              <PlantGrowth stage={getPlantStage()} style={styles.plantGrowthRight} />
            </TouchableOpacity>

            <Text style={styles.welcomeText}>Plant Your Roots</Text>
            <Text style={styles.subtitle}>Join our growing community</Text>

            {/* Growth Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Garden Progress</Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(formProgress * 100)}% Complete</Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: formTranslateY }],
                opacity: formAnimation,
              },
            ]}
          >
            {/* Personal Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={18} color="#22c55e" /> Plant Your Identity
              </Text>

              <PlantInputField
                name="name"
                icon="person-outline"
                placeholder="Full Name (Your Garden Name) *"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                focused={focusedInput === "name"}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="email"
                icon="mail-outline"
                placeholder="Email Address (Garden Contact) *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                focused={focusedInput === "email"}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="password"
                icon="lock-closed-outline"
                placeholder="Password (Garden Key) *"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                secureTextEntry={!showPassword}
                showPassword={showPassword}
                onTogglePassword={toggleShowPassword}
                focused={focusedInput === "password"}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="confirmPassword"
                icon="lock-closed-outline"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword={true}
                secureTextEntry={!showConfirmPassword}
                showPassword={showConfirmPassword}
                onTogglePassword={toggleShowConfirmPassword}
                focused={focusedInput === "confirmPassword"}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Address Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color="#22c55e" /> Garden Location
              </Text>

              <PlantInputField
                name="street"
                icon="home-outline"
                placeholder="Street Address (Garden Address) *"
                value={street}
                onChangeText={setStreet}
                focused={focusedInput === "street"}
                onFocus={() => setFocusedInput("street")}
                onBlur={() => setFocusedInput(null)}
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="city"
                    icon="business-outline"
                    placeholder="City *"
                    value={city}
                    onChangeText={setCity}
                    focused={focusedInput === "city"}
                    onFocus={() => setFocusedInput("city")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="state"
                    icon="map-outline"
                    placeholder="State/Province"
                    value={state}
                    onChangeText={setState}
                    focused={focusedInput === "state"}
                    onFocus={() => setFocusedInput("state")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="postalCode"
                    icon="mail-outline"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    focused={focusedInput === "postalCode"}
                    onFocus={() => setFocusedInput("postalCode")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="country"
                    icon="globe-outline"
                    placeholder="Country *"
                    value={country}
                    onChangeText={setCountry}
                    focused={focusedInput === "country"}
                    onFocus={() => setFocusedInput("country")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            {/* Plant Care Tip */}
            <View style={styles.tipContainer}>
              <Ionicons name="leaf" size={16} color="#22c55e" />
              <Text style={styles.tipText}>
                🌱 Welcome to your plant journey! Every great garden starts with a single seed.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Plant My Garden</Text>
                    <Ionicons name="leaf" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already growing with us? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  floatingSeed: {
    position: "absolute",
    left: Math.random() * width,
    top: Math.random() * height * 0.3,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  plantGrowthLeft: {
    position: "absolute",
    left: -30,
    top: 20,
  },
  plantGrowthRight: {
    position: "absolute",
    right: -30,
    top: 20,
  },
  plantStem: {
    alignItems: "center",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: "center",
    width: "80%",
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressPercentage: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 2,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#333",
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  growthIndicator: {
    position: "absolute",
    right: -8,
    top: "50%",
    marginTop: -6,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 2,
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    color: "#15803d",
    fontSize: 14,
  },
  registerButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    height: 56,
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: "#666",
    fontSize: 15,
  },
  loginText: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "600",
  },
})

export default Register
