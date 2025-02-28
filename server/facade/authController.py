from flask import Blueprint, request, jsonify
from flask_apispec import marshal_with, doc, use_kwargs
from flask_apispec.views import MethodResource
from marshmallow import Schema, fields, EXCLUDE
from service.userService import login
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

# Define los esquemas para entrada y salida
class LoginSchema(Schema):
    email = fields.String(required=True, description="Email del usuario")
    password = fields.String(required=True, description="Contraseña del usuario")
    
    class Meta:
        unknown = EXCLUDE  # Permitir campos desconocidos

class LoginResponseSchema(Schema):
    message = fields.String(description="Mensaje de estado")
    token = fields.String(description="Token de autenticación")
    
    class Meta:
        unknown = EXCLUDE  # Permitir campos adicionales en la respuesta

# Define el recurso usando MethodResource
class LoginResource(MethodResource):
    @doc(description="Inicia sesión con las credenciales proporcionadas.")
    @use_kwargs(LoginSchema, location='json')  # Cambiado de ('json') a 'json'
    @marshal_with(LoginResponseSchema, code=200)
    def post(self, **kwargs):
        try:
            # Imprimir datos para depuración
            print("kwargs:", kwargs)
            print("JSON body:", request.get_json())
            
            # Obtener datos
            data = request.get_json() or {}
            email = kwargs.get('email') or data.get('email')
            password = kwargs.get('password') or data.get('password')
            
            if not email or not password:
                return {"error": "Email y password son obligatorios"}, 400
                
            print(f"Email: {email}, Password: {password}")
            
            # Usar la fachada para procesar el login
            response = login(email, password)

            # Usar la fachada para procesar el login
            if isinstance(response, int) and response > 0:
                token = create_access_token(identity=response, expires_delta=timedelta(hours=1))
                return {"message": "Login exitoso", "token": token}, 200
            else:
                return {"error": "Credenciales incorrectas"}, 401
                
        except ValidationError as err:
            print("Error de validación:", err.messages)
            return {"errors": err.messages}, 422
        except Exception as e:
            print(f"Error en login: {str(e)}")
            return {"error": "Error interno del servidor"}, 500

# Registrar la vista en el blueprint CORRECTAMENTE
auth_bp.add_url_rule(rule='login', endpoint='/login', view_func=LoginResource.as_view('login'))
