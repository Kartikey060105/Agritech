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

export default function CenterDashboard({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeBids: 0,
    acceptedBids: 0,
    totalEarnings: 0,
    recentBids: [],
    bidTrends: [],
    successRate: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          order:orders(
            quantity,
            region,
            loading_date,
            buyer:buyers(full_name)
          )
        `)
        .eq('collection_center_id', user.id)
        .order('created_at', { ascending: false });

      if (bidsError) throw bidsError;

      // Calculate statistics
      const activeBids = bids.filter(bid => bid.status === 'pending').length;
      const acceptedBids = bids.filter(bid => bid.status === 'accepted').length;
      const totalEarnings = bids
        .filter(bid => bid.status === 'accepted')
        .reduce((sum, bid) => sum + parseFloat(bid.price), 0);
      const successRate = (acceptedBids / bids.length) * 100 || 0;

      // Get recent bids
      const recentBids = bids.slice(0, 5);

      // Calculate bid trends
      const bidTrends = calculateBidTrends(bids);

      setStats({
        activeBids,
        acceptedBids,
        totalEarnings,
        recentBids,
        bidTrends,
        successRate,
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
          <Icon name="activity" type="feather" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.activeBids}</Text>
          <Text style={styles.statLabel}>Active Bids</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <Icon name="check-circle" type="feather" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.acceptedBids}</Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </Card>

        <Card containerStyle={styles.statCard}>
          <Icon name="trending-up" type="feather" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>
            {stats.successRate.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </Card>
      </View>

      <Card containerStyle={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsTitle}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>
            ₹{stats.totalEarnings.toLocaleString()}
          </Text>
        </View>
      </Card>

      <Card containerStyle={styles.chartCard}>
        <Card.Title>Bid Trends</Card.Title>
        <LineChart
          data={{
            labels: stats.bidTrends.map(item => item.month),
            datasets: [{
              data: stats.bidTrends.map(item => item.count),
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

      <Card containerStyle={styles.bidsCard}>
        <Card.Title>Recent Bids</Card.Title>
        {stats.recentBids.map((bid, index) => (
          <ListItem
            key={index}
            bottomDivider
            onPress={() => navigation.navigate('BidDetails', { bid })}
          >
            <Icon name="tag" type="feather" color="#666" />
            <ListItem.Content>
              <ListItem.Title>₹{bid.price} per kg</ListItem.Title>
              <ListItem.Subtitle>
                {bid.order.quantity}kg • {bid.order.region}
              </ListItem.Subtitle>
            </ListItem.Content>
            <View style={styles.bidStatus}>
              <Text style={[
                styles.statusText,
                { color: getBidStatusColor(bid.status) }
              ]}>
                {bid.status.toUpperCase()}
              </Text>
              <ListItem.Chevron />
            </View>
          </ListItem>
        ))}
      </Card>

      <CustomButton
        title="View Available Orders"
        onPress={() => navigation.navigate('AvailableOrders')}
        icon={<Icon name="list" type="feather" size={20} color="white" style={{ marginRight: 10 }} />}
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
  earningsCard: {
    margin: 10,
    padding: 20,
  },
  earningsHeader: {
    alignItems: 'center',
  },
  earningsTitle: {
    fontSize: 16,
    color: '#666',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 5,
  },
  chartCard: {
    margin: 10,
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  bidsCard: {
    margin: 10,
  },
  bidStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    margin: 15,
    marginBottom: 30,
  },
});

function calculateBidTrends(bids) {
  const months = {};
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'short' });
  }).reverse();

  last6Months.forEach(month => {
    months[month] = 0;
  });

  bids.forEach(bid => {
    const month = new Date(bid.created_at).toLocaleString('default', { month: 'short' });
    if (months[month] !== undefined) {
      months[month]++;
    }
  });

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

function getBidStatusColor(status) {
  switch (status) {
    case 'pending':
      return '#FFC107';
    case 'accepted':
      return '#4CAF50';
    case 'rejected':
      return '#F44336';
    default:
      return '#666';
  }
} 