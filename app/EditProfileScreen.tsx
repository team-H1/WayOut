import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your photo library.');
      }
    };

    const fetchUserData = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (sessionError || !user) {
        Alert.alert('Not Logged In', 'Please log in to edit your profile.');
        router.replace('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setName(profileData.name);
        setPhone(profileData.phone || '');
        setImage({ uri: profileData.avatar_url });
      }

      setLoading(false);
    };

    requestPermission();
    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Error', 'Failed to open image picker.');
    }
  };

  const uploadToCloudinary = async (image: any): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      formData.append('upload_preset', 'wayout_unsigned');

      const response = await fetch('https://api.cloudinary.com/v1_1/dlxyg783d/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error('Cloudinary Upload Failed:', data);
        Alert.alert('Upload Error', data.error?.message || 'Could not get image URL.');
        return null;
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      Alert.alert('Upload Failed', 'Could not upload image to Cloudinary.');
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    let avatar_url = profile?.avatar_url;

    if (image?.uri && image.uri !== profile?.avatar_url) {
      const uploadedUrl = await uploadToCloudinary(image);
      if (uploadedUrl) avatar_url = uploadedUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name, phone, avatar_url })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Profile</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <View style={styles.avatarBorder}>
              {image?.uri ? (
                <Image source={{ uri: image.uri }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholderCircle}>
                  <Text style={styles.imageText}>Pick Image</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    marginBottom: 24,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 60,
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#007AFF',
    fontFamily: 'Inter-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  cancelText: {
    marginTop: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
