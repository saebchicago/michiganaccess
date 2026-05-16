import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FacilityCard } from "@/components/FacilityCard";
import { FilterChip } from "@/components/FilterChip";
import { LoadingCard } from "@/components/LoadingCard";
import { SearchBar } from "@/components/SearchBar";
import { useColors } from "@/hooks/useColors";
import { useFacilities } from "@/hooks/useResources";

const FACILITY_TYPES = [
  "All",
  "Hospital",
  "Clinic",
  "FQHC",
  "Pharmacy",
  "Urgent Care",
  "Mental Health",
  "Hospice",
];

export default function CareScreen() {
  const colors = useColors();
  const [county, setCounty] = useState("");
  const [facilityType, setFacilityType] = useState("All");

  const { data, isLoading, error, refetch, isRefetching } = useFacilities(
    county.trim() || undefined,
    facilityType !== "All" ? facilityType : undefined,
  );

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
          value={county}
          onChangeText={setCounty}
          placeholder="Filter by county…"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={[styles.chipsRow, { borderBottomColor: colors.border }]}
      >
        {FACILITY_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={type}
            active={facilityType === type}
            onPress={() => setFacilityType(type)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <LoadingCard />}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        />
      ) : error ? (
        <EmptyState
          icon="alert-circle"
          title="Couldn't load facilities"
          subtitle={(error as Error).message}
        />
      ) : !data?.length ? (
        <EmptyState
          icon="activity"
          title="No facilities found"
          subtitle={
            county.trim()
              ? `No ${facilityType !== "All" ? facilityType.toLowerCase() + " " : ""}facilities in ${county.trim()} County`
              : "Enter a county name above to find care facilities nearby"
          }
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FacilityCard facility={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              style={[
                styles.resultCount,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {data.length} result{data.length !== 1 ? "s" : ""}
              {county.trim() ? ` in ${county.trim()} County` : ""}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    padding: 12,
    borderBottomWidth: 1,
  },
  chipsRow: {
    borderBottomWidth: 1,
  },
  chips: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  resultCount: {
    fontSize: 13,
    marginBottom: 10,
  },
});
