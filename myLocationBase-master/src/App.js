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

const db = openDB();

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
      const permissionGranted = await getAccessLocation();
      await loadLocations();
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
    } catch (error) {
      console.error("Erro ao carregar modo escuro do AsyncStorage:", error);
    }
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
    try {
      const hasPermission = await getAccessLocation();
      if (!hasPermission) {
        Alert.alert(
          // Exemplo de feedback ao usuário
          "Permissão Necessária",
          "A permissão de acesso à localização é necessária para capturar as coordenadas."
        );
        setIsLoading(false);
        return;
      }

      let locationObject = await Location.getCurrentPositionAsync({});
      const agora = new Date(); // Pega a data e hora atuais

      // Opções para formatação
      const optionsDate = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        // timeZone: 'America/Sao_Paulo' // Especifique o fuso horário se necessário
      };
      const optionsTime = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Formato 24 horas
        // timeZone: 'America/Sao_Paulo' // Especifique o fuso horário se necessário
      };

      // Formata a data e a hora para o padrão pt-BR
      const dataFormatada = agora.toLocaleDateString("pt-BR", optionsDate); // Ex: "29/05/2025"
      const horaFormatada = agora.toLocaleTimeString("pt-BR", optionsTime); // Ex: "22:47:38"

      // Combina data e hora formatadas
      const timestampEmFormatoBR = `${dataFormatada} ${horaFormatada}`; // Ex: "29/05/2025 22:47:38"

      const newLocationData = {
        latitude: locationObject.coords.latitude,
        longitude: locationObject.coords.longitude,
        timestamp: timestampEmFormatoBR,
      };

      // Usando 'db.runAsync' que é comum para INSERT/UPDATE/DELETE e retorna metadados
      // Adapte se o seu 'db' usa outra nomenclatura (ex: 'executeSqlAsync', etc.)
      const result = await db.runAsync(
        "INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)",
        [
          newLocationData.latitude,
          newLocationData.longitude,
          newLocationData.timestamp,
        ]
      );

      const newId = result.lastInsertRowId; // Obter o ID da linha inserida

      // Atualizar o estado para refletir na UI imediatamente
      const locationToAdd = {
        id: newId,
        ...newLocationData,
      };
      setLocations((prevLocations) => [locationToAdd, ...prevLocations]); // Adiciona no início da lista
    } catch (error) {
      console.error("Erro ao obter ou salvar localização: ", error);
      Alert.alert("Erro", "Não foi possível obter ou salvar a localização.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onToggleSwitch() {
    const newSwitchState = !isSwitchOn;
    setIsSwitchOn(newSwitchState);

    const storageValueToSave = newSwitchState ? "true" : "false";

    try {
      await AsyncStorage.setItem("@darkMode", storageValueToSave);
    } catch (error) {
      console.error("Erro ao salvar modo escuro no AsyncStorage:", error);
    }
  }

  async function loadLocations(database = db) {
    // Pode passar 'db' como parâmetro
    if (!database) {
      console.log("Banco de dados não está pronto para carregar localizações.");
      return;
    }
    setIsLoading(true);
    try {
      // Use getAllAsync para SELECT que retorna múltiplas linhas
      // Adapte se o seu 'db' usa outra nomenclatura
      const allRows = await database.getAllAsync(
        "SELECT * FROM locations ORDER BY id DESC"
      );
      setLocations(allRows || []); // Garante que é um array
    } catch (error) {
      console.error("Erro ao carregar localizações do DB:", error);
      setLocations([]);
      Alert.alert("Erro", "Não foi possível carregar as localizações salvas.");
    } finally {
      setIsLoading(false);
    }
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
