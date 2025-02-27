import sqlite3
import requests
import json
import os

def iniciar_sesion(email_cl, pass_cl):
    try:
        conn = sqlite3.connect("libreria.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM clientes WHERE email=? AND password=?", (email_cl, pass_cl))
        result = cursor.fetchone()
        conn.close()
        if result:
            print("Inicio de sesión exitoso. Bienvenido")
            return result[0]
        else:
            print("Inicio de sesión fallido. Verifica tus credenciales.")
            return -1
    except sqlite3.Error as e:
        print(f"Error con la base de datos: {e}")
        return -1

def registrar_cliente(nom_cl, email_cl, pass_cl):
    try:
        conn = sqlite3.connect("libreria.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO clientes (nombre, email, password) VALUES (?, ?, ?)", (nom_cl, email_cl, pass_cl))
        conn.commit()
        conn.close()
        print("Cliente registrado exitosamente")
        return True
    except sqlite3.Error as e:
        print(f"Error con la base de datos: {e}")
        return False

def agregar_libro(titulo, nom_autor, idioma, fecha_publicacion):
    try:
        conn = sqlite3.connect("libreria.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO libros (titulo, autor, idioma, fecha_publicacion) VALUES (?, ?, ?, ?)",
                       (titulo, nom_autor, idioma, fecha_publicacion))
        conn.commit()
        conn.close()
        print("Libro agregado exitosamente")
        return True
    except sqlite3.Error as e:
        print(f"Error con la base de datos: {e}")
        return False

def descargar_libro(titulo):
    directory = "../libros/"
    file_path = os.path.join(directory, f"{titulo}.txt")
    
    if os.path.exists(file_path):
        print(f"El libro '{titulo}' ya está descargado.")
        return True
    
    url = f"http://gutendex.com/books/?search={titulo.replace(' ', '%20')}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            txt_utf8_link = data["results"][0]["formats"].get("text/plain; charset=us-ascii", "")
            if txt_utf8_link:
                book_title = data["results"][0]["title"]
                os.makedirs(directory, exist_ok=True)
                book_content = requests.get(txt_utf8_link).text
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(book_content)
                print(f"Libro descargado: {book_title}")
                return True
    
    print("No se pudo descargar el libro.")
    return False
