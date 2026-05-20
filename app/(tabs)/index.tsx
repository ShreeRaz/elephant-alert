// app/(tabs)/index.tsx
import { useNotifications } from "@/hooks/useNotifications";
import { useSightings } from "@/hooks/useSightings";
import { Sighting } from "@/types";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIGHTINGS = 7;

const COLORS = {
  forestDark: "#1a2e1a",
  forestMid: "#2d4a2d",
  cream: "#f5f0e8",
  creamDark: "#ede8e0",
  orange: "#e8622a",
  white: "#ffffff",
  textDark: "#1a1a1a",
  textMid: "#555",
  textLight: "#888",
  highRisk: "#c0392b",
  highRiskBg: "#fdf0ef",
  medRisk: "#d97706",
  medRiskBg: "#fef9ec",
  lowRisk: "#2d7a3a",
  lowRiskBg: "#edf7ef",
  divider: "#e8e4dc",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getRisk(desc: string): "high" | "medium" | "low" {
  const d = desc.toLowerCase();
  if (d.includes("danger") || d.includes("aggressive") || d.includes("high"))
    return "high";
  if (d.includes("crossing") || d.includes("medium") || d.includes("near"))
    return "medium";
  return "low";
}

function getElephantCount(desc: string): number {
  const m = desc.match(/\d+/);
  return m ? parseInt(m[0]) : 1;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const [r] = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    if (!r) return "Unknown location";
    return (
      r.district || r.city || r.subregion || r.region || "Unknown location"
    );
  } catch {
    return "Unknown location";
  }
}

// ─── Live Dot ─────────────────────────────────────────────────────────────────

function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.2,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.liveContainer}>
      <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
      <Text style={styles.liveText}>LIVE MONITORING</Text>
    </View>
  );
}

// ─── Sighting Card ────────────────────────────────────────────────────────────

