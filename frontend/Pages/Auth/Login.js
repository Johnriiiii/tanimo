import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { showToast } from "../../utils/toast"
import API_BASE_URL from "../../utils/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

// Animated Plant Component
const AnimatedPlant = ({ style }) => {
  const growAnimation = useRef(new Animated.Value(0)).current
  const swayAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Growing animation
    Animated.timing(growAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start()

    // Swaying animation
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
  }, [])

  const swayInterpolate = swayAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  })

  const scaleInterpolate = growAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleInterpolate }, { rotate: swayInterpolate }],
        },
      ]}
    >
      <Ionicons name="leaf" size={30} color="#4ade80" />
    </Animated.View>
  )
}

// Floating Weather Particle Component
const WeatherParticle = ({ type, delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const horizontalValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(horizontalValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(horizontalValue, {
              toValue: -1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start()
    }

    setTimeout(startAnimation, delay)
  }, [delay])

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  })

  const translateX = horizontalValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-20, 20],
  })

  const getIcon = () => {
    switch (type) {
      case "leaf":
        return <Ionicons name="leaf" size={16} color="#22c55e" />
      case "water":
        return <Ionicons name="water" size={14} color="#3b82f6" />
      case "sunny":
        return <Ionicons name="sunny" size={18} color="#f59e0b" />
      default:
        return <Ionicons name="leaf" size={16} color="#22c55e" />
    }
  }

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      {getIcon()}
    </Animated.View>
  )
}

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [weatherMode, setWeatherMode] = useState("sunny") // sunny, rainy, cloudy

  // Animation refs
  const logoAnimation = useRef(new Animated.Value(0)).current
  const formAnimation = useRef(new Animated.Value(0)).current
  const pulseAnimation = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Logo entrance animation
    Animated.spring(logoAnimation, {
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

    // Logo pulse animation
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

    // Change weather mode periodically
    const weatherInterval = setInterval(() => {
      const modes = ["sunny", "rainy", "cloudy"]
      setWeatherMode(modes[Math.floor(Math.random() * modes.length)])
    }, 8000)

    return () => clearInterval(weatherInterval)
  }, [])

  const validateForm = () => {
    if (!email.trim()) {
      showToast("error", "Email Required", "Please enter your email address")
      return false
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast("error", "Invalid Email", "Please enter a valid email address")
      return false
    }

    if (!password.trim()) {
      showToast("error", "Password Required", "Please enter your password")
      return false
    }

    if (password.length < 6) {
      showToast("error", "Password Too Short", "Password must be at least 6 characters")
      return false
    }

    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      })

      if (!response) {
        throw new Error("No response from server")
      }

      const responseText = await response.text()

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse JSON:", responseText)
        throw new Error("Server returned invalid data")
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed")
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response format")
      }

      await AsyncStorage.multiSet([
        ["userToken", data.token],
        ["userData", JSON.stringify(data.user)],
        ["isAuthenticated", "true"],
      ])

      showToast("success", "Login Successful", `Welcome back, ${data.user.name || data.user.email}!`)

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    } catch (error) {
      console.error("Login Error:", error)
      showToast("error", "Login Failed", error.message || "An error occurred during login")
    } finally {
      setLoading(false)
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

  const logoScale = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const formTranslateY = formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={getWeatherGradient()} style={styles.gradientContainer}>
        {/* Animated Weather Particles */}
        {Array.from({ length: 8 }, (_, i) => (
          <WeatherParticle
            key={i}
            type={weatherMode === "rainy" ? "water" : weatherMode === "sunny" ? "sunny" : "leaf"}
            delay={i * 500}
          />
        ))}

        {/* Floating Plants */}
        <AnimatedPlant style={styles.plantTopLeft} />
        <AnimatedPlant style={styles.plantTopRight} />
        <AnimatedPlant style={styles.plantBottomLeft} />

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
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <View style={styles.logoInner}>
                <Ionicons name="leaf" size={50} color="#ffffff" />
                <View style={styles.logoAccent}>
                  <Ionicons name="water" size={20} color="#3b82f6" />
                </View>
              </View>
            </Animated.View>
            <Text style={styles.welcomeText}>TANIMO</Text>
            <Text style={styles.subtitle}>Intelligent Plants Monitoring and Distribution App
</Text>

            {/* Weather Indicator */}
            <View style={styles.weatherIndicator}>
              <Ionicons
                name={weatherMode === "sunny" ? "sunny" : weatherMode === "rainy" ? "rainy" : "cloudy"}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.weatherText}>{weatherMode.charAt(0).toUpperCase() + weatherMode.slice(1)} Day</Text>
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
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, focusedInput === "email" && styles.inputWrapperFocused]}>
                <Ionicons name="mail-outline" size={20} color="#22c55e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
                {focusedInput === "email" && (
                  <View style={styles.focusIndicator}>
                    <Ionicons name="leaf" size={16} color="#22c55e" />
                  </View>
                )}
              </View>

              <View style={[styles.inputWrapper, focusedInput === "password" && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color="#22c55e" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor="#a0a0a0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#22c55e" />
                </TouchableOpacity>
                {focusedInput === "password" && (
                  <View style={styles.focusIndicator}>
                    <Ionicons name="leaf" size={16} color="#22c55e" />
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
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
                    <Text style={styles.loginButtonText}>Log In</Text>
                    <Ionicons name="leaf" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Plant Care Tips */}
            <View style={styles.tipContainer}>
              <Ionicons name="bulb-outline" size={16} color="#22c55e" />
              <Text style={styles.tipText}>💡 Tip: Water your plants when the soil feels dry to touch</Text>
            </View>

          
          
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to plant care? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signUpText}>Start Growing</Text>
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
    justifyContent: "center",
    minHeight: height,
  },
  particle: {
    position: "absolute",
    left: Math.random() * width,
    opacity: 0.7,
  },
  plantTopLeft: {
    position: "absolute",
    top: 100,
    left: 20,
  },
  plantTopRight: {
    position: "absolute",
    top: 120,
    right: 30,
  },
  plantBottomLeft: {
    position: "absolute",
    bottom: 100,
    left: 30,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logoInner: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoAccent: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 5,
  },
  welcomeText: {
    fontSize: 32,
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
  weatherIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weatherText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: "#22c55e",
    backgroundColor: "#fff",
    shadowColor: "#22c55e",
    shadowOpacity: 0.2,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    padding: 5,
  },
  focusIndicator: {
    position: "absolute",
    right: -10,
    top: "50%",
    marginTop: -8,
    backgroundColor: "#fff",
    borderRadius: 8,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
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
    flexDirection: "row",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
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
  socialSection: {
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 20,
    color: "#888",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#888",
    fontSize: 16,
  },
  signUpText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default Login
