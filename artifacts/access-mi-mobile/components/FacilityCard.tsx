import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Facility } from "@/hooks/useResources";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];

const TYPE_ICONS: Record<string, FeatherIcon> = {
  Hospital: "activity",
  Clinic: "heart",
  FQHC: "users",
  Pharmacy: "package",
  "Urgent Care": "alert-circle",
  "Mental Health": "smile",
  Hospice: "home",
};

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const colors = useColors();
  const iconName: FeatherIcon = TYPE_ICONS[facility.facility_type] ?? "crosshair";

  const callPhone = () => {
    if (!facility.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${facility.phone.replace(/\D/g, "")}`);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconBox, { backgroundColor: colors.primary + "14" }]}
        >
          <Feather name={iconName} size={20} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text
            style={[
              styles.name,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
            numberOfLines={2}
          >
            {facility.name}
          </Text>
          <Text
            style={[
              styles.type,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {facility.facility_type}
          </Text>
        </View>
      </View>

      {(facility.accepting_new_patients ||
        facility.telehealth_available ||
        facility.walk_in) ? (
        <View style={styles.badges}>
          {facility.accepting_new_patients ? (
            <View style={[styles.badge, { backgroundColor: "#558b2f18" }]}>
              <Text
                style={[
                  styles.badgeText,
                  { color: "#558b2f", fontFamily: "Inter_500Medium" },
                ]}
              >
                Accepting patients
              </Text>
            </View>
          ) : null}
          {facility.telehealth_available ? (
            <View style={[styles.badge, { backgroundColor: "#0277bd18" }]}>
              <Text
                style={[
                  styles.badgeText,
                  { color: "#0277bd", fontFamily: "Inter_500Medium" },
                ]}
              >
                Telehealth
              </Text>
            </View>
          ) : null}
          {facility.walk_in ? (
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
      ) : null}

      <View style={styles.row}>
        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        <Text
          style={[
            styles.meta,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
          numberOfLines={1}
        >
          {facility.address}, {facility.city}
        </Text>
      </View>

      {facility.phone ? (
        <Pressable onPress={callPhone} style={styles.row}>
          <Feather name="phone" size={13} color={colors.primary} />
          <Text
            style={[
              styles.meta,
              { color: colors.primary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {facility.phone}
          </Text>
        </Pressable>
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
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    lineHeight: 21,
  },
  type: {
    fontSize: 13,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
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
