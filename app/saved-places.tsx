import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const UNSPLASH_ACCESS_KEY = 'bWGvtuZVVZwuMCkcsFtDsa2Amfpy2w-uVzCJ0Hbit2U';

export default function SavedPlacesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<{ [key: string]: string }>({});

  const fetchTrips = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      Alert.alert('Error', 'You are not logged in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTrips(data || []);
      data.forEach((trip) => fetchImageForDestination(trip.destination));
    }

    setLoading(false);
  };

  const fetchImageForDestination = async (destination: string) => {
    if (imageMap[destination]) return;

    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          destination
        )}&per_page=5&page=${page}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const json = await response.json();
      const images = json.results;
      const randomIndex = Math.floor(Math.random() * images.length);
      const url = images?.[randomIndex]?.urls?.regular;

      if (url) {
        setImageMap((prev) => ({ ...prev, [destination]: url }));
      }
    } catch (error) {
      console.error('Unsplash fetch error:', error);
    }
  };

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) {
      Alert.alert('Delete Failed', error.message);
    } else {
      setTrips(trips.filter((trip) => trip.id !== id));
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <Text style={styles.title}>Saved Places</Text>
        <Text style={styles.subtitle}>Revisit your favorite adventures</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#007AFF" />
        ) : trips.length === 0 ? (
          <Text style={styles.noTrips}>You don’t have any saved trips yet.</Text>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {trips.map((trip) => {
              const image =
                imageMap[trip.destination] ||
                'https://images.unsplash.com/photo-1739993655680-4b7050ed2896?w=600';

              return (
                <View key={trip.id} style={styles.tripCard}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: '/trip-detail',
                        params: { trip: JSON.stringify(trip) },
                      })
                    }
                  >
                    <Image source={{ uri: image }} style={styles.tripImage} />

                    <View style={styles.overlay}>
                      <Text style={styles.destinationText}>{trip.destination}</Text>
                      <Text style={styles.metaText}>
                        {trip.duration} days • {trip.travelers} traveler(s) • ₹{trip.budget}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteTrip(trip.id)} style={styles.trashButton}>
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontFamily: 'Inter-Black',
    fontSize: 30,
    color: '#0051A8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 20,
  },
  noTrips: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 60,
  },
  tripCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: 'relative',
  },
  tripImage: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  destinationText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#eee',
    marginTop: 4,
  },
  trashButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
});
