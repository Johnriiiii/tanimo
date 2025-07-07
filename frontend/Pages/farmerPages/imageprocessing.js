import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import FormData from 'form-data';
import API_BASE_URL from '../../utils/api';

const PlantAnalysisScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera roll permissions to analyze plants');
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
        setAnalysis(null); // Clear previous analysis
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const analyzePlant = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      const filename = image.split('/').pop();
      const fileType = filename.split('.').pop();
      
      formData.append('image', {
        uri: image,
        name: filename,
        type: `image/${fileType}`,
      });

      const response = await axios.post(`${API_BASE_URL}/plant/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze plant. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.sectionTitle}>Analysis Results</Text>
          
          {/* Health Status Card */}
          <View style={[styles.resultCard, 
            analysis.healthStatus.status === 'Healthy' ? styles.healthyCard :
            analysis.healthStatus.status.includes('Unhealthy') ? styles.unhealthyCard :
            styles.moderateCard]}>
            <Text style={styles.resultTitle}>Plant Health:</Text>
            <Text style={styles.resultValue}>{analysis.healthStatus.status}</Text>
            <Text style={styles.resultDetail}>Confidence: {analysis.healthStatus.confidence}</Text>
          </View>
          
          {/* Harvest Status Card */}
          <View style={[styles.resultCard, 
            analysis.harvestStatus.status === 'Ready to Harvest' ? styles.readyCard :
            analysis.harvestStatus.status === 'Overripe' ? styles.overripeCard :
            styles.notReadyCard]}>
            <Text style={styles.resultTitle}>Harvest Readiness:</Text>
            <Text style={styles.resultValue}>{analysis.harvestStatus.status}</Text>
            <Text style={styles.resultDetail}>{analysis.harvestStatus.recommendation}</Text>
          </View>
          
          {/* Color Analysis */}
          <View style={styles.colorAnalysisContainer}>
            <Text style={styles.sectionTitle}>Color Composition</Text>
            <View style={styles.colorBars}>
              <View style={[styles.colorBar, styles.greenBar, { width: `${analysis.colorAnalysis.green}` }]} />
              <View style={[styles.colorBar, styles.yellowBar, { width: `${analysis.colorAnalysis.yellow}` }]} />
              <View style={[styles.colorBar, styles.brownBar, { width: `${analysis.colorAnalysis.brown}` }]} />
            </View>
            <View style={styles.colorLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, styles.greenBox]} />
                <Text>Green: {analysis.colorAnalysis.green}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, styles.yellowBox]} />
                <Text>Yellow: {analysis.colorAnalysis.yellow}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, styles.brownBox]} />
                <Text>Brown: {analysis.colorAnalysis.brown}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  imageButton: {
    height: 250,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
  },
  resultCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
  },
  healthyCard: {
    backgroundColor: '#d5f5e3',
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  unhealthyCard: {
    backgroundColor: '#fadbd8',
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  moderateCard: {
    backgroundColor: '#fef9e7',
    borderLeftWidth: 5,
    borderLeftColor: '#f39c12',
  },
  readyCard: {
    backgroundColor: '#e8f8f5',
    borderLeftWidth: 5,
    borderLeftColor: '#1abc9c',
  },
  overripeCard: {
    backgroundColor: '#fdedec',
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  notReadyCard: {
    backgroundColor: '#eaf2f8',
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2c3e50',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultDetail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  colorAnalysisContainer: {
    marginTop: 10,
  },
  colorBars: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  colorBar: {
    height: '100%',
  },
  greenBar: {
    backgroundColor: '#2ecc71',
  },
  yellowBar: {
    backgroundColor: '#f1c40f',
  },
  brownBar: {
    backgroundColor: '#a04000',
  },
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 15,
    height: 15,
    marginRight: 5,
    borderRadius: 3,
  },
  greenBox: {
    backgroundColor: '#2ecc71',
  },
  yellowBox: {
    backgroundColor: '#f1c40f',
  },
  brownBox: {
    backgroundColor: '#a04000',
  },
});

export default PlantAnalysisScreen;