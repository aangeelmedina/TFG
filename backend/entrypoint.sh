#!/bin/sh
set -e

echo "⏳ Esperando a que la base de datos esté lista..."

MAX_RETRIES=30
RETRIES=0

until python -c "
import pymysql, os
from urllib.parse import urlparse

db_url = os.getenv('DATABASE_URL', '')
if not db_url:
    raise SystemExit(0)

db_url_clean = db_url.replace('mysql+pymysql://', 'mysql://', 1)
url = urlparse(db_url_clean)
host     = url.hostname
port     = int(url.port or 3306)
user     = url.username
password = url.password
database = url.path.lstrip('/')

try:
    conn = pymysql.connect(host=host, user=user, password=password,
                           port=port, connect_timeout=3)
    conn.cursor().execute(f'CREATE DATABASE IF NOT EXISTS \`{database}\`')
    conn.close()
except Exception:
    raise SystemExit(1)
" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "⚠️  Base de datos no disponible tras ${MAX_RETRIES} intentos — arrancando igualmente"
    break
  fi
  echo "   Base de datos no disponible aún, reintentando en 2s... (${RETRIES}/${MAX_RETRIES})"
  sleep 2
done

echo "✅ Base de datos disponible"

echo "🌱 Ejecutando seed..."
python seed.py

echo "🚀 Arrancando gunicorn..."
exec gunicorn -w 4 -b 0.0.0.0:${PORT:-5000} mainController:app