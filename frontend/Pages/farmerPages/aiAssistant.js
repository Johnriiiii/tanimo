import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, FlatList, SafeAreaView,
  Keyboard, Image, ActivityIndicator, Modal, Alert,
  Dimensions, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../../utils/toast';
import API_BASE_URL from '../../utils/api';

const { width, height } = Dimensions.get('window');

const RECOMMENDED_QUESTIONS = [
  "How often should I water my snake plant?",
  "What's the best fertilizer for indoor plants?",
  "Why are my plant's leaves turning yellow?",
  "How can I get rid of aphids naturally?",
  "What are the best low-light plants for my office?"
];

const AIChatbot = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showConversations, setShowConversations] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [conversationToRename, setConversationToRename] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          navigation.navigate('Login');
          return;
        }

        const convResponse = await fetch(`${API_BASE_URL}/ai/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const convData = await convResponse.json();
        setConversations(convData);

        if (route.params?.conversationId) {
          const existingConv = convData.find(c => c._id === route.params.conversationId);
          if (existingConv) {
            await loadMessages(existingConv._id);
          } else {
            await createNewConversation();
          }
        } else if (convData.length > 0) {
          await loadMessages(convData[0]._id);
        } else {
          await createNewConversation();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        showToast('error', 'Error', 'Failed to load conversations');
      }
    };

    initializeChat();
  }, []);

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load messages');
      
      const history = await response.json();
      const conv = conversations.find(c => c._id === conversationId) || 
                 { _id: conversationId, title: 'New Chat' };
      
      setCurrentConversation(conv);
      setMessages(history.length > 0 ? formatMessages(history) : [getWelcomeMessage()]);
      setShowRecommendations(history.length === 0);
    } catch (error) {
      console.error('Failed to load messages:', error);
      showToast('error', 'Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessages = (history) => {
    return history.map(msg => ({
      id: msg._id || Math.random().toString(),
      text: msg.content,
      sender: msg.role === 'user' ? 'user' : 'bot',
      timestamp: new Date(msg.createdAt)
    }));
  };

  const getWelcomeMessage = () => ({
    id: 'welcome',
    text: "🌿 Hello! I'm Tanimo, your plant care assistant. How can I help with your plants today?",
    sender: 'bot',
    timestamp: new Date()
  });

  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/ai/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      
      const newConv = await response.json();
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([getWelcomeMessage()]);
      setShowConversations(false);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error creating conversation:', error);
      showToast('error', 'Error', 'Failed to create new conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendedQuestion = (question) => {
    setInput(question);
    setShowRecommendations(false);
  };

  const renameConversation = async (conversationId, newTitle) => {
    try {
      setIsRenaming(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (!response.ok) throw new Error('Failed to rename conversation');
      
      const updatedConv = await response.json();
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId ? updatedConv : conv
        )
      );
      
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(updatedConv);
      }
      
      showToast('success', 'Success', 'Conversation renamed successfully');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      showToast('error', 'Error', 'Failed to rename conversation');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleRename = (conversation) => {
    setConversationToRename(conversation);
    setRenameText(conversation.title);
    setShowRenameModal(true);
  };

  const confirmRename = async () => {
    if (!renameText.trim() || !conversationToRename) return;
    
    await renameConversation(conversationToRename._id, renameText.trim());
    setShowRenameModal(false);
    setConversationToRename(null);
    setRenameText('');
  };

  const deleteConversation = async (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (!response.ok) throw new Error('Failed to delete conversation');
              
              setConversations(prev => prev.filter(c => c._id !== conversationId));
              
              if (currentConversation?._id === conversationId) {
                if (conversations.length > 1) {
                  const nextConv = conversations.find(c => c._id !== conversationId);
                  await loadMessages(nextConv._id);
                } else {
                  await createNewConversation();
                }
              }
            } catch (error) {
              console.error('Error deleting conversation:', error);
              showToast('error', 'Error', 'Failed to delete conversation');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { 
      id: Date.now().toString(),
      text: input, 
      sender: 'user',
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowRecommendations(false);
    Keyboard.dismiss();
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: input,
          conversationId: currentConversation?._id 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const botMessage = { 
        id: Date.now().toString(),
        text: data.response, 
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (data.conversationId && (!currentConversation || currentConversation._id !== data.conversationId)) {
        const convResponse = await fetch(`${API_BASE_URL}/ai/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedConvs = await convResponse.json();
        setConversations(updatedConvs);
        setCurrentConversation(updatedConvs.find(c => c._id === data.conversationId));
      }
    } catch (error) {
      console.error('Chat error:', error);
      showToast('error', 'Error', error.message || 'Failed to send message');
      
      const errorMessage = { 
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble responding. Please try again later.", 
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View 
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userContainer : styles.botContainer
      ]}
    >
      {item.sender === 'bot' && (
        <View style={styles.avatarContainer}>
          <Image 
            source={require('../../assets/samplelogo.png')}
            style={styles.avatar}
          />
        </View>
      )}
      <LinearGradient
        colors={item.sender === 'user' ? ['#4CAF50', '#81C784'] : ['#F1F8E9', '#DCEDC8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.botBubble
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.botText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </LinearGradient>
    </View>
  );

  const renderRecommendedQuestion = (question) => (
    <TouchableOpacity
      key={question}
      style={styles.recommendedQuestion}
      onPress={() => handleRecommendedQuestion(question)}
    >
      <Text style={styles.recommendedQuestionText}>{question}</Text>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.convItem,
        currentConversation?._id === item._id && styles.selectedConv
      ]}
      onPress={() => {
        loadMessages(item._id);
        setShowConversations(false);
      }}
    >
      <LinearGradient
        colors={currentConversation?._id === item._id ? ['#4CAF50', '#2E7D32'] : ['#F1F8E9', '#DCEDC8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.convGradient}
      >
        <View style={styles.convTextContainer}>
          <Text 
            style={[
              styles.convTitle,
              currentConversation?._id === item._id && styles.selectedConvText
            ]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text 
            style={[
              styles.convDate,
              currentConversation?._id === item._id && styles.selectedConvText
            ]}
          >
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.convActions}>
          <TouchableOpacity 
            style={styles.renameConvBtn}
            onPress={() => handleRename(item)}
            disabled={isRenaming}
          >
            {isRenaming && conversationToRename?._id === item._id ? (
              <ActivityIndicator size="small" color={currentConversation?._id === item._id ? "#F1F8E9" : "#81C784"} />
            ) : (
              <Ionicons 
                name="pencil-outline" 
                size={18} 
                color={currentConversation?._id === item._id ? "#F1F8E9" : "#81C784"} 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteConvBtn}
            onPress={() => deleteConversation(item._id)}
            disabled={isDeleting}
          >
            {isDeleting && currentConversation?._id === item._id ? (
              <ActivityIndicator size="small" color={currentConversation?._id === item._id ? "#F1F8E9" : "#ff4444"} />
            ) : (
              <Ionicons 
                name="trash-outline" 
                size={18} 
                color={currentConversation?._id === item._id ? "#F1F8E9" : "#ff4444"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F1F8E9', '#DCEDC8']}
      style={styles.gradientContainer}
    >
      <Image 
        source={require('../../assets/samplelogo.png')}
        style={styles.decorativePlant1}
        resizeMode="contain"
      />
      <Image 
        source={require('../../assets/samplelogo.png')}
        style={styles.decorativePlant2}
        resizeMode="contain"
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.convHeader}
            onPress={() => setShowConversations(true)}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.convHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={require('../../assets/samplelogo.png')}
                style={styles.headerLogo}
              />
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentConversation?.title || 'New Chat'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#F1F8E9" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={createNewConversation}
            disabled={isLoading}
            style={styles.headerButton}
          >
            <Ionicons 
              name="add" 
              size={24} 
              color={isLoading ? '#81C784' : '#2E7D32'} 
            />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            <>
              {isLoading && (
                <View style={[styles.messageContainer, styles.botContainer]}>
                  <View style={styles.avatarContainer}>
                    <Image 
                      source={require('../../assets/samplelogo.png')}
                      style={styles.avatar}
                    />
                  </View>
                  <LinearGradient
                    colors={['#F1F8E9', '#DCEDC8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.botBubble]}
                  >
                    <View style={styles.typingIndicator}>
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                    </View>
                  </LinearGradient>
                </View>
              )}
              
              {showRecommendations && messages.length === 1 && (
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>Try asking me:</Text>
                  <View style={styles.recommendationsGrid}>
                    {RECOMMENDED_QUESTIONS.map(renderRecommendedQuestion)}
                  </View>
                </View>
              )}
            </>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your plants..."
              placeholderTextColor="#81C784"
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <LinearGradient
                colors={input.trim() ? ['#4CAF50', '#2E7D32'] : ['#DCEDC8', '#DCEDC8']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#F1F8E9" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={input.trim() ? '#F1F8E9' : '#81C784'} 
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showConversations}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowConversations(false)}
        >
          <LinearGradient
            colors={['#F1F8E9', '#DCEDC8']}
            style={styles.gradientContainer}
          >
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Your Conversations</Text>
                <TouchableOpacity 
                  onPress={() => setShowConversations(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#2E7D32" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.convListContainer}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No conversations yet</Text>
                  </View>
                }
              />
              
              <TouchableOpacity 
                style={styles.newConvButton}
                onPress={() => {
                  createNewConversation();
                  setShowConversations(false);
                }}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.newConvGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add" size={20} color="#F1F8E9" />
                  <Text style={styles.newConvText}>New Conversation</Text>
                </LinearGradient>
              </TouchableOpacity>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        <Modal
          visible={showRenameModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowRenameModal(false)}
        >
          <View style={styles.renameModalOverlay}>
            <View style={styles.renameModalContainer}>
              <LinearGradient
                colors={['#F1F8E9', '#DCEDC8']}
                style={styles.renameModalGradient}
              >
                <Text style={styles.renameModalTitle}>Rename Conversation</Text>
                
                <TextInput
                  style={styles.renameInput}
                  value={renameText}
                  onChangeText={setRenameText}
                  placeholder="Enter new title..."
                  placeholderTextColor="#81C784"
                  autoFocus={true}
                  maxLength={100}
                />
                
                <View style={styles.renameModalButtons}>
                  <TouchableOpacity 
                    style={styles.renameCancelBtn}
                    onPress={() => setShowRenameModal(false)}
                    disabled={isRenaming}
                  >
                    <Text style={styles.renameCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.renameConfirmBtn}
                    onPress={confirmRename}
                    disabled={!renameText.trim() || isRenaming}
                  >
                    <LinearGradient
                      colors={renameText.trim() ? ['#4CAF50', '#2E7D32'] : ['#DCEDC8', '#DCEDC8']}
                      style={styles.renameConfirmGradient}
                    >
                      {isRenaming ? (
                        <ActivityIndicator size="small" color="#F1F8E9" />
                      ) : (
                        <Text style={[
                          styles.renameConfirmText,
                          !renameText.trim() && styles.renameConfirmTextDisabled
                        ]}>
                          Rename
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    position: 'relative',
  },
  decorativePlant1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 150,
    height: 150,
    opacity: 0.1,
  },
  decorativePlant2: {
    position: 'absolute',
    bottom: 100,
    left: -30,
    width: 120,
    height: 120,
    opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: 'transparent',
  },
  headerButton: {
    padding: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  convHeader: {
    flex: 1,
    marginHorizontal: 10,
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  convHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#F1F8E9',
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 18,
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  botBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#2E7D32',
  },
  userText: {
    color: '#F1F8E9',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  botTimestamp: {
    color: '#81C784',
  },
  userTimestamp: {
    color: 'rgba(241, 248, 233, 0.7)',
  },
  inputContainer: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#DCEDC8',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    color: '#2E7D32',
    fontSize: 16,
    paddingRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
    marginHorizontal: 2,
  },
  recommendationsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  recommendationsTitle: {
    fontSize: 16,
    color: '#689F38',
    marginBottom: 15,
    fontWeight: '600',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendedQuestion: {
    width: '48%',
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  recommendedQuestionText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2E7D32',
  },
  closeButton: {
    padding: 8,
  },
  convListContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  convItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedConv: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  convGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  convTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 3,
  },
  convDate: {
    fontSize: 12,
    color: '#81C784',
  },
  selectedConvText: {
    color: '#F1F8E9',
  },
  convActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renameConvBtn: {
    padding: 6,
    marginRight: 8,
  },
  deleteConvBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  newConvButton: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  newConvGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  newConvText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F8E9',
    marginLeft: 10,
  },
  renameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameModalContainer: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  renameModalGradient: {
    padding: 25,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  renameInput: {
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#DCEDC8',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 25,
  },
  renameModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  renameCancelBtn: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEDC8',
  },
  renameCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  renameConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  renameConfirmGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F8E9',
  },
  renameConfirmTextDisabled: {
    color: '#81C784',
  },
});

export default AIChatbot;



