import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import FormData from "form-data";
import API_BASE_URL from "../../utils/api";

const PlantAnalysisScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need camera roll permissions to analyze plants"
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setAnalysis(null);
      }

      console.log(result);
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const analyzePlant = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      const filename = image.split("/").pop();
      const fileType = filename.split(".").pop();

      const imageFile = {
        uri: image,
        name: filename,
        type: `image/${fileType}`,
      };

      formData.append("image", imageFile);

      const response = await axios.post(`${API_BASE_URL}/openai/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server Response:", response.data);

      const prediction = response.data.result.prediction;
      const confidencePercent = prediction.confidence * 100;

      let conditionLabel = "";
      if (confidencePercent <= 70) {
        conditionLabel = "Unhealthy";
      } else if (confidencePercent <= 90) {
        conditionLabel = "Mild Condition";
      } else {
        conditionLabel = "Healthy";
      }

      setAnalysis({
        className: prediction.class_name,
        confidence: confidencePercent.toFixed(2) + "%",
        condition: conditionLabel,
      });
    } catch (error) {
      console.error("Analysis error:", error.response || error.message);
      Alert.alert("Error", "Failed to analyze plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setImage(null);
    setAnalysis(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Health Scanner</Text>

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.buttonText}>Select Plant Photo</Text>
        )}
      </TouchableOpacity>

      {image && !analysis && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzePlant}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Analyze Plant</Text>
          )}
        </TouchableOpacity>
      )}

{analysis && (
  <View style={styles.resultsContainer}>
    <Text style={styles.sectionTitle}>🌿 Analysis Result</Text>

    <View
      style={[
        styles.resultCard,
        analysis.condition === "Healthy"
          ? styles.healthyCard
          : analysis.condition === "Mild Condition"
          ? styles.mildCard
          : styles.unhealthyCard,
      ]}
    >
      <Text style={styles.resultTitle}>🌱 Plant Condition</Text>
      <Text style={styles.resultValue}>
        {analysis.condition === "Healthy"
          ? "🟢 Healthy"
          : analysis.condition === "Mild Condition"
          ? "🟡 Mild Condition"
          : "🔴 Unhealthy"}
      </Text>

      <Text style={styles.resultDetail}>🧪 Detected: {analysis.className}</Text>
      <Text style={styles.resultDetail}>📊 Confidence: {analysis.confidence}</Text>
      <Text style={styles.resultDetail}>🕒 Scanned: {new Date().toLocaleString()}</Text>

      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionTitle}>📝 Suggestion:</Text>
        <Text style={styles.suggestionText}>
          {analysis.condition === "Healthy"
            ? "Your plant looks healthy! Keep providing consistent care. 🌞"
            : analysis.condition === "Mild Condition"
            ? "Monitor the plant and check soil, light, and water conditions. 📋"
            : "Consider pruning, changing soil, or checking for pests or diseases. 🛠️"}
        </Text>
      </View>
    </View>

    <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
      <Text style={styles.scanAgainText}>🔄 Scan Again</Text>
    </TouchableOpacity>
  </View>
)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  imageButton: {
    height: 250,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  buttonText: {
    color: "#3498db",
    fontWeight: "bold",
  },
  analyzeButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  resultsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
  },
  resultCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
  },
  healthyCard: {
    backgroundColor: "#d5f5e3",
    borderLeftWidth: 5,
    borderLeftColor: "#2ecc71",
  },
  mildCard: {
    backgroundColor: "#fcf3cf",
    borderLeftWidth: 5,
    borderLeftColor: "#f1c40f",
  },
  unhealthyCard: {
    backgroundColor: "#fadbd8",
    borderLeftWidth: 5,
    borderLeftColor: "#e74c3c",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#2c3e50",
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultDetail: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  scanAgainButton: {
    backgroundColor: "#2980b9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  scanAgainText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PlantAnalysisScreen;
