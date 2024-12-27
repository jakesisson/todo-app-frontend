import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { todoListAtom } from '../store/atoms';

const AddEdit = () => {
    const [todos, setTodos] = useAtom(todoListAtom);
    const router = useRouter();
    const [form, setForm] = useState({ title: '', description: '', completed: false });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTodos([...todos, { id: todos.length + 1, ...form }]);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4 text-center">
                <h1 className="text-2xl font-bold">Add/Edit Todo</h1>
            </header>
            <main className="p-6">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
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
                    >
                        Save Todo
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddEdit;