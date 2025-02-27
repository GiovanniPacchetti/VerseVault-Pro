from flask import Blueprint, request, jsonify
from flask_apispec import marshal_with, doc, use_kwargs
from flask_apispec.views import MethodResource
from marshmallow import Schema, fields, EXCLUDE
from service.userService import login
from marshmallow import ValidationError

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
            
            # Formatear respuesta correctamente
            if isinstance(response, dict):
                return response, 200
            elif isinstance(response, tuple) and len(response) > 1:
                return response
            else:
                return {"message": "Login procesado"}, 200
                
        except ValidationError as err:
            print("Error de validación:", err.messages)
            return {"errors": err.messages}, 422
        except Exception as e:
            print(f"Error en login: {str(e)}")
            return {"error": "Error interno del servidor"}, 500

# Registrar la vista en el blueprint CORRECTAMENTE
auth_bp.add_url_rule(rule='login', endpoint='/login', view_func=LoginResource.as_view('login'))