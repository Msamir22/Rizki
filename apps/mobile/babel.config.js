module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@rizqi/mobile": "./",
            "@rizqi/logic": "../../packages/logic/src",
            "@rizqi/db": "../../packages/db/src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
