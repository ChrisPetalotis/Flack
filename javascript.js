// set starting value of displayNames to []
if (!localStorage.getItem('displayName'))
	localStorage.setItem('displayName', ' ')

document.addEventListener('DOMContentLoaded', () => {
	const displayName = document.querySelector('#displayName');
	if (displayName == localStorage.getItem('displayName')
		
	localStorage.setItem('displayName', displayName);


	document.querySelector('#user').innerHTML = localStorage.getItem('displayName');
});