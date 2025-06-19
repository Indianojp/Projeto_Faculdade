from flask import Flask


app = Flask(__name__)
app.secret_key = '10pontos'

from gitwil.views import index