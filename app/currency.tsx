import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { Repeat2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function CurrencyConverterScreen() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  const fetchRates = async (base: string) => {
    try {
      setLoading(true);
      const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
      const data = await res.json();
      setRates({ ...data.rates, [base]: 1 });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return Alert.alert('Invalid', 'Enter a valid amount');
    }
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    if (!fromRate || !toRate) return;

    const result = (numericAmount / fromRate) * toRate;
    setConvertedAmount(result.toFixed(2));
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConvertedAmount(null);
  };

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency]);

  useEffect(() => {
    if (rates[fromCurrency] && rates[toCurrency]) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const currencyOptions = Object.keys(rates).sort();

  const renderCurrencyPicker = (
    selectedCurrency: string,
    onSelect: (val: string) => void,
    visible: boolean,
    setVisible: (v: boolean) => void
  ) => (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
        <View style={styles.modalCard}>
          <FlatList
            data={currencyOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <LinearGradient colors={['#cce6ff', '#eaf4ff', '#ffffff']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#cce6ff" translucent={false} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Currency Converter</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
            />

            <View style={styles.row}>
              <TouchableOpacity style={styles.selectBox} onPress={() => setShowFromModal(true)}>
                <Text style={styles.selectText}>{fromCurrency}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={swapCurrencies} style={styles.swapButton}>
                <Repeat2 size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.selectBox} onPress={() => setShowToModal(true)}>
                <Text style={styles.selectText}>{toCurrency}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.convertButton} onPress={convertCurrency}>
              <Text style={styles.convertButtonText}>Convert</Text>
            </TouchableOpacity>

            {convertedAmount && (
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>
                  {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                </Text>
                <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
              </View>
            )}
          </View>

          {renderCurrencyPicker(fromCurrency, setFromCurrency, showFromModal, setShowFromModal)}
          {renderCurrencyPicker(toCurrency, setToCurrency, showToModal, setShowToModal)}

          {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Inter-Black',
    color: '#0051A8',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0e8ff',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#f9fbff',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  selectBox: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d0e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0051A8',
  },
  swapButton: {
    padding: 12,
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convertButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  convertButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#eef6ff',
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '70%',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});
