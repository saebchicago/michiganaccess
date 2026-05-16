import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { CommunityResource } from "@/hooks/useResources";

const TYPE_COLORS: Record<string, string> = {
  Health: "#3f51b5",
  "Mental Health": "#7b1fa2",
  Food: "#558b2f",
  Housing: "#ef6c00",
  Transportation: "#0277bd",
  Legal: "#c62828",
  Financial: "#f57f17",
  Education: "#1565c0",
};

interface ResourceCardProps {
  resource: CommunityResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const colors = useColors();
  const typeColor = TYPE_COLORS[resource.resource_type] ?? "#546e7a";

  const callPhone = () => {
    if (!resource.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${resource.phone.replace(/\D/g, "")}`);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.badges}>
        <View
          style={[styles.typeBadge, { backgroundColor: typeColor + "18" }]}
        >
          <Text
            style={[
              styles.typeText,
              { color: typeColor, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {resource.resource_type}
          </Text>
        </View>
        {resource.is_free ? (
          <View style={[styles.badge, { backgroundColor: "#558b2f18" }]}>
            <Text
              style={[
                styles.badgeText,
                { color: "#558b2f", fontFamily: "Inter_500Medium" },
              ]}
            >
              Free
            </Text>
          </View>
        ) : null}
        {resource.is_24_7 ? (
          <View style={[styles.badge, { backgroundColor: "#0277bd18" }]}>
            <Text
              style={[
                styles.badgeText,
                { color: "#0277bd", fontFamily: "Inter_500Medium" },
              ]}
            >
              24/7
            </Text>
          </View>
        ) : null}
        {resource.walk_in_available ? (
          <View style={[styles.badge, { backgroundColor: "#f57f1718" }]}>
            <Text
              style={[
                styles.badgeText,
                { color: "#f57f17", fontFamily: "Inter_500Medium" },
              ]}
            >
              Walk-in
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.name,
          { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
        ]}
        numberOfLines={2}
      >
        {resource.resource_name}
      </Text>

      {resource.organization &&
      resource.organization !== resource.resource_name ? (
        <Text
          style={[
            styles.org,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
          numberOfLines={1}
        >
          {resource.organization}
        </Text>
      ) : null}

      {resource.address ? (
        <View style={styles.row}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.meta,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
            numberOfLines={1}
          >
            {resource.address}, {resource.city}
          </Text>
        </View>
      ) : null}

      {resource.phone ? (
        <Pressable onPress={callPhone} style={styles.row}>
          <Feather name="phone" size={13} color={colors.primary} />
          <Text
            style={[
              styles.meta,
              { color: colors.primary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {resource.phone}
          </Text>
        </Pressable>
      ) : null}

      {resource.hours ? (
        <View style={styles.row}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text
            style={[
              styles.meta,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
            numberOfLines={1}
          >
            {resource.hours}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 6,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  org: {
    fontSize: 13,
    marginTop: -2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontSize: 13,
    flex: 1,
  },
});
