import colors from "@/src/config/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const profile = {
  name: "Gloria Ramos",
  age: 70,
  location: "Quezon City, Philippines",
  about: "I enjoy gardening, reading and playing with my grandchildren.",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
};

const suggestions = [
  {
    name: "Gloria Ramos",
    age: 70,
    location: "Quezon City",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Mila Santos",
    age: 68,
    location: "Quezon City",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Linda Cruz",
    age: 66,
    location: "Quezon City",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Maria Lee",
    age: 69,
    location: "Quezon City",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="heart" size={18} color={colors.white} />
            </View>
            <Text style={styles.brandName}>TANDER</Text>
          </View>

          <TouchableOpacity style={styles.videoButton} activeOpacity={0.9}>
            <Ionicons name="videocam" size={18} color={colors.white} />
            <Text style={styles.videoButtonText}>Video Call</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.videoPrompt}>Press me to video call</Text>

        {/* Inbox Navigation */}
        <TouchableOpacity
          style={styles.inboxNavButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("InboxScreen" as never)}
        >
          <Text style={styles.inboxNavText}>Go to Inbox</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Hero Card */}
        <LinearGradient
          colors={["#FFF1E0", "#E9F7F5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Ready for your next conversation?</Text>
            <Text style={styles.heroSubtitle}>
              We found people who share your interests and values.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
            <Ionicons name="call" size={16} color={colors.white} />
            <Text style={styles.primaryButtonText}>Start Video Call</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.profileTextGroup}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {profile.name}, {profile.age}
                </Text>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={18}
                  color={colors.accentTeal}
                  style={styles.verifiedIcon}
                />
              </View>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.aboutBox}>
            <Text style={styles.aboutLabel}>About Me</Text>
            <Text style={styles.aboutText}>{profile.about}</Text>
          </View>
        </View>

        {/* Complete Profile */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New to our community</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Complete your Profile</Text>
          <Text style={styles.cardSubtitle}>
            Add your photos and details to get better matches.
          </Text>

          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.9}>
            <Text style={styles.outlineButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Suggestions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>People You May Know!</Text>
          <Text style={styles.sectionSubtitle}>Select gender</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsRow}
        >
          {suggestions.map((person) => (
            <View key={person.name} style={styles.suggestionCard}>
              <Image source={{ uri: person.avatar }} style={styles.suggestionAvatar} />
              <Text style={styles.suggestionName}>{person.name}</Text>
              <Text style={styles.suggestionMeta}>
                {person.age}, {person.location}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  brandIcon: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  brandName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  videoButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  videoPrompt: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
  },

  inboxNavButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },

  inboxNavText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  heroContent: {
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },

  primaryButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  profileTextGroup: {
    flex: 1,
  },

  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: colors.borderMedium,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  verifiedIcon: {
    marginTop: 2,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  aboutBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
  },

  aboutLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },

  aboutText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  badgeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  badge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  outlineButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },

  sectionHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  suggestionsRow: {
    gap: 12,
    paddingRight: 6,
  },

  suggestionCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  suggestionAvatar: {
    height: 70,
    width: 70,
    borderRadius: 35,
    marginBottom: 10,
    backgroundColor: colors.borderMedium,
  },

  suggestionName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },

  suggestionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
});
