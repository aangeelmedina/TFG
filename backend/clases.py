from flask_sqlalchemy import SQLAlchemy
import pymysql
from flask import Flask
from dotenv import load_dotenv
import os

# override=False = las variables del sistema (Docker) tienen prioridad sobre el .env
load_dotenv(override=False)

pymysql.install_as_MySQLdb()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')

app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

db = SQLAlchemy(app)


# ─────────────────────────────────────────────
# USUARIO
# ─────────────────────────────────────────────
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(100), unique=True)
    contrasena = db.Column(db.String(256))
    rol        = db.Column(db.String(50), nullable=True)
    set_password = db.Column(db.Boolean, default=True)


# ─────────────────────────────────────────────
# NODO
# ─────────────────────────────────────────────
class Nodo(db.Model):
    __tablename__ = 'nodos'

    id       = db.Column(db.Integer, primary_key=True)
    texto    = db.Column(db.String(200), nullable=False)
    img      = db.Column(db.String(200), nullable=True)
    es_final = db.Column(db.Boolean, default=False)

    padre_id = db.Column(db.Integer, db.ForeignKey('nodos.id'), nullable=True)
    hijos    = db.relationship(
        'Nodo',
        backref=db.backref('padre', remote_side='Nodo.id'),
        lazy=True,
        cascade='all, delete-orphan',
    )

    arbol_id = db.Column(db.Integer, db.ForeignKey('arboles_decision.id'), nullable=True)

    def __repr__(self):
        return f'<Nodo {self.id}: {self.texto}>'

    def puede_tener_hijos(self):
        return len(self.hijos) < 2

    def to_dict(self, recurse: bool = True) -> dict:
        data = {
            'id':       self.id,
            'texto':    self.texto,
            'img':      self.img,
            'es_final': self.es_final,
            'padre_id': self.padre_id,
            'arbol_id': self.arbol_id,
            'hijos':    [],
        }
        if recurse:
            data['hijos'] = [h.to_dict() for h in self.hijos]
        return data


# ─────────────────────────────────────────────
# ÁRBOL DE DECISIÓN
# ─────────────────────────────────────────────
class ArbolDecision(db.Model):
    __tablename__ = 'arboles_decision'

    id          = db.Column(db.Integer, primary_key=True)
    titulo      = db.Column(db.String(200), nullable=False, default='Árbol sin título')
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    creado_en   = db.Column(db.DateTime, server_default=db.func.now())

    nodos = db.relationship(
        'Nodo',
        backref=db.backref('arbol', lazy=True),
        lazy=True,
        cascade='all, delete-orphan',
        foreign_keys='Nodo.arbol_id',
    )

    @property
    def raiz(self):
        return next((n for n in self.nodos if n.padre_id is None), None)

    def to_dict(self, include_tree: bool = False) -> dict:
        data = {
            'id':          self.id,
            'titulo':      self.titulo,
            'paciente_id': self.paciente_id,
            'creado_en':   self.creado_en.isoformat() if self.creado_en else None,
            'num_nodos':   len(self.nodos),
        }
        if include_tree:
            raiz = self.raiz
            data['raiz'] = raiz.to_dict() if raiz else None
        return data

    def __repr__(self):
        return f'<ArbolDecision {self.id}: {self.titulo} (paciente {self.paciente_id})>'


# ─────────────────────────────────────────────
# CENTRO
# ─────────────────────────────────────────────
class Centro(db.Model):
    __tablename__ = 'centros'
    id        = db.Column(db.Integer, primary_key=True)
    nombre    = db.Column(db.String(200), nullable=False)
    direccion = db.Column(db.String(300), nullable=False)
    telefono  = db.Column(db.String(20),  nullable=False)
    email     = db.Column(db.String(100), nullable=False)


# ─────────────────────────────────────────────
# PACIENTE
# ─────────────────────────────────────────────
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

    centro  = db.relationship('Centro', backref=db.backref('pacientes', lazy=True))

    arboles = db.relationship(
        'ArbolDecision',
        backref=db.backref('paciente', lazy=True),
        lazy=True,
        cascade='all, delete-orphan',
    )

    def to_dict(self):
        return {
            'id':               self.id,
            'nombre':           self.nombre,
            'apellidos':        self.apellidos,
            'dni':              self.dni,
            'edad':             self.edad,
            'contacto':         self.contacto,
            'historial_medico': self.historial_medico,
            'estado':           self.estado,
            'fecha_ingreso':    self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            'centro_id':        self.centro_id,
            'num_arboles':      len(self.arboles),
        }


# ─────────────────────────────────────────────
# CENTRO-USUARIO
# ─────────────────────────────────────────────
class CentroUsuario(db.Model):
    __tablename__ = 'centro_usuarios'
    id         = db.Column(db.Integer, primary_key=True)
    centro_id  = db.Column(db.Integer, db.ForeignKey('centros.id'),  nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    rol        = db.Column(db.String(50), nullable=False)

    centro  = db.relationship('Centro',  backref=db.backref('centro_usuarios', lazy=True))
    usuario = db.relationship('Usuario', backref=db.backref('centro_usuarios', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('centro_id', 'usuario_id', name='unique_centro_usuario'),
    )