import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Step 3: Define Status States
type StatusType = 'pending' | 'approved' | 'rejected';

export default function PendingScreen() {
  const [status, setStatus] = useState<StatusType>('pending');
  const router = useRouter();

  /**
   * Step 5: Dummy Simulation
   * Simulate a backend response randomly flipping the status after 3 seconds.
   */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (status === 'pending') {
      timeout = setTimeout(() => {
        // 50% chance of approval vs rejection using Math.random()
        const random = Math.random();
        const nextStatus = random > 0.5 ? 'approved' : 'rejected';
        setStatus(nextStatus);
      }, 3500); // Wait 3.5 seconds
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status]);

  /**
   * Step 6: Navigation Logic
   * Whenever status updates to approved/rejected, route the user accordingly.
   */
  useEffect(() => {
    // Adding a small visual delay so the user can actually read the "Approved/Rejected" screen
    // before the router violently yanks them away.
    if (status === 'approved') {
      const t = setTimeout(() => router.replace('/home'), 1500);
      return () => clearTimeout(t);
    } else if (status === 'rejected') {
      const t = setTimeout(() => router.replace('/register'), 1500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  /**
   * Step 4: Dynamic UI Based on Status
   * Extracted into a helper for clean React render output
   */
  const getStatusContent = () => {
    switch (status) {
      case 'approved':
        return {
          title: 'Approved',
          subtext: 'You can now access the app',
          color: '#4CAF50', // Step 7: Green
        };
      case 'rejected':
        return {
          title: 'Rejected',
          subtext: 'Please register again',
          color: '#F44336', // Step 7: Red
        };
      case 'pending':
      default:
        return {
          title: 'Pending',
          subtext: 'Waiting for admin approval...',
          color: '#FFB300', // Step 7: Yellow
        };
    }
  };

  const content = getStatusContent();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Step 2: Centered Layout */}
      <View style={styles.container}>
        
        <View style={styles.contentContainer}>
          {/* Step 7: Activity Indicator for pending status */}
          {status === 'pending' && (
            <ActivityIndicator size="large" color={content.color} style={styles.spinner} />
          )}

          <Text style={[styles.title, { color: content.color }]}>{content.title}</Text>
          <Text style={styles.subtext}>{content.subtext}</Text>
        </View>

        {/* Step 8: Optional Buttons (for manual testing) */}
        <View style={styles.buttonContainer}>
          <Text style={styles.testModeText}>Testing Panel</Text>
          
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#FFB300' }]} 
              onPress={() => setStatus('pending')}
              activeOpacity={0.8}
            >
              <Text style={styles.testButtonText}>Set Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#4CAF50' }]} 
              onPress={() => setStatus('approved')}
              activeOpacity={0.8}
            >
              <Text style={styles.testButtonText}>Set Approved</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: '#F44336' }]} 
              onPress={() => setStatus('rejected')}
              activeOpacity={0.8}
            >
              <Text style={styles.testButtonText}>Set Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Step 9: Proper Styling
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center',     // Centers content horizontally
  },
  spinner: {
    marginBottom: 24,
    transform: [{ scale: 1.3 }], // Slight pop in size
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    paddingTop: 30,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  testModeText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12, // Native spacing for react-native
  },
  testButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
