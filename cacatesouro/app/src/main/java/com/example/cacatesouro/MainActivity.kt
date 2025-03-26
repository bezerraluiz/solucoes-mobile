package com.example.cacatesouro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TreasureHuntApp()
        }
    }
}

@Composable
fun TreasureHuntApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") { HomeScreen(navController) }
        composable("clue1") { ClueScreen(navController, "Sou alto como uma árvore, mas não tenho folhas. Quem sou eu?", "Prédio", "clue2") }
        composable("clue2") { ClueScreen(navController, "Tenho chaves, mas não abro portas. Quem sou eu?", "Teclado", "clue3") }
        composable("clue3") { ClueScreen(navController, "Ando em círculos, mas sempre avanço. Quem sou eu?", "Relógio", "treasure") }
        composable("treasure") { TreasureScreen(navController) }
    }
}

@Composable
fun HomeScreen(navController: NavHostController) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Bem-vindo à Caça ao Tesouro!", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { navController.navigate("clue1") }) {
            Text("Iniciar Caça ao Tesouro")
        }
    }
}

@Composable
fun ClueScreen(navController: NavHostController, clue: String, answer: String, nextRoute: String) {
    var userAnswer by remember { mutableStateOf(TextFieldValue()) }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(clue, style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(16.dp))
        TextField(
            value = userAnswer,
            onValueChange = { userAnswer = it },
            label = { Text("Sua resposta") }
        )
        Spacer(modifier = Modifier.height(16.dp))
        Row {
            Button(onClick = { navController.popBackStack() }) {
                Text("Voltar")
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(onClick = {
                if (userAnswer.text.trim().lowercase() == answer.trim().lowercase()) {
                    navController.navigate(nextRoute)
                }
            }) {
                Text("Próxima Pista")
            }
        }
    }
}

@Composable
fun TreasureScreen(navController: NavHostController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            modifier = Modifier.padding(24.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "🎉 Parabéns! Você encontrou o tesouro! 🎉",
                    style = MaterialTheme.typography.headlineLarge,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Você completou a caça ao tesouro com sucesso!",
                    style = MaterialTheme.typography.bodyLarge
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        navController.navigate("home") {
                            popUpTo(navController.graph.startDestinationId) {
                                inclusive = true
                            }
                            launchSingleTop = true
                        }
                    },
                    modifier = Modifier.padding(8.dp)
                ) {
                    Text("🔄 Recomeçar Aventura")
                }
            }
        }
    }
}
