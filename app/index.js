import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const App = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    //AbortController cancels the async operation and is used to keep track of loading status
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const response = await fetch(`${API_BASE_URL}/events`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } 
      catch (error) {
        if (error.name !== 'AbortError') {
          setHasError(true);
          console.log(error);
        }
      } 
      finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();
    return () => controller.abort();
  }, []);

  if (isLoading) {
    //loading animation
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