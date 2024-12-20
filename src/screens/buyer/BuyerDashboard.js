import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Text, Icon, ListItem } from 'react-native-elements';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/CustomButton';
import LoadingScreen from '../../components/LoadingScreen';

const { width } = Dimensions.get('window');

export default function BuyerDashboard({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalBids: 0,
    completedOrders: 0,
    recentOrders: [],
    orderTrends: [],
    regionDistribution: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          bids (
            id,
            price,
            status
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate statistics
      const activeOrders = orders.filter(order => order.status === 'active').length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const totalBids = orders.reduce((sum, order) => sum + order.bids.length, 0);

      // Get recent orders
      const recentOrders = orders.slice(0, 5).map(order => ({
        ...order,
        bidCount: order.bids.length,
      }));

      // Calculate order trends (last 6 months)
      const orderTrends = calculateOrderTrends(orders);

      // Calculate region distribution
      const regionDistribution = calculateRegionDistribution(orders);

      setStats({
        activeOrders,
        totalBids,
        completedOrders,
        recentOrders,
        orderTrends,
        regionDistribution,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statCard}>
          <Icon name="shopping-bag" type="feather" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.activeOrders}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <Icon name="trending-up" type="feather" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.totalBids}</Text>
          <Text style={styles.statLabel}>Total Bids</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <Icon name="check-circle" type="feather" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>{stats.completedOrders}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
      </View>

      <Card containerStyle={styles.chartCard}>
        <Card.Title>Order Trends</Card.Title>
        <LineChart
          data={{
            labels: stats.orderTrends.map(item => item.month),
            datasets: [{
              data: stats.orderTrends.map(item => item.count),
            }],
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </Card>

      <Card containerStyle={styles.chartCard}>
        <Card.Title>Regional Distribution</Card.Title>
        <PieChart
          data={stats.regionDistribution.map((item, index) => ({
            name: item.region,
            population: item.count,
            color: getColor(index),
            legendFontColor: '#666',
            legendFontSize: 12,
          }))}
          width={width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </Card>

      <Card containerStyle={styles.ordersCard}>
        <Card.Title>Recent Orders</Card.Title>
        {stats.recentOrders.map((order, index) => (
          <ListItem
            key={index}
            bottomDivider
            onPress={() => navigation.navigate('OrderDetails', { order })}
          >
            <Icon name="package" type="feather" color="#666" />
            <ListItem.Content>
              <ListItem.Title>Order #{order.id.slice(0, 8)}</ListItem.Title>
              <ListItem.Subtitle>
                {order.quantity}kg • {order.bidCount} bids
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </Card>

      <CustomButton
        title="Place New Order"
        onPress={() => navigation.navigate('PlaceOrder')}
        icon={<Icon name="plus" type="feather" size={20} color="white" style={{ marginRight: 10 }} />}
        containerStyle={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    margin: 10,
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  ordersCard: {
    margin: 10,
  },
  button: {
    margin: 15,
    marginBottom: 30,
  },
});

function calculateOrderTrends(orders) {
  const months = {};
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'short' });
  }).reverse();

  last6Months.forEach(month => {
    months[month] = 0;
  });

  orders.forEach(order => {
    const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
    if (months[month] !== undefined) {
      months[month]++;
    }
  });

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

function calculateRegionDistribution(orders) {
  const regions = {};
  orders.forEach(order => {
    regions[order.region] = (regions[order.region] || 0) + 1;
  });
  return Object.entries(regions).map(([region, count]) => ({ region, count }));
}

function getColor(index) {
  const colors = [
    '#2196F3',
    '#4CAF50',
    '#FFC107',
    '#9C27B0',
    '#F44336',
    '#00BCD4',
  ];
  return colors[index % colors.length];
} 