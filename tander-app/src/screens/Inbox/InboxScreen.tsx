import colors from "@/src/config/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const suggestions = [
  {
    name: "Ramon",
    age: 70,
    avatar:
      "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Gloria",
    age: 69,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Faye",
    age: 65,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Mike",
    age: 68,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
];

const conversations = [
  {
    name: "Richard Cruz",
    message: "Hello, Felix, kamusta po?",
    status: "active",
    favorite: false,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Jericho Ramos",
    message: "Hello, Felix, kamusta po?",
    status: "active",
    favorite: true,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Lydia Gomez",
    message: "Hello, Felix, kamusta po?",
    status: "active",
    favorite: false,
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Gloria Ramos",
    message: "Hello, Felix, kamusta po?",
    status: "away",
    favorite: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
];

export default function InboxScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.headerButton}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Inbox</Text>

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.headerButton, styles.headerButtonRight]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("HomeScreen" as never)}
          >
            <Ionicons name="home" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={colors.gradients.softAqua.array}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.suggestionsCard}
        >
          <View style={styles.suggestionsHeader}>
            <Text style={styles.sectionTitle}>People You May Know!</Text>
            <Ionicons name="heart" size={18} color={colors.primary} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionRow}
          >
            {suggestions.map((person) => (
              <View key={person.name} style={styles.suggestionItem}>
                <View>
                  <Image source={{ uri: person.avatar }} style={styles.suggestionAvatar} />
                  <View style={styles.heartBadge}>
                    <MaterialCommunityIcons
                      name="heart"
                      size={12}
                      color={colors.white}
                    />
                  </View>
                </View>
                <Text style={styles.suggestionName}>{person.name}</Text>
                <Text style={styles.suggestionAge}>{person.age}</Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>

        <View style={styles.messageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <Ionicons name="mail-open" size={18} color={colors.textSecondary} />
          </View>

          {conversations.map((chat) => (
            <View key={chat.name} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.messageAvatarWrapper}>
                  <Image source={{ uri: chat.avatar }} style={styles.messageAvatar} />
                  <View
                    style={[styles.statusDot, chat.status === "active" ? styles.statusActive : styles.statusIdle]}
                  />
                </View>
                <View style={styles.messageMeta}>
                  <Text style={styles.messageName}>{chat.name}</Text>
                  <Text style={styles.messagePreview}>{chat.message}</Text>
                </View>
                <TouchableOpacity style={styles.callButton} activeOpacity={0.9}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={18}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.messageFooter}>
                <View style={styles.voiceBadge}>
                  <Ionicons name="mic" size={12} color={colors.textSecondary} />
                  <Text style={styles.voiceText}>Voice Message</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8}>
                  <Ionicons
                    name={chat.favorite ? "heart" : "heart-outline"}
                    size={18}
                    color={chat.favorite ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.quickIcon} activeOpacity={0.85}>
          <Ionicons name="image" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickIcon} activeOpacity={0.85}>
          <Ionicons name="mic" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
        />
        <TouchableOpacity style={styles.sendButton} activeOpacity={0.9}>
          <Ionicons name="heart" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <Ionicons name="home" size={20} color={colors.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.85}>
          <Ionicons name="chatbox-ellipses" size={20} color={colors.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <Ionicons name="people" size={20} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <Ionicons name="person" size={20} color={colors.textSecondary} />
          <Text style={styles.navLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 26,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    height: 38,
    width: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerButtonRight: {
    alignSelf: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  suggestionsCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  suggestionRow: {
    gap: 16,
    paddingRight: 4,
  },
  suggestionItem: {
    alignItems: "center",
    gap: 4,
  },
  suggestionAvatar: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: colors.borderMedium,
  },
  heartBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    height: 18,
    width: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.white,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  suggestionAge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageAvatarWrapper: {
    position: "relative",
  },
  messageAvatar: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: colors.borderMedium,
  },
  statusDot: {
    position: "absolute",
    height: 12,
    width: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.white,
    bottom: 2,
    right: 2,
  },
  statusActive: {
    backgroundColor: colors.accentTeal,
  },
  statusIdle: {
    backgroundColor: colors.textMuted,
  },
  messageMeta: {
    flex: 1,
    gap: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  messagePreview: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  callButton: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: colors.accentTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
  },
  voiceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.borderMedium,
  },
  quickIcon: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  sendButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.borderMedium,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navItemActive: {
    transform: [{ translateY: -2 }],
  },
  navLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
