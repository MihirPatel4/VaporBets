import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from "expo-router";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.push('/')}>
          <Text style={pathname === '/' ? styles.active : styles.label}>Live</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/')}>
          <Text style={pathname === '/' ? styles.active : styles.label}>Upcoming</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/bets')}>
          <Text style={pathname === '/' ? styles.active : styles.label}>Bets</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/profile')}>
          <Text style={pathname === '/' ? styles.active : styles.label}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  label: {
    color: '#657078',
  },
  active: {
    color: '#d96c3f',
    fontWeight: '700',
  },
});

export default NavBar;