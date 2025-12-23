import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import WalletScreen from './screens/WalletScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Wallet: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Very simple local check, you can later sync with your web authService logic
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('afta_mobile_user') : null;
    setIsLoggedIn(!!stored);
    setIsCheckingSession(false);
  }, []);

  if (isCheckingSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#00843D" />
        <Text style={{ marginTop: 12, color: '#4b5563', fontWeight: '600' }}>Loading Afta / አፍታ…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f9fafb' }
        }}
        initialRouteName={isLoggedIn ? 'Home' : 'Auth'}
      >
        <Stack.Screen name="Auth">
          {(props) => <AuthScreen {...props} onLoggedIn={() => setIsLoggedIn(true)} />}
        </Stack.Screen>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;


