const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para funcionar offline
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
