import React from "react";
import AstikDarkLogoSvg from "../../assets/astik-dark-logo.svg";
import AstikLightLogoSvg from "../../assets/astik-light-logo.svg";
import { useTheme } from "../../context/ThemeContext";

interface AstikLogoProps {
  width: number;
  height: number;
  color?: string;
}

/**
 * Astik Logo Component
 *
 * Renders the Astik logo using imported SVG files.
 * Switches between white-text (dark mode) and dark-text (light mode) versions.
 *
 * Usage:
 * <AstikLogo width={120} height={40} />
 */
export function AstikLogo({
  width,
  height,
  color,
}: AstikLogoProps): React.ReactElement {
  const { isDark } = useTheme();

  if (isDark) {
    return <AstikDarkLogoSvg width={width} height={height} color={color} />;
  }

  return <AstikLightLogoSvg width={width} height={height} color={color} />;
}
