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