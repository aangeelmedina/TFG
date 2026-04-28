#!/bin/sh
set -e

# En Railway la BD es externa; RAILWAY_ENVIRONMENT se inyecta automáticamente.
# En local (Docker Compose) hay que esperar al contenedor mysql.
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
  echo "⏳ Esperando a que MySQL esté listo..."

  until python -c "
import pymysql, os
from urllib.parse import urlparse
raw = os.environ.get('DATABASE_URL', '').replace('mysql+pymysql://', 'mysql://')
u = urlparse(raw)
try:
    pymysql.connect(
        host=u.hostname,
        port=u.port or 3306,
        user=u.username,
        password=u.password,
        database=u.path.lstrip('/'),
        connect_timeout=3
    )
except Exception:
    raise SystemExit(1)
" 2>/dev/null; do
    echo "   MySQL no disponible aún, reintentando en 2s..."
    sleep 2
  done

  echo "✅ MySQL disponible"
else
  echo "☁️  Railway detectado — omitiendo espera de MySQL"
fi

echo "🌱 Ejecutando seed..."
python seed.py

echo "🚀 Arrancando Gunicorn..."
exec gunicorn mainController:app \
  --bind 0.0.0.0:${PORT:-5000} \
  --workers ${GUNICORN_WORKERS:-2} \
  --timeout 120 \
  --access-logfile -