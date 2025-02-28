import sqlite3

def connect_db():
    try: 
        db = sqlite3.connect(database = "libreria.db")
        return db
    except sqlite3.Error as e:
        print(f"Error al conectar con la base de datos: {e}")
        return None


def iniciarSesion(db, email_cl, pass_cl):
    sql = "SELECT id_cl FROM Cliente WHERE email_cl = ? AND pass_cl = ?"
    id_cliente = -1
    try:
        cursor = db.cursor()
        cursor.execute(sql, (email_cl, pass_cl))
        row = cursor.fetchone()
        
        if row:
            id_cliente = row[0]
        else:
            print("Credenciales incorrectas")
    except sqlite3.Error as e:
        print(f"Error en la base de datos: {e}")
    
    return id_cliente