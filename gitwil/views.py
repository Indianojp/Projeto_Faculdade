from gitwil import app
from flask import Flask, session, redirect, url_for, request, render_template, flash, jsonify, abort
import random, string
from functools import wraps

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('logado'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return wrapper

def gerar_codigo_aleatorio(tamanho=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=tamanho))

salas = {}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    senha = request.form.get('senha')

    # Login fixo
    emailCorreto = "anne@gmail.com"
    senhaCorreta = "123456"

    if not email or not senha:
        flash("Por favor, preencha o e-mail e a senha.")
        return redirect(url_for('index'))

    if email == emailCorreto and senha == senhaCorreta:
        session['logado'] = True
        return redirect(url_for('professor'))

    flash("E-mail ou senha incorretos.")
    return redirect(url_for('index'))


@app.route('/professor')
@login_required
def professor():
    return render_template('professor.html')


@app.route('/professor/<codigo>')
@login_required
def professor_mon(codigo):
    return render_template('professor_mon.html', codigo=codigo)


@app.route('/criar_sala', methods=['POST'])
def criar_sala():
    dados = request.get_json()

    if not dados or 'opcoes' not in dados:
        return jsonify({"erro": "Dados inválidos"}), 400

    opcoes = dados['opcoes']
    if len(opcoes) < 2 or len(opcoes) > 5:
        return jsonify({"erro": "Número de opções deve ser entre 2 e 5"}), 400

    # Gera código único
    codigo = gerar_codigo_aleatorio()
    while codigo in salas:
        codigo = gerar_codigo_aleatorio()

    salas[codigo] = {
        "opcoes": opcoes,
        "respostas_ativas": True,
        "respostas": {op['letra']: 0 for op in opcoes}
    }

    return jsonify({"codigo": codigo})

@app.route('/sala/<codigo>')
def sala_aluno(codigo):
    if codigo not in salas:
        abort(404)
    return render_template('aluno.html')


@app.route('/api/sala/<codigo>')
def api_sala(codigo):
    sala = salas.get(codigo)
    if not sala:
        return jsonify({"erro": "Sala não encontrada"}), 404
    return jsonify({
        "opcoes": sala["opcoes"],
        "respostas_ativas": sala.get("respostas_ativas", False),
        "respostas": sala.get("respostas", {})
    })


@app.route('/api/sala/<codigo>/responder', methods=['POST'])
def responder(codigo):
    sala = salas.get(codigo)
    if not sala:
        return jsonify({"erro": "Sala não encontrada"}), 404
    
    if not sala.get("respostas_ativas", False):
        return jsonify({"erro": "Respostas não estão ativas"}), 403
    
    data = request.get_json()
    letra = data.get("letra")
    if letra not in [opt["letra"] for opt in sala["opcoes"]]:
        return jsonify({"erro": "Opção inválida"}), 400
    
    sala["respostas"][letra] = sala["respostas"].get(letra, 0) + 1
    
    return jsonify({"sucesso": True, "respostas": sala["respostas"]})


@app.route('/api/sala/<codigo>/dados')
def dados_sala(codigo):
    sala = salas.get(codigo)
    if not sala:
        return jsonify({"erro": "Sala não encontrada"}), 404
    return jsonify({
        "opcoes": sala["opcoes"],
        "respostas": sala["respostas"]
    })


@app.route('/api/sala/<codigo>/resetar_respostas', methods=['POST'])
def resetar_respostas(codigo):
    sala = salas.get(codigo)
    if not sala:
        return jsonify({"erro": "Sala não encontrada"}), 404

    sala["respostas"] = {op['letra']: 0 for op in sala["opcoes"]}
    sala["respostas_ativas"] = True
    return jsonify({"sucesso": True})


@app.route('/api/sala/<codigo>/apagar', methods=['POST'])
def apagar_sala(codigo):
    if codigo in salas:
        del salas[codigo]
        return jsonify({"sucesso": True})
    return jsonify({"erro": "Sala não encontrada"}), 404
