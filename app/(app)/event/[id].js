import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../../../lib/auth";

const EventPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
  const otherMarkets = event.markets?.filter((market) => market.sports_market_type !== 'moneyline' ?? []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Text style={styles.title}>{event.title}</Text>
      <Text>Status: {event.status}</Text>
      {moneylineMarket && (
        <View style={styles.market}>
          {moneylineMarket.outcomes?.map((outcome) => (
            <Text key={outcome.id} style={styles.moneylineOutcome}>{outcome.label}: {(Number(outcome.probability) * 100).toFixed(1)}%</Text>
          ))}
        </View>
      )}
      <Text style={styles.description}>{event.description || 'No description available.'}</Text>
      {otherMarkets.map((market) => (
        <View key={market.id} style={styles.market}>
          <Text style={styles.marketTitle}>{market.question}</Text>
          {market.outcomes?.map((outcome) => (
            <Text key={outcome.id}>{outcome.label}: {(Number(outcome.probability) * 100).toFixed(1)}%</Text>
          ))}
        </View>
      ))}
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
  description: {
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 12,
  },
});

export default EventPage;