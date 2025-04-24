import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, Users, Wallet, Bookmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const UNSPLASH_ACCESS_KEY = 'bWGvtuZVVZwuMCkcsFtDsa2Amfpy2w-uVzCJ0Hbit2U';

export default function TripDetailScreen() {
  const { trip } = useLocalSearchParams();
  const tripData = trip ? JSON.parse(trip as string) : null;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    if (tripData?.destination) fetchImage(tripData.destination);
  }, [tripData]);

  const fetchImage = async (query: string) => {
    try {
      const page = Math.floor(Math.random() * 3) + 1;
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const json = await res.json();
      const random = Math.floor(Math.random() * json.results.length);
      const url = json?.results?.[random]?.urls?.regular;
      if (url) setImageUrl(url);
    } catch (err) {
      console.error('Unsplash Error:', err);
    } finally {
      setLoadingImage(false);
    }
  };

  if (!tripData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Trip not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <Text style={styles.title}>{tripData.destination}</Text>
          <Text style={styles.subtitle}>A glimpse of your planned journey</Text>

          <View style={styles.imageWrapper}>
            <View style={styles.imageBorder}>
              {loadingImage ? (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : (
                <Image
                  source={{
                    uri: imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                  }}
                  style={styles.headerImage}
                />
              )}
            </View>
            <TouchableOpacity style={styles.bookmarkIcon}>
              <Bookmark size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Calendar size={18} color="#007AFF" />
              <Text style={styles.detailText}>{tripData.duration} days</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={18} color="#007AFF" />
              <Text style={styles.detailText}>{tripData.travelers} travelers</Text>
            </View>
            <View style={styles.detailItem}>
              <Wallet size={18} color="#007AFF" />
              <Text style={styles.detailText}>₹{tripData.budget}</Text>
            </View>
          </View>

          {tripData.plan && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trip Plan</Text>
              <Text style={styles.cardText}>{tripData.plan}</Text>
            </View>
          )}

          {tripData.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.cardText}>{tripData.notes}</Text>
            </View>
          )}
        </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  imageBorder: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#d0e8ff',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#dceaff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 12,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#003366',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#444',
    lineHeight: 20,
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
