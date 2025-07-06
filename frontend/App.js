import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toast';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Home from './Pages/farmerPages/farmerHome';
import CustomDrawer from './Pages/farmerPages/farmerCustomDrawer';
import PlantLibrary from './Pages/PlantLibrary';
import VendorHomepage from './Pages/vendorPages/vendorHome';
import MapScreen from './Pages/farmerPages/weatherMap';
import WeatherScreen from './Pages/farmerPages/weather';
import AIChatbot from './Pages/farmerPages/aiAssistant';
import PlantHealthScreen from './Pages/farmerPages/imageprocessing';
import SellVegetable from './Pages/farmerPages/plantManagement';
import VegetableManagement from './Pages/farmerPages/managePlant';
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
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={Register} 
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="Home" 
            component={Home} 
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="VendorHome" 
            component={VendorHomepage} 
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="weathermap" 
            component={MapScreen} 
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="weather" 
            component={WeatherScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AiChatBot" 
            component={AIChatbot} a
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="imageProcessing" 
            component={PlantHealthScreen} a
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="plantManagement" 
            component={SellVegetable} a
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="managePlant" 
            component={VegetableManagement} a
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="PlantLibrary" component={PlantLibrary} />
          
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