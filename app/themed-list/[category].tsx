import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import trips from '../../data/Trip_Packages_Custom_Full_Info.json';
import { StatusBar } from 'expo-status-bar';

export default function CategoryTripList() {
  const { category } = useLocalSearchParams();
  const filteredTrips = trips.filter((trip) => trip.Category === category);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const closeModal = () => setSelectedTrip(null);

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{category} Trips</Text>
            <Text style={styles.headerSubtitle}>Curated experiences for every travel vibe</Text>
          </View>

          <View style={styles.grid}>
            {filteredTrips.map((trip, i) => (
              <BlurView key={i} intensity={80} tint="light" style={styles.card}>
                <TouchableOpacity onPress={() => setSelectedTrip(trip)}>
                  <Image source={{ uri: trip['Image URL'] }} style={styles.image} />
                  <View style={styles.details}>
                    <Text style={styles.name}>{trip['Package Name']}</Text>
                    <Text style={styles.location}>{trip['City/Location']}, {trip.Country}</Text>
                    <Text style={styles.price}>{trip['Price (INR)']}</Text>
                    <Text style={styles.rating}>★ {trip.Rating}</Text>
                  </View>
                </TouchableOpacity>
              </BlurView>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal */}
      <Modal visible={!!selectedTrip} animationType="fade" transparent>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View>
              <Image source={{ uri: selectedTrip?.['Image URL'] }} style={styles.modalImage} />
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTrip?.['City/Location']} – {selectedTrip?.['Package Name']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Country:</Text> {selectedTrip?.Country}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Description:</Text> {selectedTrip?.Description}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Duration:</Text> {selectedTrip?.['Duration (Days/Nights)']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Hotel:</Text> {selectedTrip?.Hotel}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Attractions:</Text> {selectedTrip?.['Included Attractions']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Inclusions:</Text> {selectedTrip?.['Other Inclusions']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Price:</Text> {selectedTrip?.['Price (INR)']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Review:</Text> “{selectedTrip?.Review}”</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Rating:</Text> ★ {selectedTrip?.Rating}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const CARD_WIDTH = Dimensions.get('window').width * 0.85;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginTop: 4,
  },
  grid: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  price: {
    fontSize: 15,
    color: '#007AFF',
    fontFamily: 'Inter-Medium',
    marginTop: 6,
  },
  rating: {
    fontSize: 14,
    color: '#FFB800',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '95%',
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
    color: '#000',
  },
  modalText: {
    fontSize: 12.5,
    fontFamily: 'Inter-Regular',
    color: '#444',
    marginBottom: 6,
    lineHeight: 18,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
});
