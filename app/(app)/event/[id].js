import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest, subscribeToLiveUpdates } from "../../../lib/auth";

const EventPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasLiveUpdateError, setHasLiveUpdateError] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await apiRequest(`/events/${id}`);
        setEvent(data.event);
      }
      catch {
        setHasError(true);
      }
      finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) {
        return;
      }

      let isActive = true;

      //helper to update data in state
      const onUpdate = (update) => {
        setEvent(currentEvent => {
          if (!currentEvent || String(currentEvent.id) !== String(update.eventId)) {
            return currentEvent;
          }

          return {
            ...currentEvent,
            markets: currentEvent.markets?.map(market => ({
              ...market,
              outcomes: market.outcomes?.map(outcome => (
                String(outcome.id) === String(update.outcomeId) ? { ...outcome, probability: update.probability } : outcome
              )),
            })),
          };
        });
      };

      //helper to update live update error state
      const onStatusChange = (error) => setHasLiveUpdateError(Boolean(error));

      //helper to fetch fresh event data
      const onConnected = async () => {
        const { data } = await apiRequest(`/events/${id}`);
        if (isActive) {
          setEvent(data.event);
        }
      };

      //function to start the WebSocket subscription and return the cleanup
      const unsubscribe = subscribeToLiveUpdates(onUpdate, onStatusChange, onConnected);

      //called when the screen loses focus
      return () => {
        isActive = false;
        unsubscribe();
      };
    }, [id, isLoading])
  );

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />
  }

  if (hasError || !event) {
    return (
      <View style={styles.centered}>
        <Text>Unable to load event</Text>
      </View>
    );
  }

  //separate the moneyline market from the others
  const moneylineMarket = event.markets?.find((market) => market.sports_market_type === 'moneyline');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Text style={styles.title}>{event.title}</Text>
      <Text>Status: {event.status}</Text>
      {hasLiveUpdateError && <Text style={styles.liveUpdateError}>Live updates disconnected. Reconnecting...</Text>}
      {moneylineMarket && (
        <View style={styles.market}>
          {moneylineMarket.outcomes?.map((outcome) => (
            <Text key={outcome.id} style={styles.moneylineOutcome}>{outcome.label}: {(Number(outcome.probability) * 100).toFixed(1)}%</Text>
          ))}
        </View>
      )}
      <Text style={styles.description}>{event.description || 'No description available.'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 20,
  },
  container: {
    padding: 20,
  },
  market: {
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 12,
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  moneylineOutcome: {
    fontSize: 20,
    fontWeight: '600',
  },
  liveUpdateError: {
    color: '#B91C1C',
    marginTop: 12,
  },
  description: {
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 12,
  },
});

export default EventPage;