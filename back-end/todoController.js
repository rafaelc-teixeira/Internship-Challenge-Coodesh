let todos = require('./data');

const findAll = () => {
	return new Promise((resolve, reject) => {
		resolve(todos);
	});
};

const findById = (id) => {
	return new Promise((resolve, reject) => {
		const todo = todos.find((todo) => todo.id === id);
		if (todo) {
			resolve(todo);
		}
		else {
			reject(`Todo with id ${id} not found !`);
		}
	});
};

const deleteById = (id) => {
	return new Promise((resolve, reject) => {
		const newTodos = todos.filter((todo) => todo.id !== id);
		todos = [
			...newTodos
		];
		resolve({ message: 'Todo deleted successfully!!' });
	});
};

const create = (todo) => {
	return new Promise((resolve, reject) => {
		const newTodo = {
			id : Date.now().toString(),
			...todo
		};
		todos = [
			newTodo,
			...todos
		];
		resolve(newTodo);
	});
};

const updateById = async (id, body) => {
	try {
		const { title, description } = body;
		const todo = await findById(id);
		if (!todo) {
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'Todo not found!' }));
		}
		return new Promise((resolve, reject) => {
			const updatedTodo = {
				id,
				title       :
					title ? title :
					todo.title,
				description :
					description ? description :
					todo.description
			};
			const index = todos.findIndex((todo) => todo.id === id);
			todos[index] = updatedTodo;
			resolve(updatedTodo);
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	findAll,
	findById,
	deleteById,
	create,
	updateById
};