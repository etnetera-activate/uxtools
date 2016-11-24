var net = require('net');
var	util = require('util');
var	sleep = require('sleep');
var	io = require('socket.io').listen(8080, {log: false});
var	connectionOptions = {
		ip: 'localhost',
		port: 6555
	};

if ((process.argv.length>2)&&(process.argv[2]=='simulate')){
	console.log("Starting simulator");
	var xmax = 1600,
		ymax = 1000;

	setInterval(function() {
		var data = {avg:{
						x:Math.floor(Math.random() * xmax),
						y:Math.floor(Math.random() * ymax),
					},
					fix:true
				}
		handleFrameData(data);
		}, 30);

} else {

	var socket = net.createConnection(connectionOptions, function() {
		setInterval(function() {
			socket.write(JSON.stringify({
			    "category": "heartbeat"
			}));
		}, 2000);


	console.log('Socket on port '+connectionOptions.port+' (TheEyeTribe server) connected');

	socket.on('error', function(data) {
		console.log('TheEyeTribe error', data);
	})

	socket.on('close', function(data) {
		console.log('TheEyeTribe close');
	})

	socket.on('data', function(data) {
			try {
				data = JSON.parse(data);
				if(data.values && data.values.frame) {
					handleFrameData(data.values.frame);
				}
			} catch(e) {
				console.error('Malformed JSON', e);
			}
	})

	socket.write(JSON.stringify({
			category: 'tracker',
			request: 'set',
			values: {push: true}
		}));
	});

	socket.setEncoding('utf8');
}

function handleFrameData(data) {
	console.log(data.avg.x+'\t\t'+data.avg.y);
	io.sockets.emit('frame', data);
}