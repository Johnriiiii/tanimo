import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';
import { showToast } from '../../utils/toast';

const ChatList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${API_BASE_URL}/chat/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            showToast('error', 'Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUserPress = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${API_BASE_URL}/chat/conversation/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get conversation');
            }

            const conversation = await response.json();
            navigation.navigate('ChatRoom', {
                conversationId: conversation._id,
                recipientName: users.find(u => u._id === userId).name
            });
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserPress(item._id)}
        >
            <Image
                source={
                    item.profilePicture
                        ? { uri: item.profilePicture }
                        : require('../../assets/default-profile.png')
                }
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContainer: {
        padding: 16
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    userRole: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32
    },
    emptyText: {
        fontSize: 16,
        color: '#666'
    }
});

export default ChatList;
