import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAtom } from 'jotai';
import { todoListAtom } from '../store/atoms';
import { clsx } from 'clsx';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // Enables interactions like clicking events
import Modal from 'react-modal';

Modal.setAppElement('#__next'); // For accessibility

const Home = () => {
    const [todos, setTodos] = useAtom(todoListAtom);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCompleted, setFilterCompleted] = useState('all');
    const [sortOption, setSortOption] = useState('titleAsc');
    const [filteredTodos, setFilteredTodos] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false); // Toggle between list and calendar view
    const [selectedTodo, setSelectedTodo] = useState(null); // For modal display
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [error, setError] = useState('');
    const router = useRouter();

    // Fetch Todos with Authentication
    useEffect(() => {
        async function fetchTodos() {
            try {
                const token = localStorage.getItem('authToken');
                console.log('Token: ', token)
                if (!token) {
                    alert('You are not authenticated. Please log in.');
                    return router.push('/login');
                }

                const response = await fetch('http://localhost:3000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                getTodos {
                                    id
                                    title
                                    description
                                    completed
                                    dueDate
                                    priority
                                }
                            }
                        `,
                    }),
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('Session expired. Please log in again.');
                        localStorage.removeItem('authToken');
                        return router.push('/login');
                    }
                    throw new Error('Failed to fetch todos');
                }

                const { data } = await response.json();
                setTodos(data.getTodos);
            } catch (error) {
                console.error('Error fetching todos:', error);
                setError('Failed to fetch todos. Please try again.');
            }
        }

        fetchTodos();
    }, [setTodos]);

    // Filter and Sort Logic
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
        switch (sortOption) {
            case 'titleAsc':
                result = _.orderBy(result, ['title'], ['asc']);
                break;
            case 'titleDesc':
                result = _.orderBy(result, ['title'], ['desc']);
                break;
            case 'priorityAsc':
                result = _.orderBy(result, ['priority'], ['asc']);
                break;
            case 'priorityDesc':
                result = _.orderBy(result, ['priority'], ['desc']);
                break;
            case 'dueDateAsc':
                result = _.orderBy(result, ['dueDate'], ['asc']);
                break;
            case 'dueDateDesc':
                result = _.orderBy(result, ['dueDate'], ['desc']);
                break;
            case 'priorityAndDueDate':
                result = _.orderBy(result, ['priority', 'dueDate'], ['asc', 'asc']);
                break;
            default:
                break;
        }

        setFilteredTodos(result);
    }, [searchQuery, filterCompleted, sortOption, todos]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('You are not authenticated. Please log in.');
                return router.push('/login');
            }

            const response = await fetch('http://localhost:3000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `mutation { deleteTodo(id: ${id}) }`,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    return router.push('/login');
                }
                throw new Error('Failed to delete todo');
            }

            setTodos(todos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert('Failed to delete todo. Please try again.');
        }
    };

    const handleEventClick = (event) => {
        const todo = todos.find((t) => t.id.toString() === event.event.id);
        setSelectedTodo(todo);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTodo(null);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1:
                return 'bg-red-500 text-white';
            case 2:
                return 'bg-orange-500 text-white';
            case 3:
                return 'bg-yellow-500 text-black';
            case 4:
                return 'bg-green-500 text-white';
            case 5:
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    const events = todos
        .filter((todo) => todo.dueDate) // Only include todos with dueDate
        .map((todo) => ({
            id: todo.id.toString(),
            title: todo.title,
            start: new Date(todo.dueDate),
            backgroundColor: getPriorityColor(todo.priority).split(' ')[0], // Use backgroundColor based on priority
        }));

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Head>
                <title>ToDo App</title>
            </Head>
            <header className="bg-gray-800 text-white p-6 text-center">
                <h1 className="text-4xl font-extrabold">ToDo App</h1>
            </header>
            <main className="p-8 max-w-4xl mx-auto">
                <div className="mb-6 space-y-6">
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700"
                    >
                        {showCalendar ? 'Show List View' : 'Show Calendar View'}
                    </button>
                    <button
                        onClick={() => router.push('/add-edit')}
                        className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                    >
                        Create New Todo
                    </button>
                    {!showCalendar && (
                        <>
                            <input
                                type="text"
                                placeholder="Search Todos..."
                                className="p-3 border rounded w-full focus:ring focus:ring-purple-400 bg-gray-800 text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="flex space-x-6">
                                <select
                                    className="p-3 border rounded focus:ring focus:ring-purple-400 bg-gray-800 text-white"
                                    value={filterCompleted}
                                    onChange={(e) => setFilterCompleted(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="completed">Completed</option>
                                    <option value="notCompleted">Not Completed</option>
                                </select>
                                <select
                                    className="p-3 border rounded focus:ring focus:ring-purple-400 bg-gray-800 text-white"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="titleAsc">Title: A-Z</option>
                                    <option value="titleDesc">Title: Z-A</option>
                                    <option value="priorityAsc">Priority: High to Low</option>
                                    <option value="priorityDesc">Priority: Low to High</option>
                                    <option value="dueDateAsc">Due Date: Earliest First</option>
                                    <option value="dueDateDesc">Due Date: Latest First</option>
                                    <option value="priorityAndDueDate">
                                        Priority and Due Date
                                    </option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {showCalendar ? (
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        eventClick={handleEventClick}
                        height="70vh"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth',
                        }}
                    />
                ) : (
                    <ul className="space-y-6">
                        {filteredTodos.map((todo) => (
                            <li
                                key={todo.id}
                                className={clsx(
                                    'p-6 bg-gray-800 rounded-lg shadow-lg transition-transform hover:scale-105'
                                )}
                            >
                                <h2 className="text-2xl font-semibold text-white">{todo.title}</h2>
                                <p className="text-gray-400">
                                    {todo.completed ? '✅ Completed' : '❌ Not Completed'}
                                </p>
                                <p className="mt-2 text-gray-400">
                                    Due Date: {todo.dueDate || 'No Due Date'}
                                </p>
                                <span
                                    className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(
                                        todo.priority
                                    )}`}
                                >
                                    Priority: {todo.priority || 'N/A'}
                                </span>
                                <div className="mt-4 space-x-4">
                                    <button
                                        onClick={() => router.push(`/add-edit?id=${todo.id}`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(todo.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {selectedTodo && (
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto mt-24 text-gray-200"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                    >
                        <h2 className="text-xl font-bold mb-4">{selectedTodo.title}</h2>
                        <p>{selectedTodo.description || 'No description'}</p>
                        <span
                            className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(
                                selectedTodo.priority
                            )}`}
                        >
                            Priority: {selectedTodo.priority || 'N/A'}
                        </span>
                        <button
                            onClick={closeModal}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Close
                        </button>
                    </Modal>
                )}
            </main>
        </div>
    );
};

export default Home;
