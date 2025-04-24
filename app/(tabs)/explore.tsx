import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Globe, Navigation, Plane, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const CATEGORIES = [
  {
    label: 'Family Trips',
    key: 'Families',
    image: 'https://i.postimg.cc/HLhvfhBX/e00bc9c23a45683e7233208c3c9577b5.jpg',
    tagline: 'Comfort & joy for every generation',
    count: 12,
  },
  {
    label: 'Romantic Escapes',
    key: 'Couples',
    image: 'https://i.postimg.cc/nhZxKDv8/Screenshot-20250412-160418-You-Tube-remastered.jpg',
    tagline: 'Unwind with your favorite person',
    count: 7,
  },
  {
    label: 'Friends Getaways',
    key: 'Friends',
    image: 'https://i.postimg.cc/jdyKJXnQ/6535b076c925a93275d008b2e4735e10.jpg',
    tagline: 'Laugh, explore, repeat',
    count: 9,
  },
  {
    label: 'Solo Adventures',
    key: 'Single',
    image: 'https://i.postimg.cc/bdcCh1zq/d23e29b9870210533f08683e410f0bae.jpg',
    tagline: 'Find yourself where the road leads',
    count: 10,
  },
];

const colorMap = {
  Couples: ['#ffe6eb', '#fdf0f3', '#ffffff'],
  Families: ['#e6f9f5', '#d4f1ed', '#ffffff'],
  Friends: ['#e6f1ff', '#dbeeff', '#ffffff'],
  Single: ['#fffbe6', '#fff9cc', '#ffffff'],
  Default: ['#cce6ff', '#eaf4ff', '#ffffff'],
};

export default function ThemedTripsScreen() {
  const router = useRouter();
  const [effect, setEffect] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<keyof typeof colorMap>('Default');
  const screenWidth = Dimensions.get('window').width;

  const handlePress = (key: keyof typeof colorMap) => {
    const hapticMap = {
      Couples: Haptics.ImpactFeedbackStyle.Heavy,
      Families: Haptics.ImpactFeedbackStyle.Medium,
      Friends: Haptics.ImpactFeedbackStyle.Light,
      Single: Haptics.ImpactFeedbackStyle.Light,
    };

    const vibrationMap = {
      Couples: 300,
      Families: 200,
      Friends: 180,
      Single: 150,
    };

    Haptics.impactAsync(hapticMap[key]);
    Vibration.vibrate(vibrationMap[key]);
    setActiveTheme(key);
    setEffect(key);

    setTimeout(() => {
      setEffect(null);
      setActiveTheme('Default');
      router.push(`/themed-list/${key}`);
    }, 1600);
  };

  return (
    <LinearGradient colors={colorMap[activeTheme]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={colorMap[activeTheme][0]} translucent={false} />

        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
  <Text style={styles.headerTitle}>Themed Trips</Text>
  <Text style={styles.headerSubtitle}>Curated experiences for every travel vibe</Text>
</View>


          {/* Explore Themes Box */}
          <View style={styles.exploreCard}>
            <View style={styles.iconRow}>
              <Globe size={18} color="#007AFF" />
              <Plane size={18} color="#007AFF" />
              <Navigation size={18} color="#007AFF" />
            </View>
            <Text style={styles.exploreMainText}>Explore Trip Themes</Text>
            <Text style={styles.exploreDescription}>Find destinations that match your travel mood</Text>
            <TouchableOpacity style={styles.exploreButtonTop} onPress={() => router.push('/explore_place')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Search size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.exploreButtonText}>Browse More</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cards */}
          <View style={styles.cardList}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handlePress(cat.key as keyof typeof colorMap)}
              >
                <Image source={{ uri: cat.image }} style={styles.cardImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{cat.label}</Text>
                  <Text style={styles.cardTagline}>{cat.tagline}</Text>
                  <Text style={styles.cardCount}>{cat.count} curated trips</Text>
                </View>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>★ Featured</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Confetti Effects */}
      {effect === 'Couples' && (
        <ConfettiCannon count={100} origin={{ x: screenWidth / 2, y: 0 }} explosionRadius={300} fallSpeed={2500} explosionSpeed={350} fadeOut autoStart colors={['#FF3B30', '#FF2D55', '#ff5e7e']} />
      )}
      {effect === 'Families' && (
        <ConfettiCannon count={90} origin={{ x: screenWidth / 2, y: 0 }} explosionRadius={280} fallSpeed={2200} explosionSpeed={320} fadeOut autoStart colors={['#7ed6df', '#e056fd', '#f6e58d']} />
      )}
      {effect === 'Friends' && (
        <ConfettiCannon count={85} origin={{ x: screenWidth / 2, y: 0 }} explosionRadius={300} fallSpeed={2300} explosionSpeed={340} fadeOut autoStart colors={['#00a8ff', '#9c88ff', '#fbc531']} />
      )}
      {effect === 'Single' && (
        <ConfettiCannon count={70} origin={{ x: screenWidth / 2, y: 0 }} explosionRadius={260} fallSpeed={2000} explosionSpeed={310} fadeOut autoStart colors={['#f6e58d', '#f9ca24', '#f0932b']} />
      )}
    </LinearGradient>
  );
}

const CARD_WIDTH = Dimensions.get('window').width * 0.9;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#003366',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 8,
  },
  exploreCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    padding: 16, // ⬆️ slightly increased for better spacing
    backgroundColor: '#f1f9ff',
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  
  iconRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  exploreMainText: {
    fontSize: 22, // ⬆️ More visible
    fontFamily: 'Inter-Black', // ⬆️ Thickest weight
    color: '#003366',
    marginBottom: 6,
    paddingLeft: 2,
  },
  
  
  exploreDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#333',
    marginBottom: 10,
  },
  exploreButtonTop: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  cardList: {
    alignItems: 'center',
    gap: 28,
  },
  card: {
    width: CARD_WIDTH,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '55%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  cardTagline: {
    color: '#ddd',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  cardCount: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
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
  
});
