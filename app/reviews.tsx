import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ReviewsScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [travelType, setTravelType] = useState('Solo');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [visitDate, setVisitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        Alert.alert('Access Denied', 'You must be logged in to write a review.', [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]);
        return;
      }

      setUser(sessionUser);
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', sessionUser.id)
        .single();
      setName(profile?.name || '');
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!message || !title || rating === 0) {
      Alert.alert('Missing Info', 'Please complete all required fields.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      {
        user_id: user.id,
        name,
        title,
        message,
        rating,
        travel_type: travelType,
        would_recommend: wouldRecommend,
        visit_date: visitDate.toISOString().split('T')[0],
      },
    ]);

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Could not submit your review.');
    } else {
      Alert.alert('Thank you!', 'Your review has been submitted.');
      setTitle('');
      setMessage('');
      setRating(0);
      setTravelType('Solo');
      setWouldRecommend(true);
      setVisitDate(new Date());
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Leave a Review</Text>
            <Text style={styles.headerSubtitle}>We’d love to hear your travel experience</Text>
          </View>

          <Text style={styles.label}>Review Title</Text>
          <TextInput
            placeholder="e.g. Amazing trip to Bali"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Rating</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Star
                  size={30}
                  color={i <= rating ? '#FFD700' : '#ccc'}
                  fill={i <= rating ? '#FFD700' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Travel Type</Text>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={travelType}
              onValueChange={(itemValue) => setTravelType(itemValue)}
              mode="dropdown"
              style={styles.picker}
              dropdownIconColor="#007AFF"
            >
              <Picker.Item label="Solo" value="Solo" />
              <Picker.Item label="Couple" value="Couple" />
              <Picker.Item label="Family" value="Family" />
              <Picker.Item label="Friends" value="Friends" />
              <Picker.Item label="Business" value="Business" />
            </Picker>
          </View>

          <Text style={styles.label}>Would you recommend it?</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{wouldRecommend ? 'Yes' : 'No'}</Text>
            <Switch
              value={wouldRecommend}
              onValueChange={setWouldRecommend}
              thumbColor={wouldRecommend ? '#007AFF' : '#ccc'}
            />
          </View>

          <Text style={styles.label}>Visit Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              {visitDate.toDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setVisitDate(date);
              }}
            />
          )}

          <Text style={styles.label}>Your Review</Text>
          <TextInput
            placeholder="Share your experience..."
            style={styles.textArea}
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 0,
    paddingBottom: 12,
    marginBottom: 20,
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
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 6,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
});
