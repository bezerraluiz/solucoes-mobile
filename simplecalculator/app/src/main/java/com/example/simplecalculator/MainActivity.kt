package com.example.simplecalculator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CalculatorScreen()
        }
    }
}

@Composable
fun CalculatorScreen() {
    var display by remember { mutableStateOf("0") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Display
        Text(
            text = display,
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.fillMaxWidth(),
            maxLines = 1
        )

        // Botões
        val buttons = listOf(
            listOf("7", "8", "9", "/"),
            listOf("4", "5", "6", "*"),
            listOf("1", "2", "3", "-"),
            listOf("0", "C", "=", "+")
        )

        buttons.forEach { row ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                row.forEach { label ->
                    CalculatorButton(label) {
                        display = when (label) {
                            "C" -> "0"
                            "=" -> evaluateExpression(display)
                            else -> if (display == "0" || display == "Erro") label else display + label
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CalculatorButton(label: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray),
        modifier = Modifier
            .size(80.dp)
            .padding(4.dp)
    ) {
        Text(text = label, fontSize = 32.sp, color = Color.White)
    }
}

// Função de avaliação de expressões simples
fun evaluateExpression(expression: String): String {
    return try {
        val result = simpleEval(expression)
        if (result == result.toInt().toDouble()) result.toInt().toString() else result.toString()
    } catch (e: Exception) {
        "Erro"
    }
}

// Função que avalia a expressão matemática manualmente
fun simpleEval(expression: String): Double {
    val operators = setOf('+', '-', '*', '/')
    val numbers = mutableListOf<Double>()
    val operations = mutableListOf<Char>()
    var currentNumber = ""

    // Divide números e operadores
    for (char in expression) {
        if (char in operators) {
            numbers.add(currentNumber.toDouble())
            currentNumber = ""
            operations.add(char)
        } else {
            currentNumber += char
        }
    }
    numbers.add(currentNumber.toDouble())

    // Executa multiplicações e divisões primeiro
    var i = 0
    while (i < operations.size) {
        if (operations[i] == '*' || operations[i] == '/') {
            val result = if (operations[i] == '*') numbers[i] * numbers[i + 1] else numbers[i] / numbers[i + 1]
            numbers[i] = result
            numbers.removeAt(i + 1)
            operations.removeAt(i)
        } else {
            i++
        }
    }

    // Executa somas e subtrações
    var result = numbers[0]
    for (j in operations.indices) {
        result = if (operations[j] == '+') result + numbers[j + 1] else result - numbers[j + 1]
    }

    return result
}
