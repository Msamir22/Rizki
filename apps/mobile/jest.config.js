/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@nozbe/watermelondb|@astik/.*|zod)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@astik/db$": "<rootDir>/../../packages/db/src",
    "^@astik/logic$": "<rootDir>/../../packages/logic/src",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
};
