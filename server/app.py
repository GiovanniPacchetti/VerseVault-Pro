from flask import Flask
from flask_apispec import FlaskApiSpec
from flask_swagger_ui import get_swaggerui_blueprint
from apispec import APISpec
from flask_marshmallow import Marshmallow  # Usar Marshmallow de Flask-Marshmallow
from flask_apispec.ext.marshmallow import MarshmallowPlugin  # Asegúrate de importar MarshmallowPlugin
from facade.authController import auth_bp

app = Flask(__name__)

# Configura Flask-APISpec con MarshmallowPlugin
app.config.update({
    'APISPEC_SPEC': APISpec(
        title='Mi API Flask',
        version='1.0.0',
        openapi_version='3.0.0',
        plugins=[MarshmallowPlugin()]  # Agrega el plugin de Marshmallow
    ),
    'APISPEC_SWAGGER_URL': '/swagger.json'  # URL para acceder a la especificación Swagger
})

# Inicializa Flask-Marshmallow
ma = Marshmallow(app)

# Inicializa Flask-APISpec
docs = FlaskApiSpec(app)

# Registrar el Blueprint
app.register_blueprint(auth_bp, url_prefix='/api')

# Configurar Swagger UI
SWAGGER_URL = '/swagger'
API_URL = '/swagger.json'  # URL para obtener la especificación Swagger

swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "Mi API Flask"}
)
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

# Registrar el Blueprint en FlaskApiSpec
docs.register(auth_bp)

if __name__ == "__main__":
    app.run(debug=True)
