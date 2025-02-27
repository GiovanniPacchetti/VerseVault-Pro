from flask import Blueprint, request, jsonify
from flask_apispec import doc
from service.userService import login

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@doc(description="Inicia sesión con las credenciales proporcionadas.", 
     params=[
         {'name': 'email', 'in': 'body', 'required': True, 'type': 'string'},
         {'name': 'password', 'in': 'body', 'required': True, 'type': 'string'}
     ], 
     responses={200: {'description': 'Login exitoso'}, 400: {'description': 'Credenciales incorrectas'}})

def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Usamos la fachada para procesar el login
    response = login(email, password)
    
    return jsonify(response), 200 if isinstance(response, dict) else response[1]
