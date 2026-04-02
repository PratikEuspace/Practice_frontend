import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import ProfileImage from '../../components/ProfileImage';

export default function RegisterScreen() {
  const router = useRouter();

  // State management for input values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State management for inline validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  /**
   * Validate all form fields cleanly
   */
  const validate = () => {
    let isValid = true;
    let newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!name.trim()) {
      newErrors.name = 'Name should not be empty';
      isValid = false;
    }

    if (!email.includes('@')) {
      newErrors.email = 'Email must include "@"';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Confirm password must match password';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Submit handler for the register process
   */
  const handleRegister = async () => {
    if (validate()) {
      // Future Integration:
      // await registerUser({ name, email, password, profileImage })
      
      router.push('/pending'); // Step 4: Fake Navigation
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.headerTitle}>Create Account</Text>

          {/* Top: Profile Image Component (Independent) */}
          <ProfileImage />

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            {/* 1. Name */}
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            {/* 2. Email */}
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* 3. Password */}
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Password (min 6 chars)"
              placeholderTextColor="#999"
              secureTextEntry
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* 4. Confirm Password */}
            <TextInput
              style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              textContentType="oneTimeCode"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Button: "Register" */}
          <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF1F0',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 12,
    marginBottom: 16,
    marginTop: -4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#E91E63', // A modern magenta/rose ideal for Matrimony
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
