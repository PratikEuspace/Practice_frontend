import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileImage from '../../components/ProfileImage';
import { getUserData, saveUserData, UserData } from '../../services/storage';
import { pickImage } from '../../utils/imagePicker';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // --- Screen State ---
  const [userData, setUserData] = useState<UserData>({
    username: 'Guest User',
    password: '',
  });

  // --- Modals State ---
  const [isUsernameModalVisible, setUsernameModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // --- Form State ---
  const [tempUsername, setTempUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    if (data) {
      setUserData({
        username: data.username || 'Guest User',
        password: data.password || '',
      });
    }
  };

  /**
   * Unified persistence abstraction
   */
  const updateDataAndSave = async (newData: Partial<UserData>, successMessage: string) => {
    const updatedUser = { ...userData, ...newData };
    setUserData(updatedUser); // Update UI instantly
    
    const isSaved = await saveUserData(updatedUser);
    if (isSaved) {
      Alert.alert('Success', successMessage);
    } else {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  /**
   * Username update logic
   */
  const handleUpdateUsername = () => {
    if (!tempUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    updateDataAndSave({ username: tempUsername }, 'Username updated successfully!');
    setUsernameModalVisible(false);
  };

  /**
   * Profile photo update logic
   */
  const handleUpdatePhoto = () => {
    Alert.alert('Tip', 'Tap directly on your avatar above to instantly update your profile photo!');
  };

  /**
   * Password update logic (Demo)
   */
  const handleUpdatePassword = () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    updateDataAndSave({ password: newPassword }, 'Password updated securely!');
    setPasswordModalVisible(false);
    setNewPassword('');       // Reset temp fields
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Row for Logout */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/register')} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#E91E63" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Step 1: Top Section */}
        <ProfileImage />
        <Text style={styles.usernameHeader}>{userData.username}</Text>

        {/* Step 2: Options Section */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {/* Option: Change Username */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              setTempUsername(userData.username); // Pre-fill with current username
              setUsernameModalVisible(true);
            }}
          >
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.optionText}>Change Username</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Option: Change Profile Photo */}
          <TouchableOpacity style={styles.optionCard} onPress={handleUpdatePhoto}>
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="image-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.optionText}>Change Profile Photo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Option: Change Password */}
          <TouchableOpacity
            style={[styles.optionCard, { borderBottomWidth: 0 }]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.optionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Step 3: Change Username Modal --- */}
      <Modal visible={isUsernameModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Username</Text>
            <TextInput
              style={styles.modalInput}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Enter new username"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setUsernameModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateUsername}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- Step 5: Change Password Modal --- */}
      <Modal visible={isPasswordModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Password</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password (min 6 chars)"
              secureTextEntry
              textContentType="oneTimeCode"
            />
            
            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              textContentType="oneTimeCode"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#E91E63',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  usernameHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, // For Android
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  modalButtonSave: {
    backgroundColor: '#E91E63',
    marginLeft: 8,
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
