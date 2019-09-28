import os
import re

from flask import Flask, session, render_template, url_for, redirect, request, jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session
from collections import deque

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# list of usernames
USERS = {}

# list of channels
CHANNELS = {}

@app.route("/")
def index():
	return render_template("homepage.html")

@socketio.on('add username')
def add_username(data):
	username = data['username']
	# if username in USERS: 
	# 	print('Username already exists')
	# 	emit('existing username')
	# 	return False
	# else:
	global CUR_CHANNEL
	CUR_CHANNEL = ''
	USERS[username] = request.sid


@socketio.on('create channel')
def create_channel(data):
	channel_name = data['channel_name']
	if channel_name in CHANNELS:
		emit('existing channel')
		return False

	global CUR_CHANNEL
	CUR_CHANNEL = channel_name
	# add channel_name in CHANNELS with an empty list of messages for each new channel
	CHANNELS[channel_name] = deque([], maxlen=100)
	emit('new channel', {'channel_name': channel_name}, broadcast=True)
	print("CHANNELS: ")
	print(CHANNELS)

@socketio.on('get channels')
def get_channels():
	emit('show channels', list(CHANNELS.keys()))


@socketio.on('send message')
def send(data):
	# Get the message that was sent
	message = data['message']
	# Get the messages of the current channel
	messages = CHANNELS[data['channel']]
	# Add the new message in the list of messages
	messages.append(message)
	# Emit the new message to all the USERS that are on this channel at the moment
	emit('new message', data, broadcast=True)


@socketio.on('get messages')
def get_messages(data):
	messages = CHANNELS[data['channel']]
	emit('show messages', {'message': list(messages), 'channel': data['channel']})