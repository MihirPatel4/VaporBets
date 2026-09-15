import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

const EventCard = (props) => {
  const router = useRouter();

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/event/${props.id}`)}>
      <Text>{props.title}</Text>
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
});

export default EventCard;