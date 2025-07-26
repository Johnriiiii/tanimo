// 🌐 React & React Native core
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// 🧭 Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 🎨 UI & Themes
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

// 🔔 Toast messages
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toast';

// 🔐 Auth Pages
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

// 👨‍🌾 Farmer Pages
import Home from './Pages/farmerPages/farmerHome';
import CustomDrawer from './Pages/farmerPages/farmerCustomDrawer';
import MapScreen from './Pages/farmerPages/weatherMap';
import WeatherScreen from './Pages/farmerPages/weather';
import AIChatbot from './Pages/farmerPages/aiAssistant';
import PlantHealthScreen from './Pages/farmerPages/imageprocessing';
import SellVegetable from './Pages/farmerPages/plantManagement';
import VegetableManagement from './Pages/farmerPages/managePlant';
import Orders from './Pages/farmerPages/Orders';

// 🧑‍🌾 Vendor Pages
import VendorHomepage from './Pages/vendorPages/vendorHome';
import BrowseVegetables from './Pages/vendorPages/BrowseVegetables';
import OrderDetails from './Pages/vendorPages/OrderDetails';
import VendorOrders from './Pages/vendorPages/VendorOrders';
import TrackDelivery from './Pages/vendorPages/DeliveryTracking';
import DeliveryList from './Pages/vendorPages/DeliveryList';
import GardenersScreen from './Pages/vendorPages/gardenerScreen';

// 🌱 Shared Pages
import PlantLibrary from './Pages/PlantLibrary';
import AboutUsScreen from './Pages/aboutus';

const Stack = createStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#f6f6f6',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login">
          {/* 🔐 Authentication Screens */}
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />

          {/* 👨‍🌾 Farmer Screens */}
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="weathermap" component={MapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="weather" component={WeatherScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AiChatBot" component={AIChatbot} options={{ headerShown: false }} />
          <Stack.Screen name="imageProcessing" component={PlantHealthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="plantManagement" component={SellVegetable} options={{ headerShown: false }} />
          <Stack.Screen name="managePlant" component={VegetableManagement} options={{ headerShown: false }} />
          <Stack.Screen name="Orders" component={Orders} options={{ headerShown: true, title: 'View Inquiries/Orders' }} />

          {/* 🧑‍🌾 Vendor Screens */}
          <Stack.Screen name="VendorHome" component={VendorHomepage} options={{ headerShown: false }} />
          <Stack.Screen name="BrowseVegetables" component={BrowseVegetables} options={{ headerShown: true, title: 'Browse Vegetables' }} />
          <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: true, title: 'Order Details' }} />
          <Stack.Screen name="VendorOrders" component={VendorOrders} options={{ headerShown: true, title: 'Orders' }} />
          <Stack.Screen name="DeliveryList" component={DeliveryList} options={{ headerShown: true, title: 'Deliveries' }} />
          <Stack.Screen name="TrackDelivery" component={TrackDelivery} options={{ headerShown: true, title: 'Track Delivery' }} />
          <Stack.Screen name="GardenersScreen" component={GardenersScreen} options={{ headerShown: true, title: 'Gardener Screen' }} />

          {/* 🌱 Shared */}
          <Stack.Screen name="PlantLibrary" component={PlantLibrary} options={{ headerShown: true, title: 'Plant Library' }} />
          <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ headerShown: true, title: 'About Us' }} />
        </Stack.Navigator>
      </NavigationContainer>

      <Toast 
        config={toastConfig}
        position="top"
        topOffset={50}
        visibilityTime={3000}
        autoHide={true}
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
