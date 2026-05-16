import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/SearchBar";
import { useColors } from "@/hooks/useColors";
import { supabaseConfigured } from "@/lib/supabase";

const MI_COUNTIES = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga", "Barry",
  "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass", "Charlevoix", "Cheboygan",
  "Chippewa", "Clare", "Clinton", "Crawford", "Delta", "Dickinson", "Eaton", "Emmet",
  "Genesee", "Gladwin", "Gogebic", "Grand Traverse", "Gratiot", "Hillsdale", "Houghton",
  "Huron", "Ingham", "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo",
  "Kalkaska", "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta", "Menominee",
  "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency", "Muskegon", "Newaygo",
  "Oakland", "Oceana", "Ogemaw", "Ontonagon", "Osceola", "Oscoda", "Otsego", "Ottawa",
  "Presque Isle", "Roscommon", "Saginaw", "Saint Clair", "Saint Joseph", "Sanilac",
  "Schoolcraft", "Shiawassee", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
];

const CATEGORIES = [
  {
    key: "resources",
    label: "Resources",
    subtitle: "Health, food, housing",
    icon: "heart" as const,
    color: "#3f51b5",
    bg: "#3f51b514",
    path: "/(tabs)/resources" as const,
  },
  {
    key: "care",
    label: "Care",
    subtitle: "Hospitals & clinics",
    icon: "activity" as const,
    color: "#558b2f",
    bg: "#558b2f14",
    path: "/(tabs)/care" as const,
  },
  {
    key: "explore",
    label: "Counties",
    subtitle: "All 83 Michigan counties",
    icon: "map" as const,
    color: "#0277bd",
    bg: "#0277bd14",
    path: "/(tabs)/explore" as const,
  },
] as const;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 100 : 80;

  const suggestions =
    search.trim().length >= 2
      ? MI_COUNTIES.filter((c) =>
          c.toLowerCase().includes(search.toLowerCase().trim()),
        ).slice(0, 5)
      : [];

  const goCounty = (name: string) => {
    Haptics.selectionAsync();
    setSearch("");
    router.push({
      pathname: "/(tabs)/resources",
      params: { county: name },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.primary,
            paddingTop: topPad + 20,
          },
        ]}
      >
        <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
          Access Michigan
        </Text>
        <Text
          style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}
        >
          Civic data for all 83 counties — free
        </Text>

        <View style={{ marginTop: 18 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Find your county…"
          />
        </View>

        {suggestions.length > 0 && (
          <View
            style={[styles.suggestions, { backgroundColor: colors.card }]}
          >
            {suggestions.map((c, i) => (
              <Pressable
                key={c}
                onPress={() => goCounty(c)}
                style={({ pressed }) => [
                  styles.suggRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth:
                      i < suggestions.length - 1
                        ? StyleSheet.hairlineWidth
                        : 0,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name="map-pin" size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.suggText,
                    {
                      color: colors.foreground,
                      fontFamily: "Inter_400Regular",
                    },
                  ]}
                >
                  {c} County
                </Text>
                <Feather
                  name="chevron-right"
                  size={14}
                  color={colors.mutedForeground}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {!supabaseConfigured && (
        <View
          style={[
            styles.banner,
            { backgroundColor: "#fff8e1", borderColor: "#ffca28" },
          ]}
        >
          <Feather name="info" size={15} color="#b37800" />
          <Text
            style={[
              styles.bannerText,
              { color: "#7a5200", fontFamily: "Inter_400Regular" },
            ]}
          >
            Demo mode — set{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              EXPO_PUBLIC_SUPABASE_URL
            </Text>{" "}
            and{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              EXPO_PUBLIC_SUPABASE_ANON_KEY
            </Text>{" "}
            to load live data.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Explore Data
        </Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(cat.path);
              }}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: cat.bg }]}>
                <Feather name={cat.icon} size={22} color={cat.color} />
              </View>
              <Text
                style={[
                  styles.tileLabel,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                {cat.label}
              </Text>
              <Text
                style={[
                  styles.tileSub,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                numberOfLines={1}
              >
                {cat.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.statsRow, { backgroundColor: colors.muted }]}>
        {(
          [
            { value: "83", label: "Counties" },
            { value: "20+", label: "Data sources" },
            { value: "Free", label: "Always" },
          ] as const
        ).map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                { color: colors.primary, fontFamily: "Inter_700Bold" },
              ]}
            >
              {s.value}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          About
        </Text>
        <View
          style={[
            styles.aboutCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.aboutText,
              { color: colors.foreground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Access Michigan provides ZIP- and county-level data on healthcare,
            housing, food access, transit, environment, civic power, and more
            across Michigan — organized for action.
          </Text>
          <Pressable
            style={[styles.webRow, { borderTopColor: colors.border }]}
            onPress={() => Linking.openURL("https://accessmichigan.org")}
          >
            <Text
              style={[
                styles.webRowText,
                { color: colors.primary, fontFamily: "Inter_500Medium" },
              ]}
            >
              Visit accessmichigan.org
            </Text>
            <Feather
              name="external-link"
              size={14}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroTitle: {
    fontSize: 30,
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.82)",
    marginTop: 5,
  },
  suggestions: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
  },
  suggRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  suggText: {
    flex: 1,
    fontSize: 15,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    margin: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 17,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "47.5%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  tileIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontSize: 15,
    marginTop: 2,
  },
  tileSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 18,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 12,
  },
  aboutCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
  },
  webRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  webRowText: { fontSize: 14 },
});
