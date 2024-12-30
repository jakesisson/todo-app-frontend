import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { todoListAtom } from '../store/atoms';

const AddEdit = () => {
    const [todos, setTodos] = useAtom(todoListAtom);
    const router = useRouter();
    const { id } = router.query;

    const [form, setForm] = useState({
        title: '',
        description: '',
        completed: false,
        dueDate: '',
        priority: 3, // Default priority level
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not authenticated. Please log in.');
            router.push('/login');
        }
    }, [router]);

    // Pre-fill the form if editing a todo
    useEffect(() => {
        if (id) {
            const todo = todos.find((t) => t.id === parseInt(id));
            if (todo) setForm(todo);
        }
    }, [id, todos]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        setLoading(true);
        setError('');

        try {
            const query = id
                ? `
                    mutation UpdateTodo($id: Int!, $title: String!, $description: String, $completed: Boolean!, $dueDate: String, $priority: Int!) {
                        updateTodo(
                            id: $id,
                            title: $title,
                            description: $description,
                            completed: $completed,
                            dueDate: $dueDate,
                            priority: $priority
                        ) {
                            id
                            title
                            description
                            completed
                            dueDate
                            priority
                        }
                    }
                `
                : `
                    mutation AddTodo($title: String!, $description: String, $completed: Boolean!, $dueDate: String, $priority: Int!) {
                        addTodo(
                            title: $title,
                            description: $description,
                            completed: $completed,
                            dueDate: $dueDate,
                            priority: $priority
                        ) {
                            id
                            title
                            description
                            completed
                            dueDate
                            priority
                        }
                    }
                `;

            const variables = {
                id: id ? parseInt(id) : undefined,
                title: form.title,
                description: form.description || null,
                completed: form.completed,
                dueDate: form.dueDate || null,
                priority: form.priority,
            };

            const response = await fetch('http://localhost:3000/graphql', {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, variables }),
            });

            const { data, errors } = await response.json();

            if (errors) {
                throw new Error(errors[0]?.message || 'Something went wrong');
            }

            if (id) {
                setTodos(
                    todos.map((t) =>
                        t.id === parseInt(id) ? { ...t, ...data.updateTodo } : t
                    )
                );
            } else {
                setTodos([...todos, data.addTodo]);
            }

            router.push('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <header className="bg-gray-800 text-white p-4 text-center">
                <h1 className="text-2xl font-bold">{id ? 'Edit Todo' : 'Add Todo'}</h1>
            </header>
            <main className="p-6">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-6 rounded shadow-md space-y-4"
                >
                    <div>
                        <label className="block font-bold mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2 bg-gray-700 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={form.dueDate}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Priority</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded"
                        >
                            <option value="1">1 (High Priority)</option>
                            <option value="2">2</option>
                            <option value="3">3 (Medium Priority)</option>
                            <option value="4">4</option>
                            <option value="5">5 (Low Priority)</option>
                        </select>
                    </div>
                    <div>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name="completed"
                                checked={form.completed}
                                onChange={handleChange}
                            />
                            <span className="ml-2">Completed</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Todo'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddEdit;
