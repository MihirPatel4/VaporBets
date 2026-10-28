import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { apiRequest, subscribeToLiveUpdates } from '../../lib/auth';
import EventCard from '../../components/EventCard';

const App = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasLiveUpdateError, setHasLiveUpdateError] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || isLoading) {
        return;
      }

      let isActive = true;

      //helper to update data in state
      const onUpdate = (update) => {
        setEvents(currentEvents => currentEvents.map(event => {
          if (String(event.id) !== String(update.eventId)) {
            return event;
          }

          return {
            ...event,
            markets: event.markets?.map(market => ({
              ...market,
              outcomes: market.outcomes?.map(outcome => (
                String(outcome.id) === String(update.outcomeId) ? { ...outcome, probability: update.probability } : outcome
              )),
            })),
          };
        }));
      };

      //helper to update live update error state
      const onStatusChange = (error) => setHasLiveUpdateError(Boolean(error));

      //helper to fetch fresh event data
      const onConnected = async () => {
        const { data } = await apiRequest('/events');
        if (isActive) {
          setEvents(Array.isArray(data.events) ? data.events : []);
        }
      };

      //function to start the WebSocket subscription and return the cleanup
      const unsubscribe = subscribeToLiveUpdates(onUpdate, onStatusChange, onConnected);
      
      //called when the screen loses focus
      return () => {
        isActive = false;
        unsubscribe();
      };
    }, [isAuthenticated, isLoading])
  );

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

  const visibleEvents = events.filter((event) => event.status !== 'COMPLETED');

  return (
    <FlatList
      contentContainerStyle={visibleEvents.length === 0 ? styles.centered : styles.list}
      data={visibleEvents}
      keyExtractor={(event) => String(event.id)}
      ListEmptyComponent={<Text>No sports events are available.</Text>}
      ListHeaderComponent={
        hasLiveUpdateError ? <Text style={styles.liveUpdateError}>Live updates disconnected. Reconnecting...</Text> : null
      }
      renderItem={({ item }) => {
        const moneylineMarket = item.markets?.find((market) => market.sportsMarketType === 'moneyline');
        return (
          <EventCard 
            id={item.id}
            title={item.title}
            startTime={item.start_time}
            outcomes={moneylineMarket?.outcomes ?? []}
          />
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    backgroundColor: '#F3F4F6',
  },
  liveUpdateError: {
    color: '#B91C1C',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default App;