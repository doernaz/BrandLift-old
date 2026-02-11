import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash, Save, Send, Image, Layout, Tag } from 'lucide-react';

export const EmailEngineTile = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    // Editor State
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        headerImage: '',
        event: 'New Sandbox Created',
        body: ''
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        const res = await fetch('/api/email/templates');
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0 && !selectedId) handleSelect(data[0]);
    };

    const handleSelect = (tpl: any) => {
        setSelectedId(tpl.id);
        setFormData(tpl);
    };

    const handleNew = () => {
        setSelectedId(null);
        setFormData({
            name: 'New Template',
            subject: '',
            headerImage: '',
            event: 'New Sandbox Created',
            body: ''
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/email/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: selectedId })
            });
            await loadTemplates();
            alert('Template Saved');
        } catch (e) {
            alert('Save Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedId || !confirm('Are you sure?')) return;
        setLoading(true);
        try {
            await fetch(`/api/email/templates/${selectedId}`, { method: 'DELETE' });
            await loadTemplates();
            handleNew();
        } catch (e) {
            alert('Delete Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        if (!testEmail) return alert('Enter a test email address');
        try {
            const res = await fetch('/api/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: selectedId, email: testEmail })
            });
            const data = await res.json();
            alert(data.message);
        } catch (e) {
            alert('Test Failed');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[500px] md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Mail className="w-4 h-4" /> BrandLift Email Engine
            </h3>

            <div className="flex bg-slate-950 border border-slate-800 rounded-lg flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-slate-800 p-2 flex flex-col">
                    <button
                        onClick={handleNew}
                        className="bg-pink-900/20 hover:bg-pink-900/40 text-pink-300 text-xs py-2 rounded mb-2 border border-pink-900/50 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> New Template
                    </button>
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                        {templates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => handleSelect(t)}
                                className={`text-xs p-2 rounded cursor-pointer truncate ${selectedId === t.id ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                            >
                                {t.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="w-2/3 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Template Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-xs focus:border-pink-500 outline-none"
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Trigger Event</label>
                            <select
                                value={formData.event}
                                onChange={e => setFormData({ ...formData, event: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-xs focus:border-pink-500 outline-none"
                            >
                                <option>New Sandbox Created</option>
                                <option>Payment Received</option>
                                <option>Hosting Delinquent</option>
                                <option>Support Ticket Updated</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Email Subject</label>
                        <input
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-xs focus:border-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1 flex items-center gap-1"><Image className="w-3 h-3" /> Header Image URL (Optional)</label>
                        <input
                            value={formData.headerImage}
                            onChange={e => setFormData({ ...formData, headerImage: e.target.value })}
                            placeholder="https://brandlift.ai/assets/header.png"
                            className="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-xs focus:border-pink-500 outline-none"
                        />
                    </div>

                    <div className="flex-1 min-h-[150px]">
                        <label className="text-[10px] uppercase text-slate-500 block mb-1 flex items-center gap-1"><Layout className="w-3 h-3" /> Body Content</label>
                        <textarea
                            value={formData.body}
                            onChange={e => setFormData({ ...formData, body: e.target.value })}
                            className="w-full h-full bg-slate-900 border border-slate-700 text-slate-300 p-2 rounded text-xs font-mono focus:border-pink-500 outline-none resize-none"
                        />
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded text-[10px] text-slate-500 flex flex-wrap gap-2">
                        <Tag className="w-3 h-3" />
                        <span className="font-mono text-pink-400 hover:underline cursor-pointer" title="Client's Name">{`{{client_name}}`}</span>
                        <span className="font-mono text-pink-400 hover:underline cursor-pointer" title="Website Domain">{`{{domain}}`}</span>
                        <span className="font-mono text-pink-400 hover:underline cursor-pointer" title="SSO Login Link">{`{{login_url}}`}</span>
                        <span className="font-mono text-pink-400 hover:underline cursor-pointer" title="Invoice Amount">{`{{amount}}`}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-auto">
                        <div className="flex gap-2 items-center">
                            <input
                                value={testEmail}
                                onChange={e => setTestEmail(e.target.value)}
                                placeholder="test@brandlift.ai"
                                className="bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-xs w-32"
                            />
                            <button onClick={handleTest} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded">
                                <Send className="w-3 h-3" /> Test
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {selectedId && (
                                <button onClick={handleDelete} className="text-red-400 hover:text-red-300 p-1">
                                    <Trash className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-1 rounded text-xs font-bold flex items-center gap-2"
                            >
                                <Save className="w-3 h-3" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <Mail className="w-32 h-32 text-pink-500" />
            </div>
        </div>
    );
};
