import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Instagram, Github, Linkedin, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const TEAM = [
  {
    name: 'Jaya Kumar N',
    role: 'Founder & CEO',
    image: require('../data/jaya.jpg'),
    description: 'Visionary behind WayOut. Focuses on strategy, tech direction, and user-centric innovation.',
    socials: {
      instagram: 'https://www.instagram.com/jaya_heree?igsh=ZnRjcGhlM2Vxc3Zt',
      github: 'https://github.com/JayaKumar1618',
      linkedin: 'https://www.linkedin.com/in/jaya-kumar-n-37115228a',
      email: 'sanjay2020jaya@gmail.com',
    },
  },
  {
    name: 'Sanjai Surya V V',
    role: 'UI/UX Designer',
    image: require('../data/sanjai.jpg'),
    description: 'Designs intuitive and modern interfaces. Turns product ideas into pixel-perfect reality.',
    socials: {
      instagram: 'https://www.instagram.com/sanjai_surya_vv',
      github: 'https://github.com/sanjaisurya03',
      linkedin: 'https://www.linkedin.com/in/sanjai-surya-v-v-590b60287',
      email: 'sanjaisuryavelumani@gmail.com',
    },
  },
  {
    name: 'Kapil D',
    role: 'Mobile Developer',
    image: require('../data/kapil.jpg'),
    description: 'Builds smooth user experiences with code. Specializes in React Native and performance.',
    socials: {
      instagram: 'https://www.instagram.com/kapil_d05?igsh=MXc1cG9kYWczbTBxYg==',
      github: 'https://github.com/Kapil-D1908',
      linkedin: 'https://www.linkedin.com/in/kapil-deivendran-66706428a/',
      email: 'kapildeivendran@gmail.com',
    },
  },
];

export default function AboutScreen() {
  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>WayOut App</Text>
            <Text style={styles.headerSubtitle}>Your AI-Powered Travel Companion</Text>
          </View>

          <Text style={styles.description}>
            WayOut is a smart travel assistant designed to simplify your journey planning. From curated destinations to personalized suggestions, WayOut makes travel beautiful, simple, and intelligent.
          </Text>

          <Text style={styles.sectionHeader}>Meet the Team</Text>

          <View style={styles.cardGrid}>
            {TEAM.map((member, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.imageWrapper}>
                    <Image source={member.image} style={styles.cardImage} />
                  </View>
                  <View style={styles.textBlock}>
                    <Text style={styles.name}>{member.name}</Text>
                    <Text style={styles.role}>{member.role}</Text>
                    <Text style={styles.memberDescription}>{member.description}</Text>
                    <View style={styles.socialRow}>
                      <TouchableOpacity onPress={() => Linking.openURL(member.socials.instagram)}>
                        <Instagram size={20} color="#C13584" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Linking.openURL(member.socials.linkedin)}>
                        <Linkedin size={20} color="#0A66C2" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Linking.openURL(member.socials.github)}>
                        <Github size={20} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Linking.openURL(`mailto:${member.socials.email}`)}>
                        <Mail size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_WIDTH = Dimensions.get('window').width * 0.9;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    paddingBottom: 12,
    marginBottom: 16,
    width: '100%',
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
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#444',
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
    color: '#003366',
    alignSelf: 'flex-start',
  },
  cardGrid: {
    gap: 24,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageWrapper: {
    borderWidth: 2.5,
    borderColor: '#007AFF',
    borderRadius: 100,
    padding: 3,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#003366',
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  memberDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#444',
    marginBottom: 8,
    lineHeight: 18,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
});
