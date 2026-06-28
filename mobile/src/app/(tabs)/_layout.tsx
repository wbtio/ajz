import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { t } from '@/lib/i18n';
import { colors, font } from '@/lib/theme';

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.line, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabHome, tabBarIcon: ({ focused }) => <Icon emoji="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: t.tabEvents, tabBarIcon: ({ focused }) => <Icon emoji="🌍" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ticket"
        options={{ title: t.tabTicket, tabBarIcon: ({ focused }) => <Icon emoji="🎫" focused={focused} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t.tabAccount, tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} /> }}
      />
    </Tabs>
  );
}
