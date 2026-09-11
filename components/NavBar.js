import { useState } from 'react';
import { Pressable, Text, View, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiRequest, clearAuthCookie } from '../lib/auth';

const NavBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  }

  const handleMenuClose = () => {
    setIsMenuOpen(false);
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
    <>
      <View>
        <Pressable accessibilityLabel='Open side bar' onPress={handleMenuOpen}>
          <Text>≡</Text>
        </Pressable>
        <Text>VaporBets</Text>
      </View>
      <Modal animationType='slide' onRequestClose={handleMenuClose} transparent visible={isMenuOpen}>
        <SafeAreaView>
          <View>
            <Pressable accessibilityLabel='Close menu' onPress={handleMenuClose}>
              <Text>×</Text>
            </Pressable>
          </View>
          <View>
            <Text>VaporBets</Text>
          </View>
          <View>
            {/* profile, bookmarks, settings, etc. */}
          </View>
          <View>
            <Pressable onPress={handleLogOut}>
              <Text>Log out</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({});

export default NavBar;