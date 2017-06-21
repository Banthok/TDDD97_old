from gevent.pywsgi import WSGIServer
from werkzeug.serving import run_with_reloader
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketError
import hashlib, uuid
import sqlite3
import database_helper
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify
from flask_bcrypt import Bcrypt
import json
import string, random
import re


app = Flask(__name__)
bcrypt = Bcrypt(app)

current_sockets = {};

@app.route('/', methods=['GET'])
def start():
    return redirect('static/client.html')



@app.route('/sign-in', methods=['POST'])
def sign_in():
    email = request.form['username']
    password = request.form['password']
    try:
        hashword = database_helper.get_user_password(email)
        if bcrypt.check_password_hash(hashword['password'], password + hashword['salt']):
            token = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(30));
            #logged_in_users[token] = email
            database_helper.update_token(email, token)
            return jsonify({"success": True, "message": "Successfully signed in.", "data": token})
    except IndexError:
        return jsonify({"success": False, "message": "Incorrect username or password. indexerror."})
    return jsonify({"success": False, "message": "Incorrect username or password."})



@app.route('/sign-up', methods=['POST'])
def add_user():
    email = request.form['email']
    password = request.form['password']
    salt = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(8));
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    try:
        database_helper.add_user(email, bcrypt.generate_password_hash(password + salt), salt, firstname, familyname, gender, city, country)
        return jsonify({"success": True, "message": "User successfully created."})
    except sqlite3.Error:
        return jsonify({"success": False, "message": "Email already in use."})

@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.form['token']
    onlines = database_helper.get_online_user_data_token(token)
    if onlines:
        database_helper.delete_token_token(token)
        return jsonify({"success": True, "message": "You've been logged out."})
    else:
        return jsonify({"success": False, "message": "You gotta be logged in to log out."})


@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.form['token']
    new_password = request.form['new_password']
    old_password = request.form['old_password']
    onlines = database_helper.get_online_user_data_token(token) 

    if not onlines:
        return jsonify({"success": False, "message": "You must be logged in to change password."})

    email = database_helper.get_online_user_data_token(token)['email']
    cred = database_helper.get_user_password(email)
    hashed = cred['password']
    salt = cred['salt']
    
    if not bcrypt.check_password_hash(hashed, old_password + salt):
        return jsonify({"success": False, "message": "Incorrect password."})
    else:
        database_helper.update_password(email, bcrypt.generate_password_hash(new_password + salt))
        return jsonify({"success": True, "message": "Password changed!"})

@app.route('/data-by-token/<token>/<client_hash>', methods=['GET'])
def get_user_data_by_token(token, client_hash):
    onlines = database_helper.get_online_user_data_token(token)
    
    if not onlines: 
        return jsonify({"success": False, "message": "No such token."})    
    if not verifyToken('data-by-token', onlines['email'], client_hash):
        return jsonify({"success": False, "message": "Bad hash"})

    try:
        email = onlines['email']
    except IndexError: 
        return jsonify({"success": False, "message": "Token error."})


    data = database_helper.get_user_data(email)
    return jsonify({"success": True, "message": "Ok!", "data": data})

@app.route('/data-by-email/<token>/<email>/<client_hash>', methods=['GET'])
def get_user_data_by_email(token, email, client_hash):
    data = database_helper.get_user_data(email)
    onlines = database_helper.get_online_user_data_token(token)

    if not onlines:
        return jsonify({"success": False, "message": "Token invalid."})
    if not data:
        return jsonify({"success": False, "message": "No such email."})
    if not verifyToken('data-by-email', email, client_hash):
        return jsonify({"success": False, "message": "Bad hash."})

    else:
        return jsonify({"success": True, "message": "Ok!", "data": data})

@app.route('/messages-by-email/<token>/<email>/<client_hash>', methods=['GET'])
def get_user_messages_by_email(token, email, client_hash):
    messages = database_helper.get_user_messages(email)
    onlines = database_helper.get_online_user_data_token(token)

    if not verifyToken('messages-by-email', email, client_hash):
        return jsonify({"success": False, "message": "Bad hash."})

    if not onlines:
        return jsonify({"success": False, "message": "Token invalid."})
    if not messages:
        return jsonify({"success": False, "message": "No messages."})


    return jsonify({"success": True, "message": "Ok!", "data": messages})

@app.route('/post', methods=['POST'])
def post_message():
    message = request.form['message']
    token = request.form['token']
    to_user = request.form['email']
    onlines = database_helper.get_online_user_data_token(token)

    if not onlines:
        return jsonify({"success": False, "message": "Not logged in."})
    from_user = onlines['email']

    if not verifyTokenPost('post', request):
        return jsonify({"success": False, "message": "Bad hash."})

    try:
        database_helper.add_message(message, from_user, to_user)
        return jsonify({"success": True, "message": "Message posted."})
    except sqlite3.Error:
        return jsonify({"success": False, "message": "Couldn't post message."})



@app.route('/connect-socket')
def socket_connect():
    if request.environ.get("wsgi.websocket"):
        ws = request.environ["wsgi.websocket"]
        while True:
            try:
                cur_email = ws.receive()
                if cur_email in current_sockets:
                    current_sockets[cur_email].send(json.dumps("logout"))
                current_sockets[cur_email] = ws
            except WebSocketError as e:
                print("WebSocketError: " + str(e))
                break



# route should include all parameters except clientEmail and chash
def verifyToken(route, email, client_hash, post=False):
    try: 
        token = database_helper.get_online_user_data(email)['token']
    except IndexError:
        return json.dumps({"success": False, "message": "You are not signed in."})

    if post:
        data = '/'+route+"&email="+email+'&token='+token
    else:
        data = '/'+route+'/'+token

    server_hash = hashlib.sha1(data.encode('utf-8')).hexdigest()

    print 'data: ' + data
    print 'Hash from client: ' + client_hash
    print 'Hash from server: ' + server_hash

    return client_hash == server_hash

def verifyTokenPost(route, request):
    route += '?'
    email = ''
    client_hash = ''

    for key in request.form:
        print key
        if key == "email":
            email = request.form[key]
        elif key == "client_hash":
            client_hash = request.form[key]
        else:
            route += key +'='+request.form[key]+'&'

    route = route[:-1]
    print route
    return verifyToken(route, email, client_hash, True)



if __name__ == '__main__':
    app.debug = True
    server = WebSocketServer(("", 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()


