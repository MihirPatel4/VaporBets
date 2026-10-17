import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

const EventCard = ({ id, title, startTime, outcomes = [] }) => {
  const router = useRouter();
  const startDate = startTime ? new Date(startTime) : null;
  const formattedStartDate =
    startDate && !Number.isNaN(startDate.getTime())
      ? new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(startDate)
      : null;

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/event/${id}`)}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.startDate}>{formattedStartDate}</Text>
      {outcomes.map((outcome) => (
        <Text key={outcome.id}>{outcome.team}: {(Number(outcome.probability) * 100).toFixed(1)}%</Text>
      ))}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 12,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    paddingBottom: 12,
  },
  startDate: {
    color: '#6B7280',
    marginBottom: 12,
  }
});

export default EventCard;