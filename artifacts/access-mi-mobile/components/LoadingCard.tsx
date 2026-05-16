import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

function ShimmerBar({
  width,
  height = 14,
  style,
}: {
  width: number | `${number}%`;
  height?: number;
  style?: object;
}) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 6,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function LoadingCard() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.badgeRow}>
        <ShimmerBar width={70} height={22} style={{ borderRadius: 6 }} />
        <ShimmerBar width={50} height={22} style={{ borderRadius: 6 }} />
      </View>
      <ShimmerBar width="65%" height={17} style={{ marginTop: 6 }} />
      <ShimmerBar width="45%" height={13} style={{ marginTop: 6 }} />
      <ShimmerBar width="80%" height={13} style={{ marginTop: 6 }} />
      <ShimmerBar width="55%" height={13} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
});
