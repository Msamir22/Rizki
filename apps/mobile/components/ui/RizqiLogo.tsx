import React from "react";
import RizqiDarkLogoSvg from "../../assets/rizqi-dark-logo.svg";
import RizqiLightLogoSvg from "../../assets/rizqi-light-logo.svg";
import { useTheme } from "../../context/ThemeContext";

interface RizqiLogoProps {
  width: number;
  height: number;
  color?: string;
}

/**
 * Rizqi Logo Component
 *
 * Renders the Rizqi logo using imported SVG files.
 * Switches between white-text (dark mode) and dark-text (light mode) versions.
 *
 * Usage:
 * <RizqiLogo width={120} height={40} />
 */
export function RizqiLogo({
  width,
  height,
  color,
}: RizqiLogoProps): React.ReactElement {
  const { isDark } = useTheme();

  if (isDark) {
    return <RizqiDarkLogoSvg width={width} height={height} color={color} />;
  }

  return <RizqiLightLogoSvg width={width} height={height} color={color} />;
}
