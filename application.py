import os
import re

from flask import Flask, session, render_template, url_for, redirect, request, jsonify
# from flask_socketio import SocketIO, emit
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
# socketio = SocketIO(app)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# list of channels that have been created
channels = {'gators':['yo','this is awesome','!']}
# displayName that the user provided
name = ""

@app.route("/", methods=["GET", "POST"])
def index():
	if request.method == "POST":

		# get the display name the user typed in
		displayName = request.form.get("displayName")
		
		# make sure the user typed in a name, otherwise reload page
		if not re.search('[a-zA-Z]', displayName):
			return redirect(url_for("index"))
		
		# update name's value
		global name
		name = displayName

		# if displayName created successfully go to get-started page
		return redirect(url_for("get_started"))
	else:
		return render_template("index.html")

# create new channel or join an existing one
@app.route("/get-started")
def get_started():
	return render_template("get_started.html", user=name)

@app.route("/get-started/create-new-channel", methods=["GET", "POST"])
def create_channel():
	if request.method == "POST":
		
		# get the channel name the user typed in
		channelName = request.form.get("channelName")
		# make sure the user typed in a name for a new channel
		if not re.search('[a-zA-Z]',channelName):
			return redirect(url_for("create_channel"))
		# make sure the channelName does not already exist
		if channelName in channels:
			return render_template("create_channel.html", message="There is already a channel with this name")
		
		# add the selected channelName in the dict of channels with an empty list of messages for each new channel
		channels[channelName] = []
		print("CHANNELS:")
		print(channels)
		return redirect(url_for("list_of_channels", channels=channels))
	else:
		return render_template("create_channel.html")


# @app.route("/get-started/select-channel")
# def select_channel():
# 	return	render_template("select-channel.html")


@app.route("/list-of-channels", methods=["GET", "POST"])
def list_of_channels():
	return render_template("list_of_channels.html",channels=channels)

@app.route("/messages", methods=["POST"])
def messages():

	""" Return the messages the selected channel """
	
	# Get the channel name that was sent with the request
	channel = request.form.get('channel')

	# Messages of the selected channel
	messages = channels[channel]

	# Check if the length of the list of messages is over 100
	if len(messages) > 1:
		# How larger is the length of the list than 100
		excess = len(messages) - 1;
		# Delete the excess amount of messages from the list
		for i in range (0, excess):
			del messages[0]


	return jsonify({"messages": messages})