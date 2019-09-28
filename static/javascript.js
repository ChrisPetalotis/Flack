
document.addEventListener('DOMContentLoaded', () => {
	// get username from localStorage and display it on the navigation bar
	get_username();
});	

const start = username => {
	// Connect to websocket
	let socket = io.connect(
		location.protocol + "//" + document.domain + ":" + location.port
	);

	socket.on('connect', () => {
		socket.emit('add username', {'username': username});
		
		// CAN'T MAKE IT WORK - LEAVE IT FOR LATER - it prompts but it does not store username in python dict
		socket.on('existing username', () => {
			console.log('this username already exists')
			document.querySelector('#modal_box').style.display = 'block'
			document.querySelector('.modal_header > h2').innerText = 'This username already exists'	
			document.querySelector('#select_username').innerText = 'Please select another username for your account'
		});

		// Update username on navigation bar
		document.querySelector("#user_nav").innerText = localStorage.getItem('username');

		create_channel(socket);

		socket.on('new channel', data => {
			show_channel(data['channel_name'], socket);
		});
		
		socket.on('existing channel', () => {
			alert('There is already a channel with this name');
		});

		socket.emit('get channels');
		
		socket.on('show channels', data => {
			// clear channel list
			document.querySelector("#channel_list").innerHTML = '';

			for (let channel of data)
				show_channel(channel, socket);
		});

		send_message(socket);

		socket.on('new message', data => {
			show_message(data['message']);
		});

		socket.emit('get messages', {'channel_name': localStorage.getItem('channel_name')});

		socket.on('show messages', data => {
			// clear message list
			document.querySelector('#message_list').innerHTML = '';
			// set the title of the channel to the channel name stored in local storage
			document.querySelector('#channel_title').innerText = localStorage.getItem('channel_name');
			for (let message of data)
				show_message(message, socket);			
		});
	});
}

// GET USERNAME
const get_username = () => {
	document.querySelector('#submit_modal').disabled = true;

	document.querySelector('#username_text').onkeyup = () => {
		// disable sumbit if user did not type anything and enable if there is something typed in the input field
		if (document.querySelector('#username_text').value.length > 0)
			document.querySelector('#submit_modal').disabled = false
		else
			document.querySelector('#submit_modal').disabled = true

		// if the user has not typed any characters, disable the prompt
		if ((/[a-zA-z_!?-]/).test(document.querySelector('#username_text').value) == false)
			document.querySelector('#submit_modal').disabled = true
	}


	document.querySelector('#username_form').onsubmit = (e) => {
		e.preventDefault();

		// check if there is a username stored in localStorage
		if (!localStorage.getItem('username'))
			localStorage.setItem('username','')

		// get the username the user has typed in the prompt
		let username = document.querySelector('#username_text').value;
		username = username.trim();
		// save username in localStorage
		localStorage.setItem('username', username)

		document.querySelector('#modal_box').style.display = 'none'	

		start(username);
	}
}

// CREATE CHANNEL
const create_channel = socket => { 
		let submit_channel = document.querySelector('#submit_channel');
		let channel_name_text = document.querySelector('#channel_name_text');

		// disable the submit button when first loading the page
		submit_channel.disabled = true;

		channel_name_text.onkeyup = () => {
			// disable sumbit if user did not type anything and enable if there is something typed in the input field
			if (channel_name_text.value.length > 0)
				submit_channel.disabled = false
			else
				submit_channel.disabled = true

			// if the user has not typed any letters, disable the prompt
			if ((/[a-zA-z]/).test(channel_name_text.value) == false)
				submit_channel.disabled = true

	}
	document.querySelector('#channel_name_form').onsubmit = e => {
		e.preventDefault();

		// check if there is a username stored in localStorage
		if (!localStorage.getItem('channel_name'))
			// set starting value of displayName to ''
			localStorage.setItem('channel_name','')

		// get the username the user has typed in the prompt
		let channel_name = channel_name_text.value;
		channel_name = channel_name.trim();
		// save channel_name in localStorage
		localStorage.setItem('channel_name', channel_name);

		socket.emit('create channel', {'channel_name': channel_name});

		channel_name_text.value = '';
	};
}

// SHOW CHANNEL
const show_channel = (channel, socket) => {
	const li = document.createElement('li');
	li.innerHTML = `<a id='channel_li'>${channel}</a>`;

	li.onclick = () => {
		// Make the clicked channel the one stored in local storage
		localStorage.setItem('channel_name', channel);

		socket.emit('get messages', {'channel_name': channel});
	}

	document.querySelector('#channel_list').append(li);
}

// SEND MESSAGE
const send_message = socket => {
	document.querySelector('#send_message').disabled = true;

	document.querySelector('#new_message').onkeyup = () => {
		// disable sumbit if user did not type anything and enable if there is something typed in the input field
		if (document.querySelector('#new_message').value.length > 0)
			document.querySelector('#send_message').disabled = false
		else
			document.querySelector('#send_message').disabled = true

		// if the user has not typed any letters or symbols, disable the prompt
		if ((/[a-z0-9._?!*-]/i).test(document.querySelector('#new_message').value) == false)
			document.querySelector('#send_message').disabled = true
	}

	// When Send is pressed emit a 'send message' event to the server
	document.querySelector('#new_message_form').onsubmit = e => {
		e.preventDefault();

		let message = document.querySelector('#new_message').value;
		let user = localStorage.getItem('username');
		let time = get_time();
		message = `${user}: ${message} (${time})`
		// message = `${user}: ${message} (${time})`
		socket.emit('send message', {'message': message});

		// Clear input field
		document.querySelector('#new_message').value = ''
	}
}

// SHOW MESSAGE
const show_message = (message) => {
	const li = document.createElement('li');
	li.innerHTML = message;
	document.querySelector('#message_list').append(li);
}

const get_time = () => {
	const fix_mins = (mins) => {
		if (mins < 10) 
	    	mins = "0" + mins;
		return mins;
	}

	// current time
	const today = new Date();
	const time = `${today.getHours()}:${fix_mins(today.getMinutes())}`;

	return time;
}