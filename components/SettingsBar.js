import { useState } from 'react';
import { Pressable, Text, View, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiRequest, clearAuthCookie } from '../lib/auth';

const SettingsBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (path) => {
    setIsMenuOpen(false);
    router.push(path);
  }

  const handleLogOut = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    }
    finally {
      await clearAuthCookie();
      setIsMenuOpen(false);
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.bar}>
        <Pressable accessibilityLabel='Open settings menu' onPress={() => setIsMenuOpen(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>≡</Text>
        </Pressable>
        <Text style={styles.title}>VaporBets</Text>
      </View>
      <Modal animationType='slide' onRequestClose={() => setIsMenuOpen(false)} transparent visible={isMenuOpen}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>VaporBets</Text>
              <Pressable accessibilityLabel='Close settings menu' onPress={() => setIsMenuOpen(false)}>
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>
            <View style={styles.linksSection}>
              <Pressable onPress={() => navigateTo('/account-settings')}>
                <Text style={styles.link}>Account Settings</Text>
              </Pressable>
              <Pressable onPress={() => navigateTo('/friends')}>
                <Text style={styles.link}>Friends</Text>
              </Pressable>
              <Pressable onPress={() => navigateTo('/bookmarks')}>
                <Text style={styles.link}>Bookmarks</Text>
              </Pressable>
              <Pressable onPress={() => navigateTo('/notification-settings')}>
                <Text style={styles.link}>Notification Settings</Text>
              </Pressable>
            </View>
            <View style={styles.logoutSection}>
              <Pressable onPress={handleLogOut}>
                <Text style={styles.logout}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuButton: {
    width: 40,
  },
  menuIcon: {
    color: '#18252B',
    fontSize: 28,
    lineHeight: 28,
  },
  title: {
    color: '#18252B',
    fontSize: 20,
    fontWeight: '800',
  },
  spacer: {
    width: 40,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flex: 1,
  },
  drawer: {
    backgroundColor: '#F5F0E8',
    flex: 1,
    justifyContent: 'flex-start',
    padding: 24,
  },
  drawerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    color: '#18252B',
    fontSize: 24,
    fontWeight: '800',
  },
  closeButton: {
    color: '#18252B',
    fontSize: 32,
  },
  linksSection: {
    gap: 24,
    marginTop: 48,
  },
  link: {
    color: '#385B63',
    fontSize: 18,
    fontWeight: '700',
    borderBottomColor: '#D9D2C8',
    borderBottomWidth: 1,
  },
  logoutSection: {
    borderTopColor: '#D9D2C8',
    borderTopWidth: 1,
    paddingTop: 24,
    marginLeft: 24,
    marginTop: 'auto',
  },
  logout: {
    color: '#B33D32',
    fontSize: 18,
    fontWeight: '700',
  }, 
});

export default SettingsBar;