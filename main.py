from gitwil import app
from waitress import serve

def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain; charset=utf-8')])
    return ['Servidor WSGI acessível pela internet via Waitress!']

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8000)