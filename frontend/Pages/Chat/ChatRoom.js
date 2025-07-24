import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';
import { showToast } from '../../utils/toast';

const ChatRoom = ({ route, navigation }) => {
    const { conversationId, recipientName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const flatListRef = useRef();

    useEffect(() => {
        navigation.setOptions({
            title: recipientName
        });
        fetchMessages();
        getUserId();
    }, []);

    const getUserId = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserId(payload.id);
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            setMessages(data);
        } catch (error) {
            showToast('error', 'Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${API_BASE_URL}/chat/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const sentMessage = await response.json();
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            flatListRef.current?.scrollToEnd();
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    };

    const renderMessage = ({ item }) => {
        const isOwnMessage = item.sender._id === userId;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessage : styles.otherMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                ]}>
                    {item.content}
                </Text>
                <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons
                        name="send"
                        size={24}
                        color={newMessage.trim() ? '#4CAF50' : '#ccc'}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    messagesList: {
        padding: 16
    },
    messageContainer: {
        maxWidth: '80%',
        marginVertical: 4,
        padding: 12,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',
        borderTopRightRadius: 4
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderTopLeftRadius: 4
    },
    messageText: {
        fontSize: 16
    },
    ownMessageText: {
        color: '#fff'
    },
    otherMessageText: {
        color: '#333'
    },
    messageTime: {
        fontSize: 12,
        color: '#rgba(0,0,0,0.5)',
        alignSelf: 'flex-end',
        marginTop: 4
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: 16
    },
    sendButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
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

export default ChatRoom;
