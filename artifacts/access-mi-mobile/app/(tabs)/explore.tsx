import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SearchBar } from "@/components/SearchBar";
import { useColors } from "@/hooks/useColors";

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

function CountyRow({ name, index }: { name: string; index: number }) {
  const colors = useColors();

  const viewResources = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/(tabs)/resources",
      params: { county: name },
    });
  };

  const viewCare = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/(tabs)/care",
      params: { county: name },
    });
  };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.indexBox, { backgroundColor: colors.primary + "12" }]}>
        <Text
          style={[
            styles.indexText,
            { color: colors.primary, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {index + 1}
        </Text>
      </View>

      <View style={styles.countyInfo}>
        <Text
          style={[
            styles.countyName,
            { color: colors.foreground, fontFamily: "Inter_500Medium" },
          ]}
        >
          {name} County
        </Text>
      </View>

      <Pressable
        onPress={viewResources}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: colors.primary + "14",
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="heart" size={14} color={colors.primary} />
      </Pressable>

      <Pressable
        onPress={viewCare}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: "#558b2f14",
            marginLeft: 6,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="activity" size={14} color="#558b2f" />
      </Pressable>
    </View>
  );
}

export default function ExploreScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MI_COUNTIES;
    return MI_COUNTIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  const bottomPad = Platform.OS === "web" ? 100 : 80;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search Michigan counties…"
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Text
              style={[
                styles.legendText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Resources
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: "#558b2f" }]}
            />
            <Text
              style={[
                styles.legendText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Care
            </Text>
          </View>
          <Text
            style={[
              styles.countText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {filtered.length} / 83 counties
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <CountyRow name={item} index={index} />
        )}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingLeft: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  countText: {
    fontSize: 12,
    marginLeft: "auto",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  indexBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  indexText: {
    fontSize: 13,
  },
  countyInfo: {
    flex: 1,
  },
  countyName: {
    fontSize: 15,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
