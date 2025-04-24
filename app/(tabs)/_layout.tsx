import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { Home, Search, Map, MessageSquare, User } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Inter-Regular': require('../../assets/fonts/Inter-Regular.otf'),
          'Inter-Bold': require('../../assets/fonts/Inter-Bold.otf'),
          'Inter-Black': require('../../assets/fonts/Inter-Black.otf'),
          'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.otf'),
          'Inter-ExtraBold': require('../../assets/fonts/Inter-ExtraBold.otf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 75 + (insets.bottom ?? 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 4,
            backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.88)' : 'transparent',
            borderTopWidth: 0.75,
            borderColor: 'rgba(200, 200, 200, 0.25)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 10,
          },
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <AnimatedBlurView
                intensity={70}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
            ),
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Home size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Search size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: 'Trips',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Map size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <MessageSquare size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <User size={size} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  androidBackground: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderTopWidth: 0.75,
    borderColor: 'rgba(200, 200, 200, 0.25)',
  },
});
