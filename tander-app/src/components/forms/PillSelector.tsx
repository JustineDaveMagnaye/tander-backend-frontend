import { Pressable, StyleSheet, Text, View } from "react-native";

interface PillSelectorProps {
  items: string[];
  value: string[];
  onChange: (items: string[]) => void;
}

export default function PillSelector({
  items,
  value,
  onChange,
}: PillSelectorProps) {
  const toggleItem = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((i) => i !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => toggleItem(item)}
          style={[styles.pill, value.includes(item) && styles.active]}
        >
          <Text
            style={[styles.text, value.includes(item) && styles.activeText]}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#EEE",
    borderRadius: 20,
  },
  active: {
    backgroundColor: "#222",
  },
  text: {
    color: "#555",
  },
  activeText: {
    color: "#FFF",
  },
});
