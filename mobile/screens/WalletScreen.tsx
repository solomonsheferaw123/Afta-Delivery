import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Linking } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { initChapaTopUp } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    const userRaw = typeof window !== 'undefined' ? window.localStorage.getItem('afta_mobile_user') : null;
    if (!userRaw) {
      alert('Please sign in again.');
      navigation.replace('Auth');
      return;
    }
    const user = JSON.parse(userRaw);

    setLoading(true);
    try {
      const res = await initChapaTopUp({
        userId: Number(user.id),
        amount: Number(amount),
        fullName: user.full_name,
        email: user.email
      });
      if (res.success && res.checkout_url) {
        Linking.openURL(res.checkout_url);
      } else {
        alert(res.error || 'Failed to start payment');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Afta Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Amount (ETB)</Text>
        <TextInput
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleTopUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Redirecting…' : 'Top up with Chapa'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  back: {
    color: '#00843D',
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  card: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    marginTop: 20,
    backgroundColor: '#00843D',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});

export default WalletScreen;


