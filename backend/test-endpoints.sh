#!/bin/bash

# Script para probar los endpoints de la API
# Asegúrate de que el servidor esté corriendo con: npm run dev

BASE_URL="http://localhost:3000/api"

echo "🧪 Probando API de Market Data"
echo "================================"
echo ""

echo "1️⃣ GET /api/assets - Listar todos los activos"
echo "-------------------------------------------"
curl -s "$BASE_URL/assets" | jq . 2>/dev/null || curl -s "$BASE_URL/assets"
echo ""
echo ""

echo "2️⃣ GET /api/assets/AAPL/history - Histórico de Apple"
echo "---------------------------------------------------"
curl -s "$BASE_URL/assets/AAPL/history" | jq . 2>/dev/null || curl -s "$BASE_URL/assets/AAPL/history"
echo ""
echo ""

echo "3️⃣ GET /api/assets/GOOGL/history - Histórico de Google"
echo "----------------------------------------------------"
curl -s "$BASE_URL/assets/GOOGL/history" | jq . 2>/dev/null || curl -s "$BASE_URL/assets/GOOGL/history"
echo ""
echo ""

echo "4️⃣ GET /api/assets/BTC/history - Histórico de Bitcoin"
echo "----------------------------------------------------"
curl -s "$BASE_URL/assets/BTC/history" | jq . 2>/dev/null || curl -s "$BASE_URL/assets/BTC/history"
echo ""
echo ""

echo "5️⃣ GET /api/assets/INVALID/history - Símbolo inválido (debe dar 404)"
echo "---------------------------------------------------------------------"
curl -s "$BASE_URL/assets/INVALID/history" | jq . 2>/dev/null || curl -s "$BASE_URL/assets/INVALID/history"
echo ""
echo ""

echo "✅ Pruebas completadas"
