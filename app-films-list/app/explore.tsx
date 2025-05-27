import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface Movie {
  id: number;
  name: string;
  image?: {
    medium?: string;
    original?: string;
  };
  genres?: string[];
  rating?: {
    average?: number;
  };
  summary?: string;
  premiered?: string;
  language?: string;
}

export default function MovieDetailsScreen() {
  const { movie } = useLocalSearchParams();
  const movieData: Movie = JSON.parse(movie as string);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri:
            movieData.image?.original || "https://via.placeholder.com/300x450",
        }}
        style={styles.movieImage}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{movieData.name}</Text>

        {movieData.genres && (
          <Text style={styles.genres}>{movieData.genres.join(" • ")}</Text>
        )}

        <View style={styles.metaContainer}>
          {movieData.rating?.average && (
            <Text style={styles.rating}>
              ⭐ {movieData.rating.average.toFixed(1)}/10
            </Text>
          )}

          {movieData.premiered && (
            <Text style={styles.year}>
              {new Date(movieData.premiered).getFullYear()}
            </Text>
          )}

          {movieData.language && (
            <Text style={styles.language}>{movieData.language}</Text>
          )}
        </View>

        <Text style={styles.summary}>
          {movieData.summary?.replace(/<[^>]+>/g, "") ||
            "No summary available."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  movieImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  genres: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  year: {
    fontSize: 16,
    color: "#666",
  },
  language: {
    fontSize: 16,
    color: "#666",
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
