import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

const COHERE_API_KEY = 'gcGcmZtiannbHLfwynazalZChI8XZCBurgJzBKVe';

const TypingDots = () => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[typingStyles.pulseBubble, { transform: [{ scale: pulse }] }]}>
      <View style={typingStyles.dotsWrapper}>
        <View style={typingStyles.dot} />
        <View style={typingStyles.dot} />
        <View style={typingStyles.dot} />
      </View>
    </Animated.View>
  );
};

export default function ChatScreen() {
  const { place, prompt } = useLocalSearchParams();

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm Wanderly, your AI travel companion 🌍. Ask me anything!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const animatedValues = useRef({}).current;

  useEffect(() => {
    messages.forEach((msg) => {
      if (!animatedValues[msg.id]) {
        const fade = new Animated.Value(0);
        const slide = new Animated.Value(20);
        animatedValues[msg.id] = { fade, slide };
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slide, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [messages]);

  useEffect(() => {
    if (prompt) {
      setInputText(String(prompt));

      const timer = setTimeout(() => {
        sendMessage();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [prompt]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollViewRef.current?.scrollToEnd({ animated: true });

    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: userMessage.text,
          chat_history: messages.map((msg) => ({
            role: msg.sender === 'user' ? 'USER' : 'CHATBOT',
            message: msg.text,
          })),
          preamble:
            "You are Wanderly, a helpful AI travel assistant. Only answer questions related to travel, such as hotels, destinations, flights, and trip planning. Keep responses short and helpful. If asked about anything else, respond with: “I'm here to help only with travel-related questions 😊.”",
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const reply = data.text || 'Hmm, I couldn’t come up with a response. Try again?';

      const aiMessage = {
        id: Date.now().toString() + '_ai',
        text: reply,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      Alert.alert('Network Error', 'Failed to connect to Wanderly.');
    } finally {
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wanderly</Text>
          <Text style={styles.headerSubtitle}>Your AI Travel Assistant</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContent}
            style={styles.messagesContainer}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => {
              const { fade, slide } = animatedValues[msg.id] || {};
              return (
                <Animated.View
                  key={msg.id}
                  style={[
                    {
                      opacity: fade || 1,
                      transform: [{ translateY: slide || 0 }],
                    },
                    styles.messageGroup,
                    msg.sender === 'user' ? styles.userGroup : styles.aiGroup,
                  ]}
                >
                  <Text style={styles.senderLabel}>{msg.sender === 'user' ? 'You' : 'Wanderly'}</Text>
                  <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                    <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
                      {msg.text}
                    </Text>
                    <Text style={styles.timestamp}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}

            {isTyping && <TypingDots />}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about travel..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Send size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginTop: 4,
  },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 100 },
  messageGroup: { marginBottom: 16 },
  userGroup: { alignItems: 'flex-end' },
  aiGroup: { alignItems: 'flex-start' },
  senderLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: { fontSize: 16, lineHeight: 24 },
  userText: { color: '#fff', fontFamily: 'Inter-Regular' },
  aiText: { color: '#000', fontFamily: 'Inter-Regular' },
  timestamp: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 120,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const typingStyles = StyleSheet.create({
  pulseBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    marginLeft: 16,
  },
  dotsWrapper: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
});
