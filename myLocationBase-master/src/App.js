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
import onpenDB from "../db";

const db = onpenDB();

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false); // variável para controle do darkMode
  const [isLoading, setIsLoading] = useState(false); // variável para controle do loading do button
  const [locations, setLocations] = useState([]); // Variável para armazenar a LISTA de localizações capturadas

  // Carrega tema default da lib RN PAPER com customização das cores. Para customizar o tema, veja:
  // https://callstack.github.io/react-native-paper/docs/guides/theming/#creating-dynamic-theme-colors
  const [theme, setTheme] = useState({
    ...DefaultTheme,
    myOwnProperty: true,
    colors: myColors.colors,
  });

  useEffect(() => {
    const locationRow = db.getAllSync("select * from locations", []);
    console.log(
      "Localizações carregadas do banco de dados:",
      JSON.stringify(locationRow)
    );
  }, []);

  useEffect(() => {
    async function initializeApp() {
      await loadDarkMode(); // Carrega a preferência de tema
      await getAccessLocation(); // Solicita permissão de localização
      // Removido loadLocations() para começar com a lista vazia
    }

    initializeApp();
  }, []);

  // Efetiva a alteração do tema dark/light quando a variável isSwitchOn é alterada
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
  }, [isSwitchOn]); // Dependência: executa quando isSwitchOn muda

  // load darkMode from AsyncStorage
  async function loadDarkMode() {
    try {
      const storageValue = await AsyncStorage.getItem("@darkMode");
      if (storageValue === "true") {
        setIsSwitchOn(true);
      } else {
        setIsSwitchOn(false);
      }
      console.log(`Dark Mode loaded: ${storageValue}`);
    } catch (error) {
      console.error("Erro ao carregar preferência de tema:", error);
    }
  }

  // Solicita permissão de localização
  async function getAccessLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permissão de acesso à localização negada");
      // Você pode querer definir um estado para mostrar uma mensagem ao usuário
      return false; // Retorna false se a permissão for negada
    }
    return true; // Retorna true se a permissão for concedida
  }

  // get location (bottao capturar localização)
  async function getLocation() {
    setIsLoading(true);

    try {
      const hasPermission = await getAccessLocation(); // Verifica/solicita permissão novamente
      if (!hasPermission) {
        setIsLoading(false);
        return; // Sai da função se não tiver permissão
      }

      let locationObject = await Location.getCurrentPositionAsync({});

      // id único para a nova localização sendo int
      const newLocation = {
        id: Math.floor(Math.random() * 1000000), // Gera um ID aleatório
        latitude: locationObject.coords.latitude,
        longitude: locationObject.coords.longitude,
        timestamp: new Date().toLocaleString("pt-BR"), // Adiciona timestamp em formato BR
      };

      // Salva a nova localização no banco de dados SQLite
      await db.execSync(
        "INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)",
        [
          newLocation.id,
          newLocation.latitude,
          newLocation.longitude,
          new Date().toISOString(), // Armazena o timestamp em formato ISO
        ]
      );
      console.log("Localização salva no banco de dados:", newLocation);

      setLocations([newLocation, ...locations]);

      console.log("Localização capturada:", newLocation);
    } catch (error) {
      console.error("Erro ao obter localização atual:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // darkMode switch event
  async function onToggleSwitch() {
    const newSwitchState = !isSwitchOn;
    setIsSwitchOn(newSwitchState); // Isso irá disparar o useEffect que muda o tema

    const storageValueToSave = newSwitchState ? "true" : "false";

    try {
      await AsyncStorage.setItem("@darkMode", storageValueToSave);
      console.log(`Dark Mode saved: ${storageValueToSave}`);
    } catch (error) {
      console.error(
        `Erro ao tentar salvar preferência de tema do aplicativo: ${error}`
      );
    }
  }

  // load locations from db sqlite - faz a leitura das localizações salvas no banco de dados
  async function loadLocations() {
    setIsLoading(true);

    // TODO: Substituir esta lógica fake pela leitura do seu banco de dados SQLite
    const fetchedLocations = [];
    try {
      const rows = await db.getAll("SELECT * FROM locations", []);
      rows.forEach((row) => {
        fetchedLocations.push({
          id: row.id,
          latitude: row.latitude,
          longitude: row.longitude,
          timestamp: new Date(row.timestamp).toLocaleString("pt-BR"), // Formata o timestamp
        });
      }, []);
      console.log(
        `Localizações carregadas do banco de dados: ${fetchedLocations}`
      );
    } catch (error) {
      console.error("Erro ao carregar localizações do banco de dados:", error);
    }

    setLocations(fetchedLocations);
    setIsLoading(false);
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="My Location BASE" />
      </Appbar.Header>
      {/* Apply background color directly to the outer View to ensure it fills the screen */}
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
          onPress={getLocation} // Chama a função para capturar a localização atual
        >
          Capturar localização
        </Button>

        {/* Removido o List.Item separado para a localização atual */}

        {/* List of saved locations */}
        <FlatList
          style={styles.containerList}
          data={locations} // Usa a lista de localizações capturadas
          keyExtractor={(item) => item.id.toString()} // Chave única para cada item
          renderItem={({ item, index }) => {
            // Verifica se é o último item da lista (o mais recente se adicionado ao final)
            // Se adicionado ao início, verifica se é o primeiro item (index === 0)
            const isLastLocation = index === 0; // Se adicionando ao início da lista

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
            // Componente exibido quando a lista está vazia
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
    flex: 1, // Garante que o container principal ocupe todo o espaço disponível
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
    flex: 1, // Permite que a FlatList ocupe o espaço restante
  },
  currentLocationItem: {
    marginHorizontal: 10, // Margem nas laterais
    marginBottom: 10, // Margem abaixo
    backgroundColor: "rgba(0, 0, 0, 0.05)", // Fundo sutil
    borderRadius: 5,
  },
});
