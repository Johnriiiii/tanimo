import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../utils/api'; // Adjust this path

const GardenersScreen = () => {
  const [gardeners, setGardeners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGardeners = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/gardeners`);
        setGardeners(response.data);
      } catch (error) {
        console.error('Error fetching gardeners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGardeners();
  }, []);

  const renderVegetable = (veg) => (
    <View key={veg._id} style={styles.vegetableCard}>
      {veg.image ? (
        <Image source={{ uri: veg.image }} style={styles.vegetableImage} />
      ) : (
        <Text>No image</Text>
      )}
      <Text style={styles.vegName}>{veg.name}</Text>
      <Text style={styles.vegCategory}>{veg.category}</Text>
    </View>
  );

const renderGardener = ({ item }) => {
  const isCloudinaryLink = item.profilePhoto?.includes('https://res.cloudinary.com');
  const profileImageSource = isCloudinaryLink
    ? { uri: item.profilePhoto }
    : require('../../assets/default-profile.png');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={item.profilePhoto && isCloudinaryLink ? profileImageSource : require('../../assets/default-profile.png')}
          style={styles.profileImage}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.email}</Text>
          <Text>{item.address?.city || 'No City'}</Text>
        </View>
      </View>

      <Text style={styles.subTitle}>Vegetables:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {item.vegetables.length > 0 ? (
          item.vegetables.map(renderVegetable)
        ) : (
          <Text style={{ marginLeft: 10 }}>No vegetables yet</Text>
        )}
      </ScrollView>
    </View>
  );
};

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of Gardeners</Text>
      <FlatList
        data={gardeners}
        keyExtractor={(item) => item._id}
        renderItem={renderGardener}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  header: { flexDirection: 'row', marginBottom: 10 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  details: { justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  subTitle: { fontWeight: '600', marginBottom: 5 },
  vegetableCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 120,
  },
  vegetableImage: {
    width: 100,
    height: 70,
    borderRadius: 5,
    marginBottom: 5,
  },
  vegName: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  vegCategory: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});

export default GardenersScreen;
