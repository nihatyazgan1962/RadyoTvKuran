import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#0B0F19',
          borderTopColor: '#334155',
          borderTopWidth: 2,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.5,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: '#0B0F19',
          borderBottomColor: '#1E293B',
          borderBottomWidth: 1,
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
      }}>
      <Tabs.Screen
        name="tv"
        options={{
          title: 'Canlı TV',
          headerTitle: '🇹🇷 CANLI TV REHBERİ',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveTv]}>
              <Text style={styles.tabIconEmoji}>{focused ? '📺' : '🖥️'}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Canlı Radyo',
          headerTitle: '🇹🇷 CANLI RADYO REHBERİ',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveRadio]}>
              <Text style={styles.tabIconEmoji}>{focused ? '📻' : '🎙️'}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="kariler"
        options={{
          title: 'Kur\'an & Kâri',
          headerTitle: '📖 KUR\'AN-I KERİM & KÂRİLER',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveQuran]}>
              <Text style={styles.tabIconEmoji}>{focused ? '📖' : '📜'}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Rehber & Ayar',
          headerTitle: '⚙️ REHBER & AYARLAR',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveSettings]}>
              <Text style={styles.tabIconEmoji}>{focused ? '⚙️' : '🔧'}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActiveTv: {
    backgroundColor: '#E11D48',
  },
  tabIconActiveRadio: {
    backgroundColor: '#059669',
  },
  tabIconActiveQuran: {
    backgroundColor: '#0284C7',
  },
  tabIconActiveSettings: {
    backgroundColor: '#D97706',
  },
  tabIconEmoji: {
    fontSize: 17,
  },
});

