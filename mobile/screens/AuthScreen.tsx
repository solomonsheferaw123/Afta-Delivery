import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { login } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'> & {
  onLoggedIn: () => void;
};

const AuthScreen: React.FC<Props> = ({ navigation, onLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success && res.user) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('afta_mobile_user', JSON.stringify(res.user));
        }
        onLoggedIn();
        navigation.replace('Home');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Afta / አፍታ</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00843D',
    marginBottom: 4
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 12
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
  },
  error: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 12
  }
});

export default AuthScreen;


