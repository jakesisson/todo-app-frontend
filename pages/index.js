import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAtom } from 'jotai';
import { todoListAtom } from '../store/atoms';
import { clsx } from 'clsx';
import Fuse from 'fuse.js';
import _ from 'lodash';

const Home = () => {
    const [todos, setTodos] = useAtom(todoListAtom);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCompleted, setFilterCompleted] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filteredTodos, setFilteredTodos] = useState([]);

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/users/1/todos')
            .then((res) => res.json())
            .then((data) => setTodos(data));
    }, []);

    useEffect(() => {
        let result = todos;

        // Search
        if (searchQuery) {
            const fuse = new Fuse(todos, { keys: ['title'], threshold: 0.4 });
            result = fuse.search(searchQuery).map(({ item }) => item);
        }

        // Filter
        if (filterCompleted !== 'all') {
            const isCompleted = filterCompleted === 'completed';
            result = result.filter((todo) => todo.completed === isCompleted);
        }

        // Sort
        result = _.orderBy(result, ['title'], [sortOrder]);

        setFilteredTodos(result);
    }, [searchQuery, filterCompleted, sortOrder, todos]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>ToDo App</title>
            </Head>
            <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center">
                <h1 className="text-4xl font-extrabold">ToDo App</h1>
            </header>
            <main className="p-8 max-w-4xl mx-auto">
                <div className="mb-6 space-y-6">
                    <input
                        type="text"
                        placeholder="Search Todos..."
                        className="p-3 border rounded w-full focus:ring focus:ring-blue-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex space-x-6">
                        <select
                            className="p-3 border rounded focus:ring focus:ring-blue-300"
                            value={filterCompleted}
                            onChange={(e) => setFilterCompleted(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="completed">Completed</option>
                            <option value="notCompleted">Not Completed</option>
                        </select>
                        <select
                            className="p-3 border rounded focus:ring focus:ring-blue-300"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="asc">Sort by Title: A-Z</option>
                            <option value="desc">Sort by Title: Z-A</option>
                        </select>
                    </div>
                </div>
                <ul className="space-y-6">
                    {filteredTodos.map((todo) => (
                        <li key={todo.id} className={clsx('p-6', 'bg-white', 'rounded-lg', 'shadow-lg', 'transition-transform', 'hover:scale-105')}>
                            <h2 className="text-2xl font-semibold text-gray-800">{todo.title}</h2>
                            <p className="text-gray-500">{todo.completed ? '✅ Completed' : '❌ Not Completed'}</p>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
};

export default Home;