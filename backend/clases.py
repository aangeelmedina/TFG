from flask_sqlalchemy import SQLAlchemy
import pymysql
from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()
pymysql.install_as_MySQLdb()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')

app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

db = SQLAlchemy(app)

# --- MODELO USUARIO ---
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id           = db.Column(db.Integer, primary_key=True)
    username     = db.Column(db.String(100), unique=True)
    contrasena   = db.Column(db.String(256))
    rol          = db.Column(db.String(50), nullable=True)


# Tabla intermedia nodos ↔ pacientes
nodos_pacientes = db.Table('nodos_pacientes',
    db.Column('nodo_id',     db.Integer, db.ForeignKey('nodos.id'),    primary_key=True),
    db.Column('paciente_id', db.Integer, db.ForeignKey('pacientes.id'), primary_key=True)
)


# --- MODELO NODO ---
class Nodo(db.Model):
    __tablename__ = 'nodos'

    id       = db.Column(db.Integer, primary_key=True)
    texto    = db.Column(db.String(200), nullable=False)
    img      = db.Column(db.String(200), nullable=True)
    es_final = db.Column(db.Boolean, default=False)

    padre_id = db.Column(db.Integer, db.ForeignKey('nodos.id'), nullable=True)
    hijos    = db.relationship('Nodo',
                               backref=db.backref('padre', remote_side=[id]),
                               lazy=True)

    def __repr__(self):
        return f'<Nodo {self.id}: {self.texto}>'

    def puede_tener_hijos(self):
        return len(self.hijos) < 2


# --- MODELO CENTRO ---
class Centro(db.Model):
    __tablename__ = 'centros'
    id        = db.Column(db.Integer, primary_key=True)
    nombre    = db.Column(db.String(200), nullable=False)
    direccion = db.Column(db.String(300), nullable=False)
    telefono  = db.Column(db.String(20),  nullable=False)
    email     = db.Column(db.String(100), nullable=False)


# --- MODELO PACIENTE (ampliado) ---
class Paciente(db.Model):
    __tablename__ = 'pacientes'

    id               = db.Column(db.Integer,      primary_key=True)
    nombre           = db.Column(db.String(100),  nullable=False)
    apellidos        = db.Column(db.String(150),  nullable=False, default='')
    dni              = db.Column(db.String(20),   nullable=False, default='')
    edad             = db.Column(db.Integer,      nullable=False)
    contacto         = db.Column(db.String(30),   nullable=True)
    historial_medico = db.Column(db.Text,         nullable=True)
    estado           = db.Column(db.String(50),   nullable=False, default='En tratamiento')
    fecha_ingreso    = db.Column(db.Date,         nullable=True)
    centro_id        = db.Column(db.Integer,      db.ForeignKey('centros.id'), nullable=False)

    centro = db.relationship('Centro', backref=db.backref('pacientes', lazy=True))

    nodos = db.relationship('Nodo',
                            secondary=nodos_pacientes,
                            lazy='subquery',
                            backref=db.backref('pacientes', lazy=True))

    def to_dict(self):
        return {
            "id":               self.id,
            "nombre":           self.nombre,
            "apellidos":        self.apellidos,
            "dni":              self.dni,
            "edad":             self.edad,
            "contacto":         self.contacto,
            "historial_medico": self.historial_medico,
            "estado":           self.estado,
            "fecha_ingreso":    self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            "centro_id":        self.centro_id,
        }


# --- MODELO CENTRO-USUARIO ---
class CentroUsuario(db.Model):
    __tablename__ = 'centro_usuarios'
    id         = db.Column(db.Integer, primary_key=True)
    centro_id  = db.Column(db.Integer, db.ForeignKey('centros.id'),   nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'),  nullable=False)
    rol        = db.Column(db.String(50), nullable=False)

    centro  = db.relationship('Centro',  backref=db.backref('centro_usuarios', lazy=True))
    usuario = db.relationship('Usuario', backref=db.backref('centro_usuarios', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('centro_id', 'usuario_id', name='unique_centro_usuario'),
    )