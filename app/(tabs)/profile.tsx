import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Star,
  Info,
  LogOut,
  DollarSign,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_MENU = [
  { icon: MapPin, label: 'Saved Places', color: '#FF9500', route: '/saved-places' },
  { icon: DollarSign, label: 'Currency Exchange', color: '#34C759', route: '/currency' },
  { icon: Star, label: 'Reviews', color: '#FFC107', route: '/reviews' },
  { icon: Info, label: 'About', color: '#5856D6', route: '/about' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      Alert.alert('Error', 'No active session found.');
      setLoading(false);
      return;
    }
    const userId = sessionData.session.user.id;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile({ ...profileData, email: sessionData.session.user.email });
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Logout Failed', error.message);
    else router.replace('/login');
  };

  const defaultAvatar = 'https://i.postimg.cc/6qBn8xbm/782ff6a0927c78f81b893a1a37e27ad9.jpg';

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.greeting}>My Profile</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: profile?.avatar_url || defaultAvatar }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'Traveller'}</Text>
            <Text style={styles.email}>{profile?.email || 'Email not available'}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/EditProfileScreen')}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.menuContainer}>
          {QUICK_MENU.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.quickMenuItem}
                onPress={() => item.route && router.push(item.route)}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: item.color }]}>
                  <Icon size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={22} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    letterSpacing: -0.6,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 20,
  },
  profileImageWrapper: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 50,
    padding: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_600SemiBold', // reduced from ExtraBold
    fontSize: 24,
    color: '#000',
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  editButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  quickMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
