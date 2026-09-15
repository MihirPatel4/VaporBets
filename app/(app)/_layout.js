import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import SettingsBar from '../../components/SettingsBar';

const Root = () => {
  return (
    <View style={styles.container}>
      <SettingsBar />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Root;