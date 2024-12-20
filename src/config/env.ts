import Constants from 'expo-constants';

const ENV = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl ?? '',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey ?? '',
  apiUrl: Constants.expoConfig?.extra?.apiUrl ?? '',
};

export default ENV; 