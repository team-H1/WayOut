import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Clock, Users, CheckCircle2, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Field = ({ icon, value, onChange, placeholder, keyboardType }: any) => (
  <View style={styles.inputWrapper}>
    {icon}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#999"
      keyboardType={keyboardType || 'default'}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="done"
    />
  </View>
);

export default function TripsScreen() {
  const { destination: routeDestination } = useLocalSearchParams();
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [travelers, setTravelers] = useState('');
  const [budget, setBudget] = useState('');
  const [fullPlan, setFullPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hasSetInitialDestination = useRef(false);

  useEffect(() => {
    if (!hasSetInitialDestination.current && typeof routeDestination === 'string') {
      setDestination(routeDestination);
      hasSetInitialDestination.current = true;
    }
  }, [routeDestination]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id;
      if (id) setUserId(id);
    };
    fetchSession();
  }, []);

  const animateCard = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const showBanner = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTripSaved(false);
        setAlreadySaved(false);
      });
    }, 2500);
  };

  const generatePlan = async () => {
    if (!destination || !duration || !budget) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    setFullPlan(null);
    setTripSaved(false);
    setAlreadySaved(false);
    Haptics.selectionAsync();

    const prompt = `
You're a professional travel planner.

Plan a ${duration}-day trip to ${destination} for ${travelers || '1'} person(s), with a budget of ₹${budget} per person.

Begin with a one-line summary that captures the essence of ${destination} and the trip style.

For each day, provide a concise itinerary including:
1. Main activity or theme  
2. Key attraction or must-visit spot  
3. Local food to try or recommended eatery  
4. Transport guidance (if needed)  
5. Estimated daily cost in ₹

Keep the writing formal, structured, and brief — like a premium itinerary guide. Avoid long paragraphs or unnecessary detail.

At the end, include:
1. Total Estimated Cost  
2. Top highlights of the overall trip

Only use emojis where they add clarity (like ₹ for currency), and avoid markdown or decorative formatting.
`;

    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer INaYqUl59t9PUsFfvimo41BwWqRtVuzH',
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;

      if (content) {
        const cleaned = content.replace(/\*\*/g, '').trim();
        setFullPlan(cleaned);
        animateCard();
      } else {
        Alert.alert('Error', 'No valid response from AI');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate trip plan.');
    } finally {
      setLoading(false);
    }
  };

  const saveTripPlan = async () => {
    if (!userId || !fullPlan) return;

    // Check for existing trip
    const { data: existing, error: fetchError } = await supabase
      .from('trips')
      .select('id')
      .eq('user_id', userId)
      .eq('destination', destination)
      .eq('plan', fullPlan)
      .maybeSingle();

    if (fetchError) {
      Alert.alert('Error', 'Failed to check saved trips.');
      return;
    }

    if (existing) {
      setAlreadySaved(true);
      showBanner();
      return;
    }

    const { error } = await supabase.from('trips').insert([
      {
        user_id: userId,
        destination,
        duration: parseInt(duration),
        travelers: parseInt(travelers || '1'),
        budget: parseInt(budget),
        plan: fullPlan,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTripSaved(true);
      showBanner();
    }
  };

  const bannerTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={styles.container}>
          <ScrollView
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.content, { flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Plan Your Trip</Text>
              <Text style={styles.headerSubtitle}>Generate your itinerary with AI</Text>
            </View>

            <View style={styles.form}>
              <Field icon={<MapPin size={18} color="#007AFF" />} value={destination} onChange={setDestination} placeholder="Destination" />
              <Field icon={<Calendar size={18} color="#007AFF" />} value={duration} onChange={setDuration} placeholder="How many days?" keyboardType="numeric" />
              <Field icon={<Users size={18} color="#007AFF" />} value={travelers} onChange={setTravelers} placeholder="Travelers" keyboardType="numeric" />
              <Field icon={<Clock size={18} color="#007AFF" />} value={budget} onChange={setBudget} placeholder="Budget per person" keyboardType="numeric" />

              <TouchableOpacity style={styles.button} onPress={generatePlan} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Itinerary</Text>}
              </TouchableOpacity>
            </View>

            {fullPlan && (
              <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                <Text style={styles.cardTitle}>Trip Plan for {destination}</Text>
                <Text style={styles.cardContent}>{fullPlan}</Text>
              </Animated.View>
            )}
          </ScrollView>

          {fullPlan && (
            <TouchableOpacity style={styles.fab} onPress={saveTripPlan}>
              <Sparkles size={22} color="#fff" />
            </TouchableOpacity>
          )}

          <Animated.View
            style={[
              styles.successBanner,
              {
                transform: [{ translateY: bannerTranslateY }],
                opacity: slideAnim,
                backgroundColor: alreadySaved ? '#fff4e6' : '#e7fff0',
              },
            ]}
          >
            <TouchableOpacity onPress={() => slideAnim.setValue(0)}>
              <View style={styles.successRow}>
                <CheckCircle2 size={18} color={alreadySaved ? '#FFA500' : '#34C759'} />
                <Text style={[styles.successText, { color: alreadySaved ? '#cc6600' : '#1a9632' }]}>
                  {alreadySaved ? 'Trip Already Saved' : 'Trip Plan Saved'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 28,
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56, // ✅ Fixed consistent height
    width: width - 48, // ✅ Makes sure input width is consistent across phones
    borderWidth: 1,
    borderColor: '#d4e4ff',
    shadowColor: '#007AFF',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    alignSelf: 'center', // ✅ Centered horizontally
  },
  
  
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    minWidth: 0,
    paddingLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  
  
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginTop: 36,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#003366',
  },
  cardContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
  },
  successBanner: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#e7fff0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  successRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#1a9632',
    fontWeight: '500',
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
  header: {
    marginBottom: 24,
    alignItems: 'flex-start', // or 'center' if you prefer centered titles
  },
  
});
