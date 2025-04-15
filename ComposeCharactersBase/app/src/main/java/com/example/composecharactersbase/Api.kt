package com.example.composecharactersbase

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path

class Api {
 }

data class Pokemon(
    val name: String,
    val species: Species,
    val types: List<TypeSlot>,
    val weight: Int
)

data class Species(
    val name: String,
    val url: String
)

data class TypeSlot(
    val type: Type
)

data class Type(
    val name: String
)

interface ApiService {
    @GET("pokemon/{name}")
    suspend fun getPokemon(@Path("name") name: String): Pokemon
}

object PokeApiClient {
    private const val BASE_URL = "https://pokeapi.co/api/v2/"

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

