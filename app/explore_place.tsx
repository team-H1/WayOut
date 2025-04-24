import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TextInput,
  TouchableOpacity, Platform, Modal, Dimensions, Pressable, BackHandler
} from 'react-native';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import packages from '../data/Trip_Packages_With_Final_Category.json';
import { StatusBar } from 'expo-status-bar';


const categories = ['All', 'Beach', 'Mountain', 'Cultural', 'Urban', 'Adventure'];
const ITEMS_PER_PAGE = 5;

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCategory =
        activeCategory === 'All' || pkg.Category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        pkg['City/Location'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg['Destination Country'].toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const currentPackages = filteredPackages.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const closeModal = () => setSelectedTrip(null);

  useEffect(() => {
    const backAction = () => {
      if (selectedTrip) {
        setSelectedTrip(null);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [selectedTrip]);

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Discover your next adventure</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setPage(0);
                }}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  { marginRight: 12 },
                  activeCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => {
                  setActiveCategory(category);
                  setPage(0);
                }}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.destinationsGrid}>
            {currentPackages.map((destination, index) => (
              <BlurView key={index} intensity={80} tint="light" style={styles.destinationCard}>
                <TouchableOpacity onPress={() => setSelectedTrip(destination)}>
                  <Image source={{ uri: destination['Image URL'] }} style={styles.destinationImage} />
                  <View style={styles.destinationInfo}>
                    <View style={styles.destinationHeader}>
                      <Text style={styles.destinationName}>{destination['City/Location']}</Text>
                      <Text style={styles.destinationRating}>★ {destination.Rating}</Text>
                    </View>
                    <View style={styles.destinationLocation}>
                      <MapPin size={14} color="#666" />
                      <Text style={[styles.destinationCountry, { marginLeft: 6 }]}>
                        {destination['Destination Country']}
                      </Text>
                    </View>
                    <Text style={styles.destinationPrice}>{destination['Price (INR)']}</Text>
                  </View>
                </TouchableOpacity>
              </BlurView>
            ))}
          </View>

          {/* Minimal Premium-Looking Arrow Pagination */}
          {totalPages > 1 && (
            <View style={styles.arrowPagination}>
              <TouchableOpacity
                onPress={() => {
                  setPage((prev) => Math.max(prev - 1, 0));
                  scrollToTop();
                }}
                disabled={page === 0}
                style={[styles.arrowButton, page === 0 && styles.arrowDisabled, { marginRight: 20 }]}
              >
                <ChevronLeft size={20} color={page === 0 ? '#ccc' : '#007AFF'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPage((prev) => Math.min(prev + 1, totalPages - 1));
                  scrollToTop();
                }}
                disabled={page === totalPages - 1}
                style={[styles.arrowButton, page === totalPages - 1 && styles.arrowDisabled, { marginLeft: 20 }]}
              >
                <ChevronRight size={20} color={page === totalPages - 1 ? '#ccc' : '#007AFF'} />
              </TouchableOpacity>
            </View>
          )}
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
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedTrip?.['City/Location']} – {selectedTrip?.['Package Name']}</Text>

              <Text style={styles.modalText}><Text style={styles.label}>Country:</Text> {selectedTrip?.['Destination Country']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Description:</Text> {selectedTrip?.Description}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Duration:</Text> {selectedTrip?.['Duration (Days/Nights)']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Hotel:</Text> {selectedTrip?.Hotel}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Attractions:</Text> {selectedTrip?.['Included Attractions']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Inclusions:</Text> {selectedTrip?.['Other Inclusions']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Price:</Text> {selectedTrip?.['Price (INR)']}</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Review:</Text> “{selectedTrip?.Review}”</Text>
              <Text style={styles.modalText}><Text style={styles.label}>Rating:</Text> ★ {selectedTrip?.Rating}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f4f8',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  categoriesContainer: { marginBottom: 16 },
  categoriesContent: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  destinationsGrid: {
    paddingHorizontal: 24,
    gap: 24,
  },
  destinationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: 200,
  },
  destinationInfo: {
    padding: 16,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  destinationRating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFB800',
  },
  destinationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  destinationCountry: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#555',
  },
  destinationPrice: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  arrowPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginTop: 28,
    marginBottom: 48,
  },
  arrowButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  arrowDisabled: {
    backgroundColor: '#f0f0f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: Dimensions.get('window').height * 0.9,
    width: '100%',
    elevation: 6,
  },
  modalImage: {
    width: '100%',
    height: 200,
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
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    color: '#000',
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#444',
    marginBottom: 10,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
});
