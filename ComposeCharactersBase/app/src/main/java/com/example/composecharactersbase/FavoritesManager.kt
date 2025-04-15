package com.example.composecharactersbase

import android.content.Context
import android.content.SharedPreferences

class FavoritesManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("favorites_prefs", Context.MODE_PRIVATE)

    fun saveFavorite(name: String) {
        val favorites = getFavorites().toMutableSet()
        favorites.add(name)
        prefs.edit().putStringSet("favorites", favorites).apply()
    }

    fun removeFavorite(name: String) {
        val favorites = getFavorites().toMutableSet()
        favorites.remove(name)
        prefs.edit().putStringSet("favorites", favorites).apply()
    }

    fun isFavorite(name: String): Boolean {
        return getFavorites().contains(name)
    }

    fun getFavorites(): Set<String> {
        return prefs.getStringSet("favorites", emptySet()) ?: emptySet()
    }
}
