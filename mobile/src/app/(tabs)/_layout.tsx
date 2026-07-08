import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

type FeatherName = keyof typeof Feather.glyphMap;

const TABS: { name: string; title: string; icon: FeatherName }[] = [
  { name: 'index', title: t.tabHome, icon: 'home' },
  { name: 'events', title: t.tabEvents, icon: 'globe' },
  { name: 'ticket', title: t.tabTicket, icon: 'bookmark' },
  { name: 'account', title: t.tabAccount, icon: 'user' },
];

function TabButton({
  title,
  icon,
  focused,
  onPress,
}: {
  title: string;
  icon: FeatherName;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tabBtn, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconWrap, focused && styles.iconWrapOn]}>
        <Feather
          name={icon}
          size={19}
          color={focused ? colors.maroon : colors.ink3}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>
      <Text
        style={{
          fontFamily: focused ? font.semibold : font.regular,
          fontSize: 10,
          color: focused ? colors.maroon : colors.ink3,
          marginTop: 3,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={({ state, navigation }) => (
        <View style={styles.barWrap}>
          <View style={styles.bar}>
            {TABS.map((tab, i) => {
              const focused = state.index === i;
              return (
                <TabButton
                  key={tab.name}
                  title={tab.title}
                  icon={tab.icon}
                  focused={focused}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: state.routes[i].key,
                      canPreventDefault: true,
                    });
                    if (!event.defaultPrevented) {
                      navigation.navigate(tab.name as any);
                    }
                  }}
                />
              );
            })}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="ticket" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
  },
  bar: {
    flexDirection: rtlRow,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    boxShadow: '0 4px 14px rgba(29,22,20,0.1)',
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 34,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOn: {
    backgroundColor: colors.redBg,
  },
});
