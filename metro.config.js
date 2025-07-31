// metro.config.js 
const { getDefaultConfig } = require('@expo/metro-config'); 

const config = getDefaultConfig(__dirname);

// Resolve colisões de Haste
config.resolver.hasteImplModulePath = null;

// Configurações padrão
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.assetExts = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'webp'];
config.transformer.babelTransformerPath = require.resolve('metro-babel-transformer');
config.maxWorkers = 2;

// Ignorar pastas específicas
config.watchFolders = [__dirname];
config.resolver.blockList = [/node_modules[\\\\_]bak/, /node_modules_old/];

module.exports = config;
