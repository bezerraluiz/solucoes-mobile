import { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  List,
  PaperProvider,
  Switch,
  Text,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import myColors from "../assets/colors.json";
import myColorsDark from "../assets/colorsDark.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import openDB from "../db";

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const [theme, setTheme] = useState({
    ...DefaultTheme,
    myOwnProperty: true,
    colors: myColors.colors,
  });

  useEffect(() => {
    async function initializeApp() {
      await loadDarkMode();
      await getAccessLocation();
    }

    initializeApp();
  }, []);

  useEffect(() => {
    if (isSwitchOn) {
      setTheme({
        ...DefaultTheme,
        myOwnProperty: true,
        colors: myColorsDark.colors,
      });
    } else {
      setTheme({
        ...DefaultTheme,
        myOwnProperty: true,
        colors: myColors.colors,
      });
    }
  }, [isSwitchOn]);

  async function loadDarkMode() {
    try {
      const storageValue = await AsyncStorage.getItem("@darkMode");
      if (storageValue === "true") {
        setIsSwitchOn(true);
      } else {
        setIsSwitchOn(false);
      }
    } catch (error) {}
  }

  async function getAccessLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
    return true;
  }

  async function getLocation() {
    setIsLoading(true);

    const db = openDB();

    try {
      const hasPermission = await getAccessLocation();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      let locationObject = await Location.getCurrentPositionAsync({});

      const newLocation = {
        latitude: locationObject.coords.latitude,
        longitude: locationObject.coords.longitude,
      };

      db.withTransactionAsync(async () => {
        await db.execAsync(
          "INSERT INTO locations (latitude, longitude) VALUES (?, ?)",
          [newLocation.latitude, newLocation.longitude]
        );
        await sleep(2000);

        const result = await db.queryAsync("SELECT * FROM locations");
      });
    } catch (error) {} finally {
      setIsLoading(false);
    }
  }

  async function onToggleSwitch() {
    const newSwitchState = !isSwitchOn;
    setIsSwitchOn(newSwitchState);

    const storageValueToSave = newSwitchState ? "true" : "false";

    try {
      await AsyncStorage.setItem("@darkMode", storageValueToSave);
    } catch (error) {}
  }

  async function loadLocations() {
    setIsLoading(true);

    const fetchedLocations = [];

    setLocations(fetchedLocations);
    setIsLoading(false);
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="My Location BASE" />
      </Appbar.Header>
      <View
        style={[
          styles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.containerDarkMode}>
          <Text>Dark Mode</Text>
          <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
        </View>
        <Button
          style={styles.containerButton}
          icon="map"
          mode="contained"
          loading={isLoading}
          onPress={getLocation}
        >
          Capturar localização
        </Button>

        <FlatList
          style={styles.containerList}
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const isLastLocation = index === 0;

            return (
              <List.Item
                title={
                  isLastLocation
                    ? "Localização Atual"
                    : `Localização no tempo: ${item.timestamp}`
                }
                description={`Latitude: ${item.latitude} | Longitude: ${item.longitude}`}
              />
            );
          }}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Nenhuma localização capturada ainda.
            </Text>
          )}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  containerDarkMode: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    margin: 10,
  },
  containerList: {
    margin: 10,
    flex: 1,
  },
  currentLocationItem: {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 5,
  },
});
