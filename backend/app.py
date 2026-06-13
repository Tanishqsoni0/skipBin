from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os
from dotenv import load_dotenv

load_dotenv()  # loads PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE from .env

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
from routes.paypal_routes import paypal_bp   
from routes.commercial_quote_routes import commercial_quote_bp       

app = Flask(__name__)

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

mail = Mail(app)

CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]}})

app.config["JWT_SECRET_KEY"] = "skipbin_super_secret_key_2026_project_12345"
jwt = JWTManager(app)

@app.errorhandler(Exception)
def handle_exception(e):
    print(f"Unhandled error: {e}")
    return jsonify({"error": "Internal server error"}), 500

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
app.register_blueprint(paypal_bp)                  
app.register_blueprint(commercial_quote_bp)        

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )