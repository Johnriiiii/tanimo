import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const PlantHealthScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectImage = async () => {
    setLoading(true);
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (!response.didCancel && response.assets?.[0]?.uri) {
        setImageUri(response.assets[0].uri);
        analyzePlant(response.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock analysis function - replace with your actual logic
  const analyzePlant = (uri) => {
    setTimeout(() => {
      const mockResults = {
        status: ['Overwatered', 'Underwatered', 'Healthy'][Math.floor(Math.random() * 3)],
        needsFertilizer: Math.random() > 0.5,
        readyToHarvest: Math.random() > 0.7,
      };
      setResults(mockResults);
    }, 1500); // Simulate analysis delay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Health Scanner</Text>
      
      {!imageUri ? (
        <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
          <Text style={styles.uploadButtonText}>Upload Plant Photo</Text>
        </TouchableOpacity>
      ) : (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your plant...</Text>
        </View>
      )}

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultHeader}>Analysis Results:</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Status:</Text>
            <Text style={[
              styles.resultValue,
              results.status === 'Healthy' && styles.healthy,
              results.status !== 'Healthy' && styles.warning
            ]}>
              {results.status}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Fertilizer Needed:</Text>
            <Text style={styles.resultValue}>
              {results.needsFertilizer ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Harvest Ready:</Text>
            <Text style={styles.resultValue}>
              {results.readyToHarvest ? 'Yes' : 'Not Yet'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.newScanButton} 
            onPress={() => {
              setImageUri(null);
              setResults(null);
            }}
          >
            <Text style={styles.newScanButtonText}>Analyze Another Plant</Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  healthy: {
    color: '#4CAF50',
  },
  warning: {
    color: '#FF5722',
  },
  newScanButton: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  newScanButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default PlantHealthScreen;