from flask import Blueprint
from flask import request
from flask import jsonify

from database.db import cursor

from flask_jwt_extended import (
    create_access_token
)

auth_bp = Blueprint(
    "auth",
    __name__
)

@auth_bp.route("/login",methods=["POST"])
def login():

    data = request.json

    username = data["username"]
    password = data["password"]

    cursor.execute(
        """
        SELECT *
        FROM admin_users
        WHERE username=%s
        """,
        (username,)
    )

    admin = cursor.fetchone()

    if not admin:
        return jsonify({
            "message":"Invalid user"
        }),401

    if admin["password_hash"] != password:
        return jsonify({
            "message":"Wrong password"
        }),401

    token = create_access_token(
        identity=username
    )

    return jsonify({
        "token":token
    })