import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
}

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("https://api.tvmaze.com/shows");
      setMovies(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to load movies. Please try again later.");
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() =>
        router.push({
          pathname: "/explore",
          params: {
            movie: JSON.stringify(item),
            title: item.name,
          },
        })
      }
    >
      <Image
        source={{
          uri: item.image?.medium || "https://via.placeholder.com/100x150",
        }}
        style={styles.movieImage}
      />
      <Text style={styles.movieTitle} numberOfLines={1}>
        {item.name}
      </Text>
      {item.rating?.average && (
        <Text style={styles.movieRating}>
          ⭐ {item.rating.average.toFixed(1)}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMovies();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No movies found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  movieItem: {
    width: "48%",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  movieImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  movieTitle: {
    padding: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  movieRating: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    fontSize: 12,
    color: "#FFD700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
