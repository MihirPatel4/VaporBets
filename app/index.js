import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { apiRequest } from '../lib/auth';

const App = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    //load home page if user is authenticated
    const loadHome = async () => {
      try {
        await apiRequest('/auth/me', { signal: controller.signal });
        
        if (controller.signal.aborted) {
          return;
        }

        setIsAuthenticated(true);

        const { data } = await apiRequest('/events', { signal: controller.signal });
        setEvents(Array.isArray(data.events) ? data.events : []);
      } 
      catch (error) {
        if (error.name !== 'AbortError' && error.status !== 401) {
          setHasError(true);
        }
      } 
      finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsCheckingSession(false);
        }
      }
    }

    loadHome();
    return () => controller.abort();
  }, []);

  //loading animation
  if (isCheckingSession) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  //send user to login page if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  //loading animation
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.centered}>
        <Text>Unable to load sports events.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={events.length === 0 ? styles.centered : styles.list}
      data={events}
      keyExtractor={(event) => String(event.id)}
      ListEmptyComponent={<Text>No sports events are available.</Text>}
      renderItem={({ item }) => <EventCard title={item.title} />}
    />
  );
};

const EventCard = (props) => {
  return (
    <View style={styles.card}>
      <Text>{props.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  list: {
    padding: 16,
  },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 16,
  },
});

export default App;