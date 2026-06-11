from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.customer_routes import customer_bp
from routes.booking_routes import booking_bp
from routes.pricing_routes import pricing_bp
from routes.loyalty_routes import loyalty_bp
from routes.bin_routes import bin_bp
from routes.waste_routes import waste_bp
from routes.promotion_routes import promotion_bp
from routes.dashboard_routes import dashboard_bp
from routes.auth_routes import auth_bp
from routes.admin_auth_routes import admin_auth_bp
from routes.contact_routes import contact_bp
from routes.distance_routes import distance_bp
from routes.calendar_routes import calendar_bp
app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*":{
            "origins":[
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
        }
    }
)
app.config["JWT_SECRET_KEY"] = "skipbins_secret"
jwt = JWTManager(app)
@app.route("/")
def home():
    return "Hello Skip Bins"

app.register_blueprint(customer_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(pricing_bp)
app.register_blueprint(loyalty_bp)
app.register_blueprint(bin_bp)
app.register_blueprint(waste_bp)
app.register_blueprint(promotion_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_auth_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(distance_bp)
app.register_blueprint(calendar_bp)
if __name__ == "__main__":
    app.run(debug=True)