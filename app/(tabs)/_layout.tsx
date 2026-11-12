import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#040B24',
          borderTopColor: '#1E3A8A',
          borderTopWidth: 1.5,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 5,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.5,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 1,
        },
        headerStyle: {
          backgroundColor: '#040B24',
          borderBottomColor: '#1E293B',
          borderBottomWidth: 1,
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 15,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kokpit',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveRadio]}>
              <Text style={styles.tabIconEmoji}>{focused ? '🚘' : '🎛️'}</Text>
            </View>
          ),
        }}
      />
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
        name="mp4"
        options={{
          title: 'MP4 Video',
          headerTitle: '🎬 MP4 VİDEO & MEDYA MERKEZİ',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActiveMp4]}>
              <Text style={styles.tabIconEmoji}>{focused ? '🎬' : '🎞️'}</Text>
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
  tabIconActiveMp4: {
    backgroundColor: '#7C3AED',
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