function SightingCard({
  sighting,
  location,
  onPress,
}: {
  sighting: Sighting;
  location: string;
  onPress: () => void;
}) {
  const risk = getRisk(sighting.description);
  const count = getElephantCount(sighting.description);
  const ago = timeAgo(sighting.created_at);

  const dotColor = {
    high: COLORS.highRisk,
    medium: COLORS.medRisk,
    low: COLORS.lowRisk,
  }[risk];

  const riskBg = {
    high: COLORS.highRiskBg,
    medium: COLORS.medRiskBg,
    low: COLORS.lowRiskBg,
  }[risk];

  const scaleAnim = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  }

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[styles.sightingCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.cardBar, { backgroundColor: dotColor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardDot, { backgroundColor: dotColor }]} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {location}
              </Text>
            </View>
            <Text style={styles.cardTime}>{ago}</Text>
          </View>

          <Text style={styles.cardReporter}>
            ↳ {sighting.reported_by || "Anonymous"}
          </Text>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {sighting.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>
                🐘 {count} elephant{count !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={[styles.cardRiskTag, { backgroundColor: riskBg }]}>
              <View
                style={[styles.cardRiskDot, { backgroundColor: dotColor }]}
              />
              <Text style={[styles.cardRiskText, { color: dotColor }]}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)} risk
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { sightings, isLoading, refetch } = useSightings();
  const { unreadCount, markAllRead } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState<Record<string, string>>({});

  const scrollRef = useRef<ScrollView>(null);
  const listOffsetY = useRef(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const recentSightings = sightings.slice(0, MAX_SIGHTINGS);
  const todayCount = sightings.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const activeReporters = new Set(sightings.map((s) => s.reported_by)).size;

  // ── Reverse geocode ────────────────────────────────────────────────────────
  useEffect(() => {
    async function geocodeAll() {
      const entries = await Promise.all(
        recentSightings.map(async (s) => {
          if (locations[s.id]) return [s.id, locations[s.id]] as const;
          const name = await reverseGeocode(s.latitude, s.longitude);
          return [s.id, name] as const;
        }),
      );
      setLocations(Object.fromEntries(entries));
    }

    if (recentSightings.length > 0) geocodeAll();
  }, [sightings]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  function openMap(s: Sighting) {
    router.push({
      pathname: "/(tabs)/map",
      params: {
        lat: String(s.latitude),
        lng: String(s.longitude),
      },
    });
  }

  function handleSeeAll() {
    scrollRef.current?.scrollTo({ y: listOffsetY.current, animated: true });
  }

  function handleBellPress() {
    markAllRead();
  }

  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.forestDark} />

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.orange}
            colors={[COLORS.orange]}
          />
        }
      >
        {/* ── Hero ── */}
        <Animated.View
          style={[styles.hero, { transform: [{ translateY: heroTranslate }] }]}
        >
          <View style={styles.heroTopBar}>
            <LiveDot />
            <TouchableOpacity
              style={styles.bellButton}
              onPress={handleBellPress}
              activeOpacity={0.8}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.heroGreeting}>Good morning, Ankit</Text>
          <Text style={styles.heroTitle}>Stay alert,{"\n"}stay safe. 🐘</Text>

          {sightings[0] && (
            <TouchableOpacity
              style={styles.alertBanner}
              onPress={() => openMap(sightings[0])}
              activeOpacity={0.88}
            >
              <View style={styles.alertBannerLeft}>
                <Text style={styles.alertBannerIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertBannerTitle}>
                    Active alert nearby
                  </Text>
                  <Text style={styles.alertBannerSub} numberOfLines={1}>
                    {locations[sightings[0].id] ?? "Locating..."} ·{" "}
                    {timeAgo(sightings[0].created_at)}
                  </Text>
                </View>
              </View>
              <Text style={styles.alertBannerArrow}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.statRow}>
            {[
              {
                icon: "📅",
                label: "Today",
                value: String(todayCount),
                sub: "sightings",
              },
              { icon: "📍", label: "Nearest", value: "2.3 km", sub: "Chitwan" },
              {
                icon: "👥",
                label: "Active",
                value: String(activeReporters),
                sub: "reporters",
              },
            ].map(({ icon, label, value, sub }) => (
              <View key={label} style={styles.statCard}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statSublabel}>{sub}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Recent Sightings ── */}
        <View
          style={styles.listSection}
          onLayout={(e) => {
            listOffsetY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent sightings</Text>
              <Text style={styles.sectionSub}>
                Last {Math.min(sightings.length, MAX_SIGHTINGS)} reports
              </Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={handleSeeAll}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🐘</Text>
              <Text style={styles.emptyText}>Loading sightings...</Text>
            </View>
          ) : recentSightings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌿</Text>
              <Text style={styles.emptyText}>No sightings reported yet.</Text>
            </View>
          ) : (
            recentSightings.map((s) => (
              <SightingCard
                key={s.id}
                sighting={s}
                location={locations[s.id] ?? "Locating..."}
                onPress={() => openMap(s)}
              />
            ))
          )}

          <View style={{ height: 110 }} />
        </View>
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/report")}
        activeOpacity={0.88}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SHADOW_SM = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  android: { elevation: 2 },
});
const SHADOW_MD = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  android: { elevation: 5 },
});
const SHADOW_LG = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  android: { elevation: 10 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { flex: 1 },

  hero: {
    backgroundColor: COLORS.forestDark,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  liveContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  liveText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.forestMid,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: { fontSize: 18 },
  bellBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    borderWidth: 1.5,
    borderColor: COLORS.forestDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  bellBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: "800" },

  heroGreeting: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 40,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  alertBanner: {
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    ...SHADOW_MD,
  },
  alertBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  alertBannerIcon: { fontSize: 20 },
  alertBannerTitle: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  alertBannerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 1,
  },
  alertBannerArrow: { color: COLORS.white, fontSize: 22, fontWeight: "300" },

  statRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.forestMid,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statIcon: { fontSize: 14, marginBottom: 4 },
  statLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "500",
  },
  statValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    marginVertical: 2,
  },
  statSublabel: { color: "rgba(255,255,255,0.45)", fontSize: 11 },

  listSection: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  sectionSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  seeAllButton: {
    backgroundColor: COLORS.forestDark,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  seeAllText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },

  sightingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOW_SM,
  },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  cardDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1,
  },
  cardTime: { fontSize: 11, color: COLORS.textLight, marginLeft: 8 },
  cardReporter: { fontSize: 11, color: COLORS.textLight, marginBottom: 6 },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textMid,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  cardTag: {
    backgroundColor: COLORS.creamDark,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cardTagText: { fontSize: 11, color: COLORS.textDark, fontWeight: "600" },
  cardRiskTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cardRiskDot: { width: 6, height: 6, borderRadius: 3 },
  cardRiskText: { fontSize: 11, fontWeight: "600" },

  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.textMid },

  fab: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW_LG,
  },
  fabIcon: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
  },
});
