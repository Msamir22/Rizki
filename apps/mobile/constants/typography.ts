import { TextStyle } from "react-native";

/**
 * Inter Font Family Configuration (using @expo-google-fonts/inter)
 *
 * Usage:
 * - fontFamily.regular: Body text, descriptions
 * - fontFamily.medium: Emphasized text, buttons, amounts
 * - fontFamily.semiBold: Subheadings, labels
 * - fontFamily.bold: Headings, important values, user names
 */
export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

/**
 * Font Weights mapped to Inter font family names
 * Use these when you need to specify fontFamily based on weight
 */
export const fontWeightToFamily: Record<string, string> = {
  "400": fontFamily.regular,
  "500": fontFamily.medium,
  "600": fontFamily.semiBold,
  "700": fontFamily.bold,
  normal: fontFamily.regular,
  bold: fontFamily.bold,
};

/**
 * Predefined Text Styles
 * Use these for consistent typography across the app
 */
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 26,
  } as TextStyle,

  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  // Labels
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  // Captions
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  captionSmall: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
  } as TextStyle,

  // Special styles
  amount: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  } as TextStyle,

  amountLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
  } as TextStyle,

  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  // Brand
  logo: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
  } as TextStyle,
} as const;
