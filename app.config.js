import withManifestFix from './plugins/withManifestFix';

export default {
  name: 'WayOut',
  slug: 'wayout',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon3.png',
  scheme: 'wayout',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  android: {
    package: 'com.jaya_heree.wayout',
    versionCode: 1
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.jayaHeree.wayout'
  },

  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/icon3.png'
  },

  splash: {
    image: './assets/images/icon3.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },

  plugins: [
    'expo-router',
    'expo-font',
    withManifestFix
  ],

  experiments: {
    typedRoutes: true
  },

  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: 'dcaa6fab-b566-44eb-b2f3-0b6b04788f9a' // ✅ Added manually
    }
  },

  owner: 'im_jayaa' // optional, for team/org builds
};
