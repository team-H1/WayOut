import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function StartupScreen() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFontsAndSession = async () => {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
          'Inter-Black': require('../assets/fonts/Inter-Black.otf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
          'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.otf'),
        });

        setFontsLoaded(true);

        // Check Supabase session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.warn('Error loading fonts or checking session:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    loadFontsAndSession();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cce6ff', // Matches your app's gradient start
  },
});
