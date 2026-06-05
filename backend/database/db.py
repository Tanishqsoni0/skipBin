import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Thapar27",
    database="skipbins"
)

cursor = conn.cursor(dictionary=True)