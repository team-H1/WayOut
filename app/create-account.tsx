import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library.');
      }
    })();
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
    } catch (err) {
      console.error('Image Picker Error:', err);
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
      return data.secure_url || null;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      Alert.alert('Upload Failed', 'Could not upload image to Cloudinary.');
      return null;
    }
  };

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    if (!image?.uri) {
      Alert.alert('Profile Required', 'Please select a profile picture.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      Alert.alert('Signup Failed', signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      Alert.alert('Signup Failed', 'User ID not returned.');
      return;
    }

    const avatarUrl = await uploadToCloudinary(image);
    if (!avatarUrl) return;

    const { error: profileError } = await supabase.from('profiles').insert([
      { id: userId, name, phone, avatar_url: avatarUrl },
    ]);

    if (profileError) {
      Alert.alert('Profile Save Failed', profileError.message);
      return;
    }

    Alert.alert('Success', 'Account created! Check your email to verify.');
    router.replace('/login');
  };

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>Create Your Account</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderCircle}>
                <Text style={styles.imageText}>Add Profile Photo</Text>
              </View>
            )}
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
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0e8ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fbff',
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  link: {
    marginTop: 24,
    color: '#007AFF',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  placeholderCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#d0e8ff',
    borderWidth: 1,
  },
  imageText: {
    color: '#007AFF',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
