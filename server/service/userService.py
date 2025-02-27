from db import *



def login(email_cl, pass_cl):
    db = connect_db()
    if db:
        id_cliente = iniciarSesion(db, email_cl, pass_cl)
        db.close()
        return id_cliente
    else:
        return -1
