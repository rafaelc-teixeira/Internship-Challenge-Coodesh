const mysql = require("mysql");
const http = require('http');
const Todo = require('./todoController');
const { getPostData } = require('./utils');

const mysqlConnection = mysql.createConnection({
	host : "192.168.0.6",
	user : "username",
	password : "password",
	database: "nodemysql"
});

//Teste controller
const findAll = () => {
	return new Promise((resolve, reject) => {
		let sql = 'SELECT * FROM podcast INNER JOIN ep on podcast.id_podcast = ep.podcast_id';
		let query = mysqlConnection.query(sql, (err, results) => {
			if (err){
				throw err;
			}
			console.log(results);
			resolve(results);			
		});
	});
};

const server = http.createServer(async (req, res) => {
	if (req.url === '/podcasts' && req.method === 'GET') {
		const todos = await findAll();
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(todos));
	}
	else if (req.url.match(/\/api\/todos\/([a-z A-Z 0-9]+)/) && req.method === 'GET') {
		try {
			const id = req.url.split('/')[3];
			const todo = await Todo.findById(id);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(todo));
		} catch (error) {
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Todo not found!' }));
		}
	}
	else if (req.url.match(/\/api\/todos\/([a-z A-Z 0-9]+)/) && req.method === 'DELETE') {
		try {
			const id = req.url.split('/')[3];
			await Todo.deleteById(id);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Todo deleted successfully!!!' }));
		} catch (error) {
			console.log(error);
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Todo not found!' }));
		}
	}
	else if (req.url.match(/\/api\/todos\/([a-z A-Z 0-9]+)/) && req.method === 'PATCH') {
		try {
			const body = await getPostData(req);
			const id = req.url.split('/')[3];
			const updatedTodo = await Todo.updateById(id, JSON.parse(body));
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(updatedTodo));
		} catch (error) {
			console.log(error);
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Todo not found!' }));
		}
	}
	else if (req.url === '/api/todos' && req.method === 'POST') {
		const body = await getPostData(req);
		const { title, description } = JSON.parse(body);
		const newTodo = await Todo.create({ title, description });
		res.writeHead(201, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(newTodo));
	}
	//Create database
	else if (req.url === '/createdb'){
		let sql = 'CREATE DATABASE nodemysql';
		mysqlConnection.query(sql, err => {
			if (err) {
				throw err;
			}
			res.end('Database Created');
		});
	}
	//Create Table Podcast
	else if (req.url === '/createpodcast'){
		let sql = 'CREATE TABLE podcast(id_podcast int AUTO_INCREMENT, name_podcast VARCHAR(255), thumbnail_podcast VARCHAR(255), url_podcast VARCHAR(255), qtdep INT(4), PRIMARY KEY(id_podcast))';
		mysqlConnection.query(sql, err => {
			if (err) {
				throw err;
			}
			res.end('Podcast table created');
		});
	}
	//Create table ep
	else if (req.url === '/createep'){
		let sql = 'CREATE TABLE ep(id_ep int AUTO_INCREMENT, podcast_id INT(4), name_ep VARCHAR(255), upload DATETIME, duracao TIME, thumbnail_ep VARCHAR(255), url_ep VARCHAR(255), viewed TINYINT(1), imported_t TIMESTAMP, PRIMARY KEY(id_ep))';
		mysqlConnection.query(sql, err => {
			if (err) {
				throw err;
			}
			res.end('Ep table created');
		});
	}
	//Insert podcast
	else if (req.url === '/insertpodcast'){
		let post = {
			name_podcast: 'Hipsters Ponto Tech',
			thumbnail_podcast: 'https://hipsters.tech/wp-content/uploads/2016/07/hipsters-logo.png',
			url_podcast: 'https://hipsters.tech',
			qtdep: 255
		};
		let sql = 'INSERT INTO podcast SET ?';
		let query = mysqlConnection.query(sql, post, err => {
			if (err) {
				throw err;
			}
			res.end('Podcast added');
		});		
	}
	//Insert eps
	else if (req.url === '/insertep'){
		const date1 = new Date("Wed, 27 July 2016 13:30:00");
		let post = {
			podcast_id: 1,
			name_ep: 'Vida de Agência – Hipsters #02 Bora FIIIII',
			upload: date1,
			duracao: '39:03',
			thumbnail_ep: 'http://hipsters.tech/wp-content/uploads/2016/08/Hipsters1.png',
			url_ep: 'https://hipsters.tech/tecnologias-no-nubank-hipsters-01/',
			viewed: 0,
			imported_t: new Date(Date.now())
		};
		let sql = 'INSERT INTO ep SET ?';
		let query = mysqlConnection.query(sql, post, err => {
			if (err) {
				throw err;
			}
			res.end('Ep added');
		});		
	}
	else {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ message: 'Route not found!' }));
	}
});

mysqlConnection.connect((err) => {
	if (err){
		throw err;
	}
	else{
		console.log("MySQL Connected!");
	}
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!!!`));