import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, MapPin, User } from 'lucide-react';

interface Program {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    coordinator: string;
    is_active: boolean;
}

const ProgramsManagement: React.FC = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        coordinator: ''
    });

    const fetchPrograms = async () => {
        const response = await fetch('/api/programs', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setPrograms(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProgram
            ? `/api/programs/${editingProgram.id}`
            : '/api/programs';
        const method = editingProgram ? 'PATCH' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        setShowForm(false);
        setEditingProgram(null);
        setFormData({ title: '', description: '', startDate: '', endDate: '', location: '', coordinator: '' });
        fetchPrograms();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this program?')) {
            await fetch(`/api/programs/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchPrograms();
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">School Programs</h2>
                    <p className="text-slate-500 mt-1">Manage ongoing and upcoming programs</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Program
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{editingProgram ? 'Edit Program' : 'Add Program'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-2"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border rounded-lg p-2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Coordinator</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.coordinator}
                                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => {
                                    setShowForm(false);
                                    setEditingProgram(null);
                                }} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg text-slate-800">{program.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{program.description}</p>
                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                            </div>
                            {program.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {program.location}
                                </div>
                            )}
                            {program.coordinator && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {program.coordinator}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                            <button onClick={() => {
                                setEditingProgram(program);
                                setFormData({
                                    title: program.title,
                                    description: program.description,
                                    startDate: program.startDate.split('T')[0],
                                    endDate: program.endDate.split('T')[0],
                                    location: program.location || '',
                                    coordinator: program.coordinator || ''
                                });
                                setShowForm(true);
                            }} className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => handleDelete(program.id)} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 ml-auto">
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
                {programs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No programs added yet. Click "Add Program" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramsManagement;