declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

// Add React Native Reanimated types
declare module "react-native-reanimated" {
  export * from "react-native-reanimated/lib/types";
}

// Allow importing .css files
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
