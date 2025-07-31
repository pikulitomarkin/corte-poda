const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Adicione aqui quaisquer módulos que precisem ser transpilados
        ],
      },
    },
    argv
  );
  
  // Customize o config aqui se necessário
  
  return config;
};
