import sqlite3
from flask import g, jsonify
from server import app


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('database.db')
    return db



def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = [dict((cur.description[i][0], value) \
               for i, value in enumerate(row)) for row in cur.fetchall()]
    cur.close()
    return (rv[0] if rv else None) if one else rv



def get_user_data(email):
    user_data = query_db('select email, firstname, familyname, gender, city, country from users where email=? ',
                         [email])
    return user_data[0]


def get_user_messages(email):
    messages = query_db('select id, content, toUser, fromUser from messages where toUser=? order by id desc',
                        [email])
    return messages


def update_password(email, password):
    response = query_db('update users set password=? where email=?',
                        [password, email])
    get_db().commit()
    return response


def add_user(email, password, firstname, familyname, gender, city, country):
    query_db('insert into users values (?, ?, ?, ?, ?, ?, ?)',
             [email, password, firstname, familyname, gender, city, country])
    get_db().commit()


def add_message(message, from_user, to_user):
    response = query_db('insert into messages(content, toUser, fromUser) values (?, ?, ?)',
                        [message, to_user, from_user])
    get_db().commit()
    return response


def is_valid_login(email, password):
    user = query_db('select password, email from users where email=? and password=?',
                    [email, password])
    if user:
        return True
    else:
        return False
