import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  CalendarDays,
  PlaneTakeoff,
  Compass,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useRef, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StatusBar } from 'expo-status-bar';


const FEATURED = [
  {
    id: '1',
    title: 'Paris, France',
    tagline: 'City of Light',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  },
  {
    id: '2',
    title: 'Queenstown, New Zealand',
    tagline: 'Fields of Bloom',
    image: 'https://plus.unsplash.com/premium_photo-1710787193520-74df05ed7736?q=80',
  },
  {
    id: '3',
    title: 'Bali, Indonesia',
    tagline: 'Island of Gods',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  },
  {
    id: '4',
    title: 'Santorini, Greece',
    tagline: 'Mediterranean Dream',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
  },
  {
    id: '5',
    title: 'Kyoto, Japan',
    tagline: 'Timeless Culture',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
  },
];

const RECOMMENDED = [
  {
    id: '1',
    name: 'Hidden Beach',
    location: 'Maldives',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd',
  },
  {
    id: '2',
    name: 'Alpine Lodge',
    location: 'Switzerland',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [userName, setUserName] = useState('Traveller');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const getUser = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (error || !user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.name || 'Traveller');
        setAvatarUrl(profile.avatar_url || null);
      }
    };

    getUser();
  }, []);

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>WayOut</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.profileBorder}>
              <Image
                source={{
                  uri:
                    avatarUrl ||
                    'https://i.postimg.cc/6qBn8xbm/782ff6a0927c78f81b893a1a37e27ad9.jpg',
                }}
                style={styles.profile}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{userName}</Text>
          </View>

          <BlurView intensity={90} tint="light" style={styles.aiCardContainer}>
            <LinearGradient colors={['#ffffff80', '#e6f2ff']} style={styles.aiCardGradient}>
              <View style={styles.aiFeaturesRow}>
                <CalendarDays size={18} color="#007AFF" />
                <PlaneTakeoff size={18} color="#007AFF" />
                <Compass size={18} color="#007AFF" />
              </View>
              <Text style={styles.aiTitle}>Let AI Plan Your Escape</Text>
              <Text style={styles.aiSubtitle}>Smart. Fast. Beautiful.</Text>
              <Pressable style={styles.glassButton} onPress={() => router.push('/trips')}>
                <Sparkles size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.glassButtonText}>Plan with AI</Text>
              </Pressable>
            </LinearGradient>
          </BlurView>

          <Text style={styles.sectionTitle}>Featured Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {FEATURED.map((dest) => (
              <Animated.View key={dest.id} style={[styles.card, { opacity: fadeAnim }]}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/chat',
                      params: {
                        place: dest.title,
                        prompt: `Plan a trip to ${dest.title}. Give me an exciting day-by-day itinerary.`,
                      },
                    })
                  }
                >
                  <Image source={{ uri: dest.image }} style={styles.cardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={styles.cardOverlay}
                  >
                    <Text style={styles.cardTitle}>{dest.title}</Text>
                    <Text style={styles.cardTagline}>{dest.tagline}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Recommended Spots</Text>
          {RECOMMENDED.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              onPress={() =>
                router.push({
                  pathname: '/explore_place',
                  params: {
                    place: spot.name,
                    location: spot.location,
                  },
                })
              }
            >
              <BlurView intensity={60} tint="light" style={styles.recommendCard}>
                <Image source={{ uri: spot.image }} style={styles.recommendImage} />
                <View style={styles.recommendInfo}>
                  <Text style={styles.recommendName}>{spot.name}</Text>
                  <Text style={styles.recommendLocation}>{spot.location}</Text>
                  <Text style={styles.recommendRating}>★ {spot.rating}</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    letterSpacing: -0.6,
  },
  profileBorder: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 2,
    borderRadius: 24,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#444',
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111',
  },
  aiCardContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 28,
    overflow: 'hidden',
    borderColor: '#d0e8ff',
    borderWidth: 1,
    shadowColor: '#007AFF',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  aiCardGradient: {
    padding: 20,
    borderRadius: 28,
  },
  aiFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: 100,
  },
  aiTitle: {
    fontSize: 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#003366',
  },
  aiSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#555',
    marginBottom: 12,
    marginTop: 2,
  },
  glassButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,122,255,0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  glassButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  horizontalScroll: { paddingLeft: 24, marginBottom: 28 },
  card: {
    width: 260,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f3f8fc',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  cardTagline: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  recommendCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: '#e2eefc',
  },
  recommendImage: {
    width: '100%',
    height: 180,
  },
  recommendInfo: {
    padding: 16,
  },
  recommendName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111',
  },
  recommendLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#555',
  },
  recommendRating: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
});
