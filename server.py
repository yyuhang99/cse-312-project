import bcrypt
from pymongo import MongoClient
from flask import Flask, render_template, request, send_from_directory, make_response, redirect, session, url_for, jsonify
from markupsafe import escape
from util.auth import *
import html

app = Flask(__name__)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.secret_key = 'cse312secretkeymoment1612!'

# setting up database
mongo_client = MongoClient("mongo")
db = mongo_client["cse312"]

# user_collection stores user login information
user_collection = db["user"]
# auth_collection stores auth tokens along with username
auth_collection = db["auth"]

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response



@app.route('/')
@app.route('/index')
def index():
 # Retrieve error messages from session, if any
    register_error = session.pop('register_error', '')
    login_error = session.pop('login_error', '')

    # Get username from the authentication cookie
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)

    return render_template('index.html', username=username, register_error=register_error, login_error=login_error)

@app.route('/application')
def application():
    auth_token = request.cookies.get('auth')
    username = getUsername(auth_token, auth_collection)
    return render_template('application.html',username=username)

@app.route('/register',methods=["POST"])
def register():
    if request.method == "POST":
        return handleRegister(request, user_collection)

    else:
        return jsonify({'error': 'Method not allowed'}), 405

@app.route('/create_post', methods=['POST'])
def create_post():
    printMsg("Reached the create_post() route")  # Debug statement added
    content = request.form  # Corrected to match the id attribute in the HTML form
    #content = html.escape(content)
    #print(username)  # Debug statement added
    printMsg(content)  # Debug statement added
    # Validate data
   # if not username:
   #     return jsonify({'error': 'Username is required'}), 400
    if not content:
        return jsonify({'error': 'Post content is required'}), 400

    # Perform authentication (if needed)
    auth_token = request.cookies.get('auth')
    if not auth_token:
        return jsonify({'error': 'Authentication required'}), 401
    new_post = {
        'author': username,
        'content': content
    }

    return jsonify({'message': 'Post created successfully', 'author': username}), 201


@app.route('/login', methods=['POST'])
def login():
    return handleLogin(request, user_collection, auth_collection)

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(redirect(url_for("index")))
    removeAuthToken(request, response, auth_collection)
    return response

@app.route('/test')
def testRoute():
    return send_from_directory('static', 'holycow.png')

@app.route('/function')
def function():
    return send_from_directory('public', 'function.js')

 
@app.route('/print')
def printMsg(message):
    app.logger.info(message)
    return "Check your console"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)