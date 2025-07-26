import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking, Animated, Easing, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AboutUsScreen = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Daniela Dayag',
      role: 'Web Developer',
      image: require('../assets/team/daniela.jpg'),
      skills: ['React.js', 'HTML/CSS', 'UI/UX Design'],
    },
    {
      id: 2,
      name: 'Christian Salagubang',
      role: 'Web Developer',
      image: require('../assets/team/christian.jpg'),
      skills: ['JavaScript', 'Responsive Design', 'Web APIs'],
    },
    {
      id: 3,
      name: 'Bryan James Batan',
      role: 'Mobile Developer',
      image: require('../assets/team/bryan.jpg'),
      skills: ['React Native', 'iOS/Android', 'Mobile UI'],
    },
    {
      id: 4,
      name: 'John Riell Rana',
      role: 'Mobile Developer',
      image: require('../assets/team/john.jpg'),
      skills: ['Cross-platform', 'App Deployment', 'Mobile APIs'],
    },
  ];

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideUpAnim = new Animated.Value(100);
  const cardScale = new Animated.Value(0.9);

  useEffect(() => {
    // Header fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Content slide up
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Card scale animation
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCardPress = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>About Tanimo</Text>
        <Text style={styles.subtitle}>
          Smart gardening companion connecting urban farmers with local markets
        </Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.section, 
          { 
            transform: [{ translateY: slideUpAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Our Innovation</Text>
        <View style={styles.innovationCard}>
          <MaterialIcons name="wb-sunny" size={24} color="#FFC107" style={styles.cardIcon} />
          <Text style={styles.cardText}>
            Tanimo revolutionizes urban farming with AI-powered plant monitoring and direct market connections.
          </Text>
        </View>
        <View style={styles.innovationCard}>
          <MaterialIcons name="timeline" size={24} color="#4CAF50" style={styles.cardIcon} />
          <Text style={styles.cardText}>
            Developed for Application Development and Emerging Technologies course at BSIT-NS-T-3A-T.
          </Text>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.section, 
          { 
            transform: [{ translateY: slideUpAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Development Team</Text>
        <View style={styles.teamContainer}>
          {teamMembers.map((member) => (
            <Animated.View 
              key={member.id} 
              style={[
                styles.memberCard, 
                { 
                  transform: [{ scale: cardScale }],
                }
              ]}
            >
              <TouchableOpacity activeOpacity={0.7}>
                <View style={styles.cardContent}>
                  <Image source={member.image} style={styles.memberImage} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <View style={styles.skillsContainer}>
                      {member.skills.map((skill, index) => (
                        <View key={index} style={styles.skillPill}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.section, 
          { 
            transform: [{ translateY: slideUpAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Technical Stack</Text>
        <View style={styles.techStack}>
          <View style={styles.techColumn}>
            <Text style={styles.techTitle}>Web Platform</Text>
            <View style={styles.techItem}>
              <MaterialIcons name="web" size={20} color="#2196F3" />
              <Text style={styles.techText}>React.js</Text>
            </View>
            <View style={styles.techItem}>
              <MaterialIcons name="palette" size={20} color="#2196F3" />
              <Text style={styles.techText}>Material UI</Text>
            </View>
          </View>
          <View style={styles.techColumn}>
            <Text style={styles.techTitle}>Mobile App</Text>
            <View style={styles.techItem}>
              <MaterialIcons name="phone-iphone" size={20} color="#4CAF50" />
              <Text style={styles.techText}>React Native</Text>
            </View>
            <View style={styles.techItem}>
              <MaterialIcons name="expo" size={20} color="#4CAF50" />
              <Text style={styles.techText}>Expo</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.section, 
          { 
            transform: [{ translateY: slideUpAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Connect With Us</Text>
        <View style={styles.socialCards}>
          <TouchableOpacity 
            style={styles.socialCard}
            onPress={() => handleCardPress('mailto:tanimo.support@example.com')}
          >
            <MaterialIcons name="email" size={28} color="#D44638" />
            <Text style={styles.socialText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialCard}
            onPress={() => handleCardPress('https://github.com/tanimo-app')}
          >
            <MaterialIcons name="code" size={28} color="#333" />
            <Text style={styles.socialText}>GitHub</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialCard}
            onPress={() => handleCardPress('https://facebook.com/tanimo-app')}
          >
            <MaterialIcons name="facebook" size={28} color="#3b5998" />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 16,
    paddingLeft: 8,
  },
  innovationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memberCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  memberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillPill: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '500',
  },
  techStack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  techColumn: {
    width: '48%',
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  techText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  socialCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  socialCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    elevation: 2,
  },
  socialText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
});

export default AboutUsScreen;

