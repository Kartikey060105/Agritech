import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Layout } from '../../components/ui/Layout';
import { GradientCard } from '../../components/ui/GradientCard';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

const REGIONS = [
  'North India',
  'South India',
  'East India',
  'West India',
  'Central India',
  'Northeast India',
];

const QUALITY_PARAMETERS = [
  'Moisture Content',
  'Foreign Matter',
  'Damaged Grains',
  'Weevilled Grains',
  'Organic Certification',
];

export default function PlaceOrderScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    qualityParameters: {},
    region: REGIONS[0],
    loadingDate: new Date(),
    deliveryLocation: '',
    additionalNotes: '',
  });
  const { theme, isDark } = useTheme();

  const handleQualityChange = (parameter, value) => {
    setFormData(prev => ({
      ...prev,
      qualityParameters: {
        ...prev.qualityParameters,
        [parameter]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validate form data
    if (!formData.quantity || !formData.deliveryLocation) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          quantity: parseInt(formData.quantity),
          quality_parameters: JSON.stringify(formData.qualityParameters),
          region: formData.region,
          loading_date: formData.loadingDate.toISOString(),
          delivery_location: formData.deliveryLocation,
          additional_notes: formData.additionalNotes,
          status: 'active',
        }]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Order placed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <LinearGradient
        colors={[theme.colors.background, isDark ? '#004D4010' : '#B9F6CA10']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Place Order
        </Text>
        <ThemeToggle />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GradientCard style={styles.card} intensity="light">
          <Input
            label="Quantity (kg) *"
            placeholder="Enter quantity"
            keyboardType="numeric"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            icon={<Icon name="package" type="feather" size={20} color="#666" />}
          />

          <Input
            label="Delivery Location *"
            placeholder="Enter complete delivery address"
            multiline
            numberOfLines={3}
            value={formData.deliveryLocation}
            onChangeText={(text) => setFormData({ ...formData, deliveryLocation: text })}
            icon={<Icon name="map-pin" type="feather" size={20} color="#666" />}
          />

          <Input
            label="Additional Notes"
            placeholder="Any specific requirements or notes"
            multiline
            numberOfLines={3}
            value={formData.additionalNotes}
            onChangeText={(text) => setFormData({ ...formData, additionalNotes: text })}
            icon={<Icon name="file-text" type="feather" size={20} color="#666" />}
          />

          <GradientButton
            title="Place Order"
            onPress={handleSubmit}
            loading={loading}
            size="large"
            icon={<Icon name="check" type="feather" size={20} color="white" />}
          />

          <GradientButton
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            icon={<Icon name="x" type="feather" size={20} color="#00E676" />}
          />
        </GradientCard>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  cancelButton: {
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
  },
}); 