const mysql = require("mysql");
const http = require('http');
const { getPostData } = require('./utils');

let Parser = require('rss-parser');
let parser = new Parser();

const mysqlConnection = mysql.createConnection({
	host : "192.168.0.5",
	user : "username",
	password : "password",
	database: "nodemysql"
});

//Teste controller
const findAllPodcasts = () => {
	return new Promise((resolve, reject) => {
		let sql = 'SELECT * FROM podcast';
		let query = mysqlConnection.query(sql, (err, results) => {
			if (err){
				throw err;
			}
			resolve(results);			
		});
	});
};

const findById = (id) => {
	return new Promise((resolve, reject) => {
		let sql = `SELECT * FROM podcast INNER JOIN ep on podcast.id_podcast = ${id} AND ep.podcast_id = ${id}`;
		let query = mysqlConnection.query(sql, (err, results) => {
			if (err){
				throw err;
			}
			resolve(results);			
		});
	});
};
//Get the total amount of a podcast episodes
const getQtd = (feed) => {
	let quantidade = 0;
	feed.items.forEach(item => {
		quantidade++;
	})
	return quantidade;
}

const create = async (url) => {
	try {
		let feed = await parser.parseURL(url.url);
		return new Promise((resolve, reject) => {
			//adição do podcast na tabela
			let postPodcast = {
				name_podcast: feed.title,
				thumbnail_podcast: feed.image.url,
				url_podcast: feed.link,
				qtdep: getQtd(feed)
			};
			let sql = 'INSERT INTO podcast SET ?';
			let query = mysqlConnection.query(sql, postPodcast, function (err, result, fields) {
				if (err) {
					reject(err);
				}
				const id_podcast = result.insertId;
				feed.items.forEach(item => {

					let post = {
						podcast_id: id_podcast,
						name_ep: item.title,
						upload: new Date(item.pubDate),
						duracao: item.itunes.duration,
						thumbnail_ep: item.itunes.image,
						url_ep: item.link,
						viewed: 0,
						imported_t: new Date(Date.now())
					};
					let sql = 'INSERT INTO ep SET ?';
					let query = mysqlConnection.query(sql, post, err => {
						if (err) {
							throw err;
						}
					});	
				});
				resolve("Podcast added");
			});
		})
	}
	catch (err)	{
		throw(err);
	}
};

const updateById = async (id) => {
	try {
		const todo = await findById(id);
		if (!todo) {
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Episode not found!' }));
		}
		return new Promise((resolve, reject) => {
			let sql = `UPDATE ep SET viewed = 1 WHERE id_ep = ${id}`;
			let query = mysqlConnection.query(sql, err => {
				if (err){
					reject(err);
				}
				resolve("Ep updated to viewed");
			});
		});
	} catch (err) {
		throw(err);
	}
};
//End of controllers

const server = http.createServer(async (req, res) => {
	if (req.url === '/podcasts' && req.method === 'GET') {
		const todos = await findAllPodcasts();
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(todos));
	}
	else if (req.url === '/' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({"message": "Welcome to DevCast API"}));
	}
	else if (req.url.match(/\/podcasts\/([a-z A-Z 0-9]+)\/episodies/) && req.method === 'GET') {
		try {
			const id = req.url.split('/')[2];
			const todo = await findById(id);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(todo));
		} catch (error) {
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Podcast not found!' }));
		}
	}
	else if (req.url.match(/\/episodies\/([a-z A-Z 0-9]+)\/read/) && req.method === 'PUT') {
		try {
			const id = req.url.split('/')[2];
			const updatedTodo = await updateById(id);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(updatedTodo));
		} catch (error) {
			console.log(error);
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Podcast not found!' }));
		}
	}
	else if (req.url === '/podcasts' && req.method === 'POST') {
		const body = await getPostData(req);
		const newTodo = await create(JSON.parse(body));
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
			name_podcast: 'Lambda3 Podcast (técnico)',
			thumbnail_podcast: 'https://blog.lambda3.com.br/wp-content/uploads/2016/04/itunes_lambda3.jpg',
			url_podcast: 'https://www.lambda3.com.br/blog-en/',
			qtdep: 244
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
		const date1 = new Date("Fri, 23 Apr 2021 13:00:49 +0000");
		let post = {
			podcast_id: 2,
			name_ep: 'Lambda3 Podcast 240 – Introdução React',
			upload: date1,
			duracao: '1:19:53',
			thumbnail_ep: 'https://www.lambda3.com.br/wp-content/uploads//2021/04/Podcasts_lambda_244-600x600.jpg',
			url_ep: 'https://www.lambda3.com.br/2021/04/lambda3-podcast-244-conteudo-tecnico-em-portugues/',
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
		res.end(JSON.stringify({ message: 'Route not found!', request: req.url }));
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