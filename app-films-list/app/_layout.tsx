import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Lista de Filmes" }} />
      <Stack.Screen name="explore" options={{ title: "Detalhes" }} />
    </Stack>
  );
}
