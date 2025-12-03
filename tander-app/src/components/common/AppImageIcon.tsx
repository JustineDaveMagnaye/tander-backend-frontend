import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";

type Props = {
  source: ImageSourcePropType; // PNG or SVG (if using react-native-svg)
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function AppImageIcon({ source, size = 28, style }: Props) {
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
}
