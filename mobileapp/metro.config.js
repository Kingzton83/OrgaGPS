// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Anpassungen an der Resolver-Konfiguration
config.resolver.assetExts.push('cjs');

config.resolver.extraNodeModules = {
  'react-native-maps': require.resolve('react-native-maps'),
};

module.exports = config;
