// metro.config.js - Otimizado para Hermes
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações para Hermes
config.transformer.hermesCommand = 'hermes';
config.transformer.minifierPath = 'metro-minify-terser';

// Otimizações para resolver problemas comuns
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.assetExts = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'webp'];

// Desabilitar package exports que podem causar problemas
config.resolver.unstable_enablePackageExports = false;

// Configurações de performance
config.maxWorkers = 2;

module.exports = config;
