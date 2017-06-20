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
#from Twidder import app


app = Flask(__name__)
bcrypt = Bcrypt(app)

current_sockets = {};
logged_in_users = {}


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
            logged_in_users[token] = email
            return jsonify({"success": True, "message": "Successfully signed in.", "data": token})
    except IndexError:
        return jsonify({"success": False, "message": "Incorrect username or password."})
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
    if token in logged_in_users:
        del logged_in_users[token]
        return jsonify({"success": True, "message": "You've been logged out."})
    else:
        return jsonify({"success": False, "message": "You gotta be logged in to log out."})


@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.form['token']
    new_password = request.form['new_password']
    old_password = request.form['old_password']


    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must be logged in to change password."})
    else:
        email = logged_in_users[token]
        cred = database_helper.get_user_password(email)
        hashed = cred['password']
        salt = cred['salt']
        if not bcrypt.check_password_hash(hashed, old_password + salt):
            return jsonify({"success": False, "message": "Incorrect password."})
        else:
            database_helper.update_password(email, bcrypt.generate_password_hash(new_password + salt))
            return jsonify({"success": True, "message": "Password changed!"})


@app.route('/data-by-token/<token>', methods=['GET'])
def get_user_data_by_token(token):
    email = logged_in_users.get(token)
    if email is None:
        return jsonify({"success": False, "message": "No such token."})
    else:
        data = database_helper.get_user_data(email)
        return jsonify({"success": True, "message": "Ok!", "data": data})


@app.route('/data-by-email/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token, email):
    data = database_helper.get_user_data(email)
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "Token invalid."})
    elif not data:
        return jsonify({"success": False, "message": "No such email."})
    else:
        return jsonify({"success": True, "message": "Ok!", "data": data})

@app.route('/messages-by-token/<token>', methods=['GET'])
def get_user_messages_by_token(token):
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You must login to access this data."})
    else:
        email = logged_in_users[token]
        messages = database_helper.get_user_messages(email)
        if not messages:
            return jsonify({"success": True, "message": "No messages so far."})
        else:
            return jsonify({"success": True, "message": "Messages exists.", "data": messages})

@app.route('/messages-by-email/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token, email):
    messages = database_helper.get_user_messages(email)
    if token not in logged_in_users:
        return jsonify({"success": False, "message": "Token invalid."})
    elif not messages:
        return jsonify({"success": False, "message": "No messages."})
    else:
        return jsonify({"success": True, "message": "Ok!", "data": messages})

@app.route('/post', methods=['POST'])
def post_message():
    message = request.form['message']
    token = request.form['token']
    to_user = request.form['email']
    if token in logged_in_users:
        from_user = logged_in_users[token]
        try:
            database_helper.add_message(message, from_user, to_user)
            return jsonify({"success": True, "message": "Message posted."})
        except sqlite3.Error:
            return jsonify({"success": False, "message": "Couldn't post message."})
    else:
        return jsonify({"success": False, "message": "Not logged in."})

@app.route('/is-logged-in/<token>', methods=['GET'])
def is_logged_in(token):
    if token in logged_in_users:
        return jsonify({"success": True, "message": True})
    else:
        return jsonify({"success": True, "message": False})


@app.route('/logged-in-users', methods=['GET'])
def show_logged_in_users():
    return str(logged_in_users)


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


if __name__ == '__main__':
    app.debug = True
    server = WebSocketServer(("", 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()


