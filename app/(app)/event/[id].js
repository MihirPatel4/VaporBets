import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Text style={styles.title}>{event.title}</Text>
      <Text>{event.description || 'No description available.'}</Text>
      <Text>Status: {event.status}</Text>
    </View>
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
    flex: 1,
    padding: 20,
  },
});

export default EventPage;