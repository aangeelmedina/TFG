#!/bin/sh
set -e

echo "⏳ Esperando a que MySQL esté listo..."

# Espera activa hasta que MySQL acepte conexiones
until python -c "
import pymysql, os, time
try:
    pymysql.connect(
        host='mysql',
        user='root',
        password='root_secret',
        database='tfg_db',
        connect_timeout=3
    )
except Exception as e:
    raise SystemExit(1)
" 2>/dev/null; do
  echo "   MySQL no disponible aún, reintentando en 2s..."
  sleep 2
done

echo "✅ MySQL disponible"

echo "🌱 Ejecutando seed..."
python seed.py

echo "🚀 Arrancando Flask..."
exec python mainController.py