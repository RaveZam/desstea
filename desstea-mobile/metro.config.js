const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native-ping": require.resolve("./stubs/react-native-ping.js"),
};

module.exports = config;
