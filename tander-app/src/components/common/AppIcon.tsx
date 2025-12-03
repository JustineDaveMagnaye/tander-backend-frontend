import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet } from "react-native";

interface Props {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export default function AppIcon({
  name,
  size = 24,
  color = "#000",
  style,
}: Props) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

const styles = StyleSheet.create({});
