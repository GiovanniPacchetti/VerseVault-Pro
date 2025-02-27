from flask import Flask, request
from flask_apispec import FlaskApiSpec
from flask_swagger_ui import get_swaggerui_blueprint
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from facade.authController import auth_bp, LoginResource

app = Flask(__name__)

# Configura Flask-APISpec con MarshmallowPlugin
app.config.update({
    'APISPEC_SPEC': APISpec(
        title='Mi API Flask',
        version='1.0.0',
        openapi_version='3.0.0',
        plugins=[MarshmallowPlugin()]
    ),
    'APISPEC_SWAGGER_URL': '/swagger.json',
    'APISPEC_SWAGGER_UI_URL': '/swagger-ui',
    'PROPAGATE_EXCEPTIONS': True  # Añade esta línea
})

# Inicializa Flask-APISpec
docs = FlaskApiSpec(app)

# Registrar el Blueprint PRIMERO
app.register_blueprint(auth_bp, url_prefix='/api')

# Configurar Swagger UI
SWAGGER_URL = '/swagger'
API_URL = '/swagger.json'

swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "Mi API Flask"}
)
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

# IMPORTANTE: Registra los endpoints DESPUÉS de registrar los blueprints
with app.test_request_context():
    # Es importante usar el endpoint correcto (el nombre que estableciste en as_view)
    docs.register(LoginResource, endpoint='/login', blueprint='auth')
import logging
logging.basicConfig(level=logging.DEBUG)

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
if __name__ == "__main__":
    app.run(debug=True)