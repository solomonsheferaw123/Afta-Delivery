import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { getDashboard } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getDashboard();
      if (data) {
        setServices(data.services || []);
        setPartners(data.partners || []);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Afta / አፍታ</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.walletLink}>Wallet</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Services</Text>
      <FlatList
        horizontal
        data={services}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceSubtitle}>{item.description}</Text>
          </View>
        )}
        style={{ marginBottom: 16 }}
      />

      <Text style={styles.sectionTitle}>Popular Partners</Text>
      <FlatList
        data={partners}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.partnerCard}>
            <Text style={styles.partnerName}>{item.name}</Text>
            <Text style={styles.partnerMeta}>
              {item.category} • {item.delivery_time || item.deliveryTime}
            </Text>
          </View>
        )}
      />
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
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },
  walletLink: {
    fontWeight: '700',
    color: '#00843D'
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  serviceCard: {
    width: 200,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginRight: 10
  },
  serviceTitle: {
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827'
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280'
  },
  partnerCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8
  },
  partnerName: {
    fontWeight: '700',
    color: '#111827'
  },
  partnerMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  }
});

export default HomeScreen;


