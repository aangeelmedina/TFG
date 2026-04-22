"""
seed.py - Se ejecuta UNA VEZ al arrancar el contenedor backend.
Crea 15 registros por tabla si no existen.
"""
from clases import app, db, Usuario, Centro, Paciente, ArbolDecision, Nodo, CentroUsuario
from werkzeug.security import generate_password_hash
from datetime import date


def seed():
    with app.app_context():
        db.create_all()

        # ── Usuarios ──────────────────────────────────────────────────────
        usuarios_data = [
            {'username': 'admin',          'rol': 'superAdmin', 'set_password': True},
            {'username': 'elena.garcia',   'rol': None,         'set_password': True},
            {'username': 'carlos.lopez',   'rol': None,         'set_password': True},
            {'username': 'maria.santos',   'rol': None,         'set_password': True},
            {'username': 'juan.perez',     'rol': None,         'set_password': True},
            {'username': 'laura.martin',   'rol': None,         'set_password': True},
            {'username': 'pablo.ruiz',     'rol': None,         'set_password': True},
            {'username': 'sofia.torres',   'rol': None,         'set_password': True},
            {'username': 'miguel.diaz',    'rol': None,         'set_password': True},
            {'username': 'ana.fernandez',  'rol': None,         'set_password': True},
            {'username': 'daniel.gomez',   'rol': None,         'set_password': True},
            {'username': 'lucia.moreno',   'rol': None,         'set_password': True},
            {'username': 'david.jimenez',  'rol': None,         'set_password': True},
            {'username': 'clara.romero',   'rol': None,         'set_password': True},
            {'username': 'sergio.alonso',  'rol': None,         'set_password': True},
        ]

        usuarios = {}
        for u in usuarios_data:
            existente = Usuario.query.filter_by(username=u['username']).first()
            if not existente:
                nuevo = Usuario(
                    username=u['username'],
                    contrasena=generate_password_hash(u['username']),
                    rol=u['rol'],
                    set_password=u['set_password'],
                )
                db.session.add(nuevo)
                db.session.flush()
                usuarios[u['username']] = nuevo
            else:
                usuarios[u['username']] = existente

        db.session.commit()
        print("✅ Usuarios creados/verificados (15)")

        # ── Centros ───────────────────────────────────────────────────────
        centros_data = [
            {'nombre': 'Centro Médico Madrid Norte',   'direccion': 'Calle Alcalá 45, Madrid',            'telefono': '910123456', 'email': 'madrid.norte@centros.es'},
            {'nombre': 'Hospital San Juan Bautista',   'direccion': 'Av. de la Constitución 12, Sevilla', 'telefono': '954234567', 'email': 'sanjuan@centros.es'},
            {'nombre': 'Clínica Los Pinos',            'direccion': 'Paseo de Gracia 88, Barcelona',      'telefono': '932345678', 'email': 'lospinos@centros.es'},
            {'nombre': 'Centro de Salud El Olivo',     'direccion': 'Calle Mayor 7, Valencia',            'telefono': '963456789', 'email': 'elolivo@centros.es'},
            {'nombre': 'Hospital Regional del Sur',    'direccion': 'Ronda de Tejares 3, Córdoba',        'telefono': '957567890', 'email': 'sur@centros.es'},
            {'nombre': 'Clínica Santa Lucía',          'direccion': 'Av. Libertad 22, Zaragoza',          'telefono': '976678901', 'email': 'santalucia@centros.es'},
            {'nombre': 'Centro Rehabilitación Norte',  'direccion': 'Calle San Marcos 5, Bilbao',         'telefono': '944789012', 'email': 'bilbao@centros.es'},
            {'nombre': 'Hospital Universitario Este',  'direccion': 'Gran Vía 100, Granada',              'telefono': '958890123', 'email': 'este@centros.es'},
            {'nombre': 'Clínica La Esperanza',         'direccion': 'Calle Larios 15, Málaga',            'telefono': '952901234', 'email': 'laesperanza@centros.es'},
            {'nombre': 'Centro Médico Levante',        'direccion': 'Av. del Mar 8, Alicante',            'telefono': '965012345', 'email': 'levante@centros.es'},
            {'nombre': 'Centro Salud Valladolid',      'direccion': 'Plaza Mayor 3, Valladolid',          'telefono': '983123456', 'email': 'valladolid@centros.es'},
            {'nombre': 'Hospital Comarcal Murcia',     'direccion': 'Av. Juan Carlos I 50, Murcia',       'telefono': '968234567', 'email': 'murcia@centros.es'},
            {'nombre': 'Clínica San Rafael',           'direccion': 'Calle Sierpes 30, Sevilla',          'telefono': '954345678', 'email': 'sanrafael@centros.es'},
            {'nombre': 'Centro Médico Las Palmas',     'direccion': 'Av. Mesa y López 20, Las Palmas',    'telefono': '928456789', 'email': 'laspalmas@centros.es'},
            {'nombre': 'Centro Salud Vigo',            'direccion': 'Calle Príncipe 9, Vigo',             'telefono': '986567890', 'email': 'vigo@centros.es'},
        ]

        centros = []
        for c in centros_data:
            existente = Centro.query.filter_by(nombre=c['nombre']).first()
            if not existente:
                nuevo = Centro(**c)
                db.session.add(nuevo)
                db.session.flush()
                centros.append(nuevo)
            else:
                centros.append(existente)

        db.session.commit()
        print("✅ Centros creados/verificados (15)")

        # ── CentroUsuario ─────────────────────────────────────────────────
        usernames = list(usuarios_data[i]['username'] for i in range(len(usuarios_data)))
        centro_usuario_asignaciones = [
            (centros[0],  'elena.garcia',   'admin'),
            (centros[0],  'carlos.lopez',   'tutor'),
            (centros[1],  'maria.santos',   'tutor'),
            (centros[1],  'juan.perez',     'admin'),
            (centros[2],  'laura.martin',   'tutor'),
            (centros[2],  'pablo.ruiz',     'tutor'),
            (centros[3],  'sofia.torres',   'admin'),
            (centros[3],  'miguel.diaz',    'tutor'),
            (centros[4],  'ana.fernandez',  'tutor'),
            (centros[4],  'daniel.gomez',   'admin'),
            (centros[5],  'lucia.moreno',   'tutor'),
            (centros[5],  'david.jimenez',  'tutor'),
            (centros[6],  'clara.romero',   'admin'),
            (centros[6],  'sergio.alonso',  'tutor'),
            (centros[7],  'elena.garcia',   'tutor'),
        ]

        for centro, username, rol in centro_usuario_asignaciones:
            u = usuarios[username]
            if not CentroUsuario.query.filter_by(centro_id=centro.id, usuario_id=u.id).first():
                db.session.add(CentroUsuario(centro_id=centro.id, usuario_id=u.id, rol=rol, activo=True))

        db.session.commit()
        print("✅ CentroUsuarios creados/verificados (15)")

        # ── Pacientes ─────────────────────────────────────────────────────
        pacientes_data = [
            {'nombre': 'Pedro',      'apellidos': 'García Martínez',    'dni': '12345678A', 'edad': 45, 'contacto': '600111222', 'historial_medico': 'Hipertensión leve',         'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 1, 15), 'centro_id': centros[0].id},
            {'nombre': 'Rosa',       'apellidos': 'López Hernández',     'dni': '23456789B', 'edad': 62, 'contacto': '600222333', 'historial_medico': 'Diabetes tipo 2',           'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 2, 20), 'centro_id': centros[0].id},
            {'nombre': 'Antonio',    'apellidos': 'Sánchez Ruiz',        'dni': '34567890C', 'edad': 38, 'contacto': '600333444', 'historial_medico': 'Ansiedad moderada',        'estado': 'Alta médica',           'fecha_ingreso': date(2024, 3, 5),  'centro_id': centros[1].id},
            {'nombre': 'Carmen',     'apellidos': 'Torres Jiménez',      'dni': '45678901D', 'edad': 55, 'contacto': '600444555', 'historial_medico': 'Depresión mayor',          'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 3, 18), 'centro_id': centros[1].id},
            {'nombre': 'Francisco',  'apellidos': 'Moreno González',     'dni': '56789012E', 'edad': 71, 'contacto': '600555666', 'historial_medico': 'Artrosis de rodilla',      'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 4, 2),  'centro_id': centros[2].id},
            {'nombre': 'Isabel',     'apellidos': 'Díaz Fernández',      'dni': '67890123F', 'edad': 29, 'contacto': '600666777', 'historial_medico': 'Asma bronquial',           'estado': 'Alta médica',           'fecha_ingreso': date(2024, 4, 22), 'centro_id': centros[2].id},
            {'nombre': 'Manuel',     'apellidos': 'Romero Castro',       'dni': '78901234G', 'edad': 48, 'contacto': '600777888', 'historial_medico': 'Cardiopatía isquémica',   'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 5, 10), 'centro_id': centros[3].id},
            {'nombre': 'Dolores',    'apellidos': 'Alonso Vega',         'dni': '89012345H', 'edad': 67, 'contacto': '600888999', 'historial_medico': 'Demencia leve',            'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 5, 25), 'centro_id': centros[3].id},
            {'nombre': 'José',       'apellidos': 'Navarro Molina',      'dni': '90123456I', 'edad': 34, 'contacto': '601999000', 'historial_medico': 'Fractura de tobillo',      'estado': 'Alta médica',           'fecha_ingreso': date(2024, 6, 8),  'centro_id': centros[4].id},
            {'nombre': 'Teresa',     'apellidos': 'Gutiérrez Serrano',   'dni': '01234567J', 'edad': 52, 'contacto': '601000111', 'historial_medico': 'Fibromialgia',             'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 6, 30), 'centro_id': centros[4].id},
            {'nombre': 'Raúl',       'apellidos': 'Ramos Ortega',        'dni': '11223344K', 'edad': 41, 'contacto': '601111222', 'historial_medico': 'Lumbalgia crónica',        'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 7, 14), 'centro_id': centros[5].id},
            {'nombre': 'Pilar',      'apellidos': 'Iglesias Blanco',     'dni': '22334455L', 'edad': 59, 'contacto': '601222333', 'historial_medico': 'Hipotiroidismo',           'estado': 'Alta médica',           'fecha_ingreso': date(2024, 7, 28), 'centro_id': centros[5].id},
            {'nombre': 'Luis',       'apellidos': 'Flores Pardo',        'dni': '33445566M', 'edad': 76, 'contacto': '601333444', 'historial_medico': 'Insuficiencia renal leve', 'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 8, 12), 'centro_id': centros[6].id},
            {'nombre': 'Concepción', 'apellidos': 'Cruz Medina',         'dni': '44556677N', 'edad': 43, 'contacto': '601444555', 'historial_medico': 'Migraña crónica',          'estado': 'En tratamiento', 'fecha_ingreso': date(2024, 8, 25), 'centro_id': centros[6].id},
            {'nombre': 'Alberto',    'apellidos': 'Reyes Fuentes',       'dni': '55667788O', 'edad': 31, 'contacto': '601555666', 'historial_medico': 'Gastritis crónica',        'estado': 'Alta médica',           'fecha_ingreso': date(2024, 9, 5),  'centro_id': centros[7].id},
        ]

        pacientes = []
        for p in pacientes_data:
            existente = Paciente.query.filter_by(dni=p['dni']).first()
            if not existente:
                nuevo = Paciente(**p)
                db.session.add(nuevo)
                db.session.flush()
                pacientes.append(nuevo)
            else:
                pacientes.append(existente)

        db.session.commit()
        print("✅ Pacientes creados/verificados (15)")

        # ── Árboles de decisión ───────────────────────────────────────────
        arboles_titulos = [
            'Evaluación inicial del dolor',
            'Protocolo de ansiedad',
            'Seguimiento de diabetes',
            'Plan para depresión severa',
            'Evaluación de movilidad',
            'Control del asma',
            'Protocolo cardíaco',
            'Evaluación cognitiva',
            'Recuperación ortopédica',
            'Manejo de fibromialgia',
            'Programa lumbar',
            'Control de tiroides',
            'Protocolo renal',
            'Manejo de migraña',
            'Seguimiento digestivo',
        ]

        arboles = []
        for paciente, titulo in zip(pacientes, arboles_titulos):
            existente = ArbolDecision.query.filter_by(titulo=titulo, paciente_id=paciente.id).first()
            if not existente:
                nuevo = ArbolDecision(titulo=titulo, paciente_id=paciente.id)
                db.session.add(nuevo)
                db.session.flush()
                arboles.append(nuevo)
            else:
                arboles.append(existente)

        db.session.commit()
        print("✅ Árboles de decisión creados/verificados (15)")

        # ── Nodos raíz ────────────────────────────────────────────────────
        nodos_texto = [
            '¿El paciente siente dolor agudo?',
            '¿Ha tenido episodios de pánico en las últimas 2 semanas?',
            '¿El nivel de glucosa está controlado?',
            '¿El paciente ha tenido pensamientos negativos recurrentes?',
            '¿Puede caminar sin apoyo?',
            '¿Ha usado el inhalador en los últimos 7 días?',
            '¿Presenta dolor en el pecho?',
            '¿Reconoce a sus familiares cercanos?',
            '¿Puede doblar la rodilla a 90°?',
            '¿El dolor interfiere con el sueño?',
            '¿Siente rigidez matutina?',
            '¿Los niveles de TSH están en rango?',
            '¿La creatinina está elevada?',
            '¿La frecuencia de migraña ha disminuido?',
            '¿Presenta ardor estomacal diario?',
        ]

        for arbol, texto in zip(arboles, nodos_texto):
            if not Nodo.query.filter_by(texto=texto, arbol_id=arbol.id).first():
                db.session.add(Nodo(texto=texto, es_final=False, arbol_id=arbol.id))

        db.session.commit()
        print("✅ Nodos raíz creados/verificados (15)")
        print("\n🎉 Seed completado: 15 registros por tabla")


if __name__ == '__main__':
    seed()