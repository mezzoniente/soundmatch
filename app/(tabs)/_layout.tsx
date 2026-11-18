import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { Icon, IconName } from '../../src/components/Icon';

function TabIcon({
  icon,
  iconFocused,
  label,
  focused,
}: {
  icon: IconName;
  iconFocused: IconName;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <Icon
        name={focused ? iconFocused : icon}
        size={24}
        color={focused ? Colors.accent : Colors.textMuted}
      />
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelFocused]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="flash-outline" iconFocused="flash" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="map-outline" iconFocused="map" label="Map" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="chatbubble-outline"
              iconFocused="chatbubble"
              label="Chat"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="person-outline"
              iconFocused="person"
              label="Perfil"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    paddingTop: 6,
    width: 72,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: Colors.accent,
  },
});
