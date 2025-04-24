// plugins/withManifestFix.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const app = config.modResults.manifest.application?.[0];

    if (app) {
      app['$'] = {
        ...app['$'],
        'android:appComponentFactory': 'androidx.core.app.CoreComponentFactory',
        'tools:replace': 'android:appComponentFactory',
      };
    }

    config.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    return config;
  });
};
