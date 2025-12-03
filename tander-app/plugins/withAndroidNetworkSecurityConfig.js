const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add Android Network Security Configuration
 * This allows the app to connect to Cloudflare Tunnel and other development servers
 */
const withAndroidNetworkSecurityConfig = (config) => {
  // Step 1: Add network security config reference to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    // Add network security config reference
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    return config;
  });

  // Step 2: Copy network_security_config.xml to the correct Android resource directory
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;

      const sourceXmlPath = path.join(projectRoot, 'android-res', 'xml', 'network_security_config.xml');
      const targetXmlDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      const targetXmlPath = path.join(targetXmlDir, 'network_security_config.xml');

      // Create xml directory if it doesn't exist
      if (!fs.existsSync(targetXmlDir)) {
        fs.mkdirSync(targetXmlDir, { recursive: true });
      }

      // Copy the network security config file
      if (fs.existsSync(sourceXmlPath)) {
        fs.copyFileSync(sourceXmlPath, targetXmlPath);
        console.log('✅ Network security config copied to Android resources');
      } else {
        console.warn('⚠️  network_security_config.xml not found at:', sourceXmlPath);
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withAndroidNetworkSecurityConfig;
