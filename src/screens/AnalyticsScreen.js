import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Icon,
} from 'react-native-elements';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState({
    totalBids: 0,
    activeCenters: 0,
    activeBuyers: 0,
    orderStats: {
      pending: 0,
      active: 0,
      completed: 0,
    },
    regionalData: [],
    monthlyOrders: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch total bids
      const { count: bidsCount } = await supabase
        .from('bids')
        .select('*', { count: 'exact' });

      // Fetch active collection centers
      const { count: centersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('user_type', 'collection_center')
        .eq('status', 'active');

      // Fetch active buyers
      const { count: buyersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('user_type', 'buyer')
        .eq('status', 'active');

      // Fetch order statistics
      const { data: orderStats } = await supabase
        .from('orders')
        .select('status')
        .then(({ data }) => {
          return {
            pending: data.filter(order => order.status === 'pending').length,
            active: data.filter(order => order.status === 'active').length,
            completed: data.filter(order => order.status === 'completed').length,
          };
        });

      // Fetch regional distribution
      const { data: regionalData } = await supabase
        .from('orders')
        .select('region')
        .then(({ data }) => {
          const regions = {};
          data.forEach(order => {
            regions[order.region] = (regions[order.region] || 0) + 1;
          });
          return Object.entries(regions).map(([name, count]) => ({
            name,
            count,
          }));
        });

      // Fetch monthly orders
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('created_at')
        .then(({ data }) => {
          const months = {};
          data.forEach(order => {
            const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
            months[month] = (months[month] || 0) + 1;
          });
          return Object.entries(months).map(([month, count]) => ({
            month,
            count,
          }));
        });

      setAnalytics({
        totalBids: bidsCount,
        activeCenters: centersCount,
        activeBuyers: buyersCount,
        orderStats,
        regionalData,
        monthlyOrders,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <Card containerStyle={styles.card}>
          <Icon name="trending-up" type="feather" color="#2196F3" />
          <Text style={styles.cardTitle}>Total Bids</Text>
          <Text style={styles.cardValue}>{analytics.totalBids}</Text>
        </Card>

        <Card containerStyle={styles.card}>
          <Icon name="users" type="feather" color="#4CAF50" />
          <Text style={styles.cardTitle}>Active Centers</Text>
          <Text style={styles.cardValue}>{analytics.activeCenters}</Text>
        </Card>

        <Card containerStyle={styles.card}>
          <Icon name="shopping-bag" type="feather" color="#9C27B0" />
          <Text style={styles.cardTitle}>Active Buyers</Text>
          <Text style={styles.cardValue}>{analytics.activeBuyers}</Text>
        </Card>
      </View>

      {/* Order Status Chart */}
      <Card>
        <Card.Title>Order Status Distribution</Card.Title>
        <PieChart
          data={[
            {
              name: 'Pending',
              population: analytics.orderStats.pending,
              color: '#FFC107',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Active',
              population: analytics.orderStats.active,
              color: '#2196F3',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Completed',
              population: analytics.orderStats.completed,
              color: '#4CAF50',
              legendFontColor: '#7F7F7F',
            },
          ]}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </Card>

      {/* Regional Distribution */}
      <Card>
        <Card.Title>Regional Distribution</Card.Title>
        <BarChart
          data={{
            labels: analytics.regionalData.map(item => item.name),
            datasets: [{
              data: analytics.regionalData.map(item => item.count),
            }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </Card>

      {/* Monthly Orders Trend */}
      <Card>
        <Card.Title>Monthly Orders Trend</Card.Title>
        <LineChart
          data={{
            labels: analytics.monthlyOrders.map(item => item.month),
            datasets: [{
              data: analytics.monthlyOrders.map(item => item.count),
            }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
}); 