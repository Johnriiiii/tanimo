import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

  const plants = [
  // Vegetables (10 total)
  {
    id: '1',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: 'Daily (keep soil moist)',
    sunlight: 'Full sun (6+ hours)',
    description: 'Juicy red fruits rich in lycopene. Requires staking. Harvest in 60-80 days. Vulnerable to aphids—use neem oil as prevention.',
    photo: 'https://cdn.pixabay.com/photo/2017/01/20/16/05/tomatoes-1994756_640.jpg',
    season: 'Summer',
  },
  {
    id: '2',
    name: 'Carrot',
    scientificName: 'Daucus carota',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: 'Weekly (deep watering)',
    sunlight: 'Full sun',
    description: 'Orange root vegetable rich in beta-carotene. Loose soil prevents forked roots. Thin seedlings to 2 inches apart.',
    photo: 'https://cdn.pixabay.com/photo/2014/11/25/16/32/carrots-545226_640.jpg',
    season: 'Cool weather',
  },
  {
    id: '6',
    name: 'Bell Pepper',
    scientificName: 'Capsicum annuum',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: 'Every 2-3 days',
    sunlight: 'Full sun',
    description: 'Colorful peppers that start green and mature to red, yellow or orange. Requires warm soil to thrive.',
    photo: 'https://cdn.pixabay.com/photo/2016/08/11/08/49/peppers-1586165_640.jpg',
    season: 'Summer',
  },
  {
    id: '7',
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    type: 'Vegetable',
    careLevel: 'Easy',
    water: 'Keep soil consistently moist',
    sunlight: 'Partial shade to full sun',
    description: 'Nutrient-rich leafy green. Grows quickly in cool weather. Harvest outer leaves to allow center to keep growing.',
    photo: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/spinach-1238330_640.jpg',
    season: 'Spring/Fall',
  },
  {
    id: '11',
    name: 'Zucchini',
    scientificName: 'Cucurbita pepo',
    type: 'Vegetable',
    careLevel: 'Easy',
    water: 'Weekly (1-2 inches)',
    sunlight: 'Full sun',
    description: 'Fast-growing summer squash. Harvest when 6-8 inches long for best flavor. Bees needed for pollination.',
    photo: 'https://cdn.pixabay.com/photo/2016/03/05/22/18/zucchini-1239428_640.jpg',
    season: 'Summer',
  },
  {
    id: '12',
    name: 'Broccoli',
    scientificName: 'Brassica oleracea',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: '1-1.5 inches weekly',
    sunlight: 'Full sun',
    description: 'Cool-weather crop rich in vitamins. Harvest central head first, then side shoots. Watch for cabbage worms.',
    photo: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238254_640.jpg',
    season: 'Spring/Fall',
  },
  {
    id: '13',
    name: 'Cucumber',
    scientificName: 'Cucumis sativus',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: 'Frequent, consistent moisture',
    sunlight: 'Full sun',
    description: 'Vining plant that benefits from trellising. Pick regularly to encourage more fruit. Sensitive to frost.',
    photo: 'https://cdn.pixabay.com/photo/2016/08/11/08/43/cucumber-1585559_640.jpg',
    season: 'Summer',
  },
  {
    id: '14',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    type: 'Vegetable',
    careLevel: 'Easy',
    water: 'Weekly (1-2 inches)',
    sunlight: 'Full sun',
    description: 'Grows underground from seed potatoes. Hill soil around stems as plants grow. Harvest after foliage dies back.',
    photo: 'https://cdn.pixabay.com/photo/2014/08/06/20/32/potatoes-412802_640.jpg',
    season: 'Spring to Summer',
  },
  {
    id: '15',
    name: 'Eggplant',
    scientificName: 'Solanum melongena',
    type: 'Vegetable',
    careLevel: 'Medium',
    water: 'Weekly (1-2 inches)',
    sunlight: 'Full sun',
    description: 'Heat-loving plant with glossy purple fruit. Stake plants to support heavy fruit. Harvest when skin is shiny.',
    photo: 'https://cdn.pixabay.com/photo/2016/08/11/08/43/aubergine-1585557_640.jpg',
    season: 'Summer',
  },
  {
    id: '16',
    name: 'Kale',
    scientificName: 'Brassica oleracea',
    type: 'Vegetable',
    careLevel: 'Easy',
    water: 'Weekly (1-1.5 inches)',
    sunlight: 'Full sun to partial shade',
    description: 'Cold-hardy superfood. Flavor improves after frost. Harvest outer leaves for continuous growth.',
    photo: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/kale-1238255_640.jpg',
    season: 'Spring/Fall/Winter',
  },

  // Fruits (8 total)
  {
    id: '8',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    type: 'Fruit',
    careLevel: 'Medium',
    water: 'Keep soil moist',
    sunlight: 'Full sun',
    description: 'Sweet red berries that spread via runners. Mulch to keep fruit clean. Replace plants every 3-4 years for best production.',
    photo: 'https://cdn.pixabay.com/photo/2018/04/29/11/54/strawberries-3359755_640.jpg',
    season: 'Spring/Summer',
  },
  {
    id: '9',
    name: 'Blueberry',
    scientificName: 'Vaccinium spp.',
    type: 'Fruit',
    careLevel: 'Medium',
    water: 'Regular watering',
    sunlight: 'Full sun',
    description: 'Acidic soil required (pH 4.0-5.0). Produces antioxidant-rich berries. Prune old canes to encourage new growth.',
    photo: 'https://cdn.pixabay.com/photo/2017/05/07/19/32/blueberry-2294181_640.jpg',
    season: 'Summer',
  },
  {
    id: '10',
    name: 'Lemon Tree',
    scientificName: 'Citrus limon',
    type: 'Fruit',
    careLevel: 'Medium-Hard',
    water: 'Deep watering weekly',
    sunlight: 'Full sun',
    description: 'Evergreen tree producing fragrant flowers and vitamin C-rich fruit. Protect from frost. Can be grown in containers.',
    photo: 'https://cdn.pixabay.com/photo/2017/09/16/17/42/lemon-2756487_640.jpg',
    season: 'Year-round (fruit in winter)',
  },
  {
    id: '17',
    name: 'Raspberry',
    scientificName: 'Rubus idaeus',
    type: 'Fruit',
    careLevel: 'Medium',
    water: 'Weekly (1-2 inches)',
    sunlight: 'Full sun',
    description: 'Produces canes that fruit in second year. Prune old canes after harvest. Needs support for best growth.',
    photo: 'https://cdn.pixabay.com/photo/2017/07/01/17/48/raspberries-2462669_640.jpg',
    season: 'Summer',
  },
  {
    id: '18',
    name: 'Apple Tree',
    scientificName: 'Malus domestica',
    type: 'Fruit',
    careLevel: 'Hard',
    water: 'Deep watering every 2 weeks',
    sunlight: 'Full sun',
    description: 'Requires winter chill hours to fruit. Needs cross-pollination from another variety. Prune annually for best yield.',
    photo: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/apple-1122537_640.jpg',
    season: 'Fall',
  },
  {
    id: '19',
    name: 'Watermelon',
    scientificName: 'Citrullus lanatus',
    type: 'Fruit',
    careLevel: 'Medium',
    water: 'Deep watering weekly',
    sunlight: 'Full sun',
    description: 'Space-hungry vine that needs warm soil. Look for yellow spot on bottom when ripe. Stop watering near harvest for sweeter fruit.',
    photo: 'https://cdn.pixabay.com/photo/2016/02/23/17/42/watermelon-1218157_640.jpg',
    season: 'Summer',
  },
  {
    id: '20',
    name: 'Fig Tree',
    scientificName: 'Ficus carica',
    type: 'Fruit',
    careLevel: 'Medium',
    water: 'Weekly (deep watering)',
    sunlight: 'Full sun',
    description: 'Drought-tolerant once established. May produce two crops per year in warm climates. Protect from extreme cold.',
    photo: 'https://cdn.pixabay.com/photo/2017/05/29/18/38/fig-2353419_640.jpg',
    season: 'Summer/Fall',
  },
  {
    id: '21',
    name: 'Grape Vine',
    scientificName: 'Vitis vinifera',
    type: 'Fruit',
    careLevel: 'Medium-Hard',
    water: 'Weekly (deep watering)',
    sunlight: 'Full sun',
    description: 'Requires strong support structure. Prune heavily in winter. Thin clusters for better quality fruit.',
    photo: 'https://cdn.pixabay.com/photo/2017/08/02/00/52/grapes-2568449_640.jpg',
    season: 'Late Summer/Fall',
  },

  // Herbs (6 total)
  {
    id: '3',
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Every 2-3 days',
    sunlight: 'Partial to full sun',
    description: 'Fragrant leaves perfect for pesto. Pinch flowers to prolong leaf growth. Sensitive to cold—bring indoors in winter.',
    photo: 'https://cdn.pixabay.com/photo/2016/11/30/12/16/basil-1872996_640.jpg',
    season: 'Spring-Fall',
  },
  {
    id: '4',
    name: 'Mint',
    scientificName: 'Mentha spp.',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Keep soil moist',
    sunlight: 'Partial shade',
    description: 'Fast-spreading herb with cooling flavor. Best grown in containers to control roots. Use in teas or desserts.',
    photo: 'https://cdn.pixabay.com/photo/2016/11/21/17/57/mint-1846262_640.jpg',
    season: 'Spring-Fall',
  },
  {
    id: '22',
    name: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Let soil dry between',
    sunlight: 'Full sun',
    description: 'Woody perennial with pine-like fragrance. Drought-tolerant. Can be shaped into topiary. Protect from extreme cold.',
    photo: 'https://cdn.pixabay.com/photo/2017/05/29/18/38/herbs-2353420_640.jpg',
    season: 'Year-round',
  },
  {
    id: '23',
    name: 'Thyme',
    scientificName: 'Thymus vulgaris',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Let soil dry between',
    sunlight: 'Full sun',
    description: 'Low-growing perennial with tiny fragrant leaves. Excellent for borders and containers. Attracts pollinators.',
    photo: 'https://cdn.pixabay.com/photo/2017/03/27/12/29/spices-2178553_640.jpg',
    season: 'Year-round',
  },
  {
    id: '24',
    name: 'Parsley',
    scientificName: 'Petroselinum crispum',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Keep soil moist',
    sunlight: 'Full sun to partial shade',
    description: 'Biennial often grown as annual. Flat-leaf has stronger flavor than curly. Rich in vitamins A and C.',
    photo: 'https://cdn.pixabay.com/photo/2016/08/02/15/12/parsley-1563934_640.jpg',
    season: 'Spring-Fall',
  },
  {
    id: '25',
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    type: 'Herb',
    careLevel: 'Easy',
    water: 'Keep soil moist',
    sunlight: 'Partial shade',
    description: 'Fast-growing with leaves (cilantro) and seeds (coriander) both edible. Bolt-resistant varieties last longer in heat.',
    photo: 'https://cdn.pixabay.com/photo/2017/05/07/08/40/coriander-2292431_640.jpg',
    season: 'Spring/Fall',
  },

  // Ornamentals (6 total)
  {
    id: '5',
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    type: 'Ornamental',
    careLevel: 'Very Easy',
    water: 'Every 3-4 weeks',
    sunlight: 'Low to bright indirect',
    description: 'Purifies air by removing toxins. Thrives in neglect. Avoid overwatering—let soil dry completely between waterings.',
    photo: 'https://cdn.pixabay.com/photo/2020/07/15/18/13/snake-plant-5408670_640.jpg',
    season: 'Year-round',
  },
  {
    id: '26',
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    type: 'Ornamental',
    careLevel: 'Easy',
    water: 'Weekly (keep moist)',
    sunlight: 'Low to medium indirect',
    description: 'Tropical plant with white spathes. Droops when thirsty. Excellent air purifier. Keep away from pets (toxic if ingested).',
    photo: 'https://cdn.pixabay.com/photo/2017/01/10/03/06/lily-1968196_640.jpg',
    season: 'Year-round',
  },
  {
    id: '27',
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    type: 'Ornamental',
    careLevel: 'Medium',
    water: 'Weekly (let top dry)',
    sunlight: 'Bright indirect',
    description: 'Iconic split-leaf plant. Provide moss pole for support. Wipe leaves regularly to keep pores clear.',
    photo: 'https://cdn.pixabay.com/photo/2021/01/25/15/40/monstera-5949372_640.jpg',
    season: 'Year-round',
  },
  {
    id: '28',
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    type: 'Ornamental',
    careLevel: 'Very Easy',
    water: 'When soil dries out',
    sunlight: 'Low to bright indirect',
    description: 'Trailing vine that purifies air. Nearly indestructible. Can grow in water permanently. Many colorful varieties available.',
    photo: 'https://cdn.pixabay.com/photo/2020/06/15/15/40/pothos-5301737_640.jpg',
    season: 'Year-round',
  },
  {
    id: '29',
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    type: 'Ornamental',
    careLevel: 'Very Easy',
    water: 'Every 3-4 weeks',
    sunlight: 'Low to bright indirect',
    description: 'Drought-tolerant with glossy leaves. Stores water in rhizomes. Grows slowly but thrives on neglect.',
    photo: 'https://cdn.pixabay.com/photo/2020/07/15/18/13/zz-plant-5408669_640.jpg',
    season: 'Year-round',
  },
  {
    id: '30',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    type: 'Ornamental',
    careLevel: 'Medium-Hard',
    water: 'Weekly (let top dry)',
    sunlight: 'Bright indirect',
    description: 'Trendy tree with large violin-shaped leaves. Sensitive to moves and drafts. Wipe leaves monthly for best health.',
    photo: 'https://cdn.pixabay.com/photo/2020/04/21/18/52/ficus-lyrata-5075053_640.jpg',
    season: 'Year-round',
  }
];


const PlantLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetable', 'Fruit', 'Herb', 'Ornamental'];

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || plant.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openPlantDetails = (plant) => {
    setSelectedPlant(plant);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#5E8C61" />
        <TextInput
          style={styles.searchBar}
          placeholder="Search plants..."
          placeholderTextColor="#5E8C61"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plant Grid */}
      <FlatList
        data={filteredPlants}
        renderItem={({ item }) => (
          <View style={styles.plantCard}>
            <Image source={{ uri: item.photo }} style={styles.plantImage} />
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={styles.plantSciName}>{item.scientificName}</Text>
                <Text style={styles.plantType}>{item.type}</Text>
              </View>
              <TouchableOpacity 
                style={styles.seeButton}
                onPress={() => openPlantDetails(item)}
              >
                <Text style={styles.seeButtonText}>See Plant</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      {/* Plant Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedPlant && (
              <>
                <Image 
                  source={{ uri: selectedPlant.photo }} 
                  style={styles.modalImage} 
                />
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedPlant.name}</Text>
                  <Text style={styles.modalSciName}>{selectedPlant.scientificName}</Text>
                  <Text style={styles.modalType}>{selectedPlant.type}</Text>
                  
                  <View style={styles.detailSection}>
                    <Ionicons name="leaf" size={18} color="#5E8C61" />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Care:</Text> {selectedPlant.careLevel}
                    </Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Ionicons name="water" size={18} color="#5E8C61" />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Water:</Text> {selectedPlant.water}
                    </Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Ionicons name="sunny" size={18} color="#FFA726" />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Light:</Text> {selectedPlant.sunlight}
                    </Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Ionicons name="calendar" size={18} color="#78909C" />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Season:</Text> {selectedPlant.season}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalDescription}>{selectedPlant.description}</Text>
                </ScrollView>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles (Nature-Inspired Palette)
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#F5F9F5',
    padding: 15,
},
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
},
searchBar: {
    flex: 1,
    height: 40,
    color: '#2E7D32',
    marginLeft: 10,
},
categoryContainer: {
    marginBottom: 15,
    maxHeight: 40,
},
categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    marginRight: 10,
},
selectedCategoryButton: {
    backgroundColor: '#5E8C61',
},
categoryText: {
    color: '#5E8C61',
},
selectedCategoryText: {
    color: '#FFF',
    fontWeight: 'bold',
},
plantCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
},
plantImage: {
    width: '100%',
    height: 120,
},
cardFooter: {
    padding: 12,
    flex: 1, // Add this to take available space
    justifyContent: 'space-between', // This will push content to top and button to bottom
},
plantName: {
    fontWeight: 'bold',
    color: '#2E7D32',
},
plantSciName: {
    fontSize: 12,
    color: '#78909C',
    fontStyle: 'italic',
},
plantType: {
    fontSize: 12,
    color: '#5E8C61',
    marginTop: 2,
},
seeButton: {
    backgroundColor: '#5E8C61',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 8,
    alignSelf: 'flex-start', // Changed to flex-start to align left, or keep flex-end for right
},
seeButtonText: {
    color: '#FFF',
    fontSize: 12,
},
// Modal Styles
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalCard: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
},
modalImage: {
    width: '100%',
    height: 200,
},
modalContent: {
    padding: 20,
},
modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
},
modalSciName: {
    fontSize: 16,
    color: '#78909C',
    fontStyle: 'italic',
},
modalType: {
    fontSize: 16,
    color: '#5E8C61',
    marginBottom: 15,
},
detailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
},
detailLabel: {
    fontWeight: 'bold',
    color: '#455A64',
},
detailText: {
    color: '#546E7A',
},
modalDescription: {
    marginTop: 15,
    lineHeight: 22,
    color: '#455A64',
},
closeButton: {
    backgroundColor: '#5E8C61',
    padding: 12,
    alignItems: 'center',
},
closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
},
});

export default PlantLibrary;