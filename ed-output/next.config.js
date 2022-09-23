// next.config.js
module.exports = {
  productionBrowserSourceMaps: true,
  publicRuntimeConfig: {
    version: '1.0.0',
    envMode: process.env.ENV_MODE,
    forceAPITargetURL: process.env.FORCE_API_TARGET_URL,
  },
};
