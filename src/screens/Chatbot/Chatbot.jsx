import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useRef } from 'react'
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import Headers from '../../components/header/Headers'
import { useTheme } from '@react-navigation/native';
import getBotResponses from '../../services/api/api';

const getBotResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  if (message.includes('hi')) {
    return 'Hey There ! How i can assist you today.';
  }
  if (message.includes('help')) {
    return 'Sure! I can help you with that. Please provide more details.';
  } else if (message.includes('update drone info')) {
    return 'I will guide you step by step to update drone information.';
  } else if (message.includes('thank you')) {
    return 'You\'re welcome! Have a great day.';
  } else {
    return 'Thank you, we will reach you shortly!';
  }
}

const Chatbot = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', type: 'bot', text: 'Hello! How can I assist you today?', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for emoji picker visibility
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (inputMessage.trim() !== '') {
      const userMessage = { id: Date.now().toString(), type: 'user', text: inputMessage, timestamp: new Date().toLocaleTimeString() };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputMessage('');
      setShowEmojiPicker(false); // Hide emoji picker after sending a message
      
      // Simulate bot typing
      setIsTyping(true);
      flatListRef.current?.scrollToEnd({ animated: true });
  
      try {
        const botResponse = await getBotResponses(userMessage.text);
        const botMessage = {
          id: Date.now().toString(),
          type: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: Date.now().toString(),
          type: 'bot',
          text: "Sorry, I'm having trouble responding at the moment.",
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
  
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  

  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.type === 'user' ? { backgroundColor: colors.userMessage } : { backgroundColor: colors.botMessage },
      item.type === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.type === 'bot' ? { color: 'white' } : { color: 'black' }
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        item.type === 'bot' ? { color: 'white' } : { color: 'black' }
      ]}>
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
    >
      <View style={styles.container}>
        <Headers title="ChatBot Support" />
        <Text style={styles.text}>Chatbot is here to assist you !!</Text>
        <View style={{ height: "60%", }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatContainer}
          />
        </View>
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Bot is typing...</Text>
          </View>
        )}

        {/* Emoji Picker Section */}
        {showEmojiPicker && (
          <View style={styles.emojiPickerContainer}>
            <EmojiSelector
              onEmojiSelected={emoji => setInputMessage(inputMessage + emoji)}
              showSearchBar={false}
              category={Categories.SMILEYS}
              columns={8}
            />
          </View>
        )}

        {/* Message Input */}
        <View style={[styles.message, { backgroundColor: colors.messageInput }]}>
          <TextInput
            placeholder="Message..."
            placeholderTextColor={colors.text}
            multiline
            value={inputMessage}
            onChangeText={text => setInputMessage(text)}
            style={[styles.messageInput, { color: colors.text }]}
          />
          <TouchableOpacity style={styles.emojiContainer} onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Image style={[styles.emoji, { tintColor: colors.text }]} source={require('../../assets/icons/emoji.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.emojiContainer2} onPress={sendMessage}>
            <Image style={[styles.send, { tintColor: "black" }]} source={require('../../assets/icons/send.png')} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%'
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: 'grey',
    fontWeight: '500',
  },
  message: {
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '90%',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginBottom: 40
  },
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emojiContainer2: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9F6EE',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginLeft: '-10',
  },
  emoji: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  send: {
    width: 27,
    height: 24,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginLeft: 2
  },
  chatContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
  },
  typingIndicator: {
    marginHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#888',
  },
 
  emojiPickerContainer: {
    backgroundColor: '#f0f0f0',
    height: 280,  
    width: '100%',
    position: 'absolute', 
    padding : 10,
    bottom: 230, 
    paddingBottom: 10,
    borderRadius : 10,
    overflow: 'hidden',
  }
});

export default Chatbot;
