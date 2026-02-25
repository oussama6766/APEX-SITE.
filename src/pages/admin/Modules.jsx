import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, BookOpen, Layers } from 'lucide-react';

const DEFAULT_SECTIONS = ['Cours', 'TP', 'TD', 'Examens'];

function Modules() {
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModule, setCurrentModule] = useState(null);
    const [formData, setFormData] = useState({ name: '', group_id: '', description: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedGroup) fetchModules(selectedGroup);
        else setModules([]);
    }, [selectedGroup]);

    async function fetchInitialData() {
        try {
            const { data, error } = await supabase.from('groups').select('*, levels(name)').order('name');
            if (error) throw error;
            setGroups(data || []);
            if (data?.length > 0) setSelectedGroup(data[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchModules(groupId) {
        const { data } = await supabase.from('modules').select('*').eq('group_id', groupId).order('created_at');
        setModules(data || []);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (currentModule) {
                const { error } = await supabase.from('modules').update(formData).eq('id', currentModule.id);
                if (error) throw error;
            } else {
                // Create Module
                const { data: newModule, error: modErr } = await supabase
                    .from('modules')
                    .insert([formData])
                    .select()
                    .single();

                if (modErr) throw modErr;

                // Automatically create 4 sections
                const sectionsToInsert = DEFAULT_SECTIONS.map((name, index) => ({
                    module_id: newModule.id,
                    name,
                    order_index: index
                }));

                const { error: secErr } = await supabase.from('module_sections').insert(sectionsToInsert);
                if (secErr) throw secErr;
            }
            setIsModalOpen(false);
            fetchModules(selectedGroup);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('La suppression du module effacera toutes les sections et tous les fichiers associés.')) return;
        try {
            const { error } = await supabase.from('modules').delete().eq('id', id);
            if (error) throw error;
            fetchModules(selectedGroup);
            alert('Supprimé avec succès');
        } catch (error) {
            console.error('Error deleting module:', error.message);
            alert('Erreur lors de la suppression');
        }
    }

    const openModal = (mod = null) => {
        if (mod) {
            setCurrentModule(mod);
            setFormData({ name: mod.name, group_id: mod.group_id, description: mod.description || '' });
        } else {
            setCurrentModule(null);
            setFormData({ name: '', group_id: selectedGroup, description: '' });
        }
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner"></div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl shadow-black flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <BookOpen className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-primary-600/20 border border-primary-600/30 rounded-2xl flex items-center justify-center text-primary-500">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-serif uppercase tracking-tight">Gestion des <span className="text-primary-600">Modules</span></h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">Gérez les unités d'enseignement</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="bg-white/5 rounded-2xl border border-white/5 px-6 py-3 text-white outline-none focus:border-primary-600 transition-all font-medium text-sm min-w-[200px]"
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id} className="bg-slate-900">{g.levels?.name} - {g.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-900/10"
                    >
                        <Plus className="w-5 h-5" /> <span>Nouveau Module</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(m => (
                    <div key={m.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-primary-600/30 transition-all shadow-xl shadow-black group relative overflow-hidden">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-lg text-white uppercase tracking-tight">{m.name}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => openModal(m)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6 uppercase tracking-widest">{m.description || 'Pas de description'}</p>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[10px] text-primary-500 font-bold bg-primary-600/10 border border-primary-600/20 px-3 py-2 rounded-xl w-fit uppercase tracking-widest">
                                <Layers className="w-3 h-3" /> Structure: {DEFAULT_SECTIONS.join(', ')}
                            </div>
                            <button
                                onClick={async () => {
                                    const { data: existing } = await supabase.from('module_sections').select('id').eq('module_id', m.id);
                                    if (existing?.length === 0) {
                                        const toInsert = DEFAULT_SECTIONS.map((name, index) => ({
                                            module_id: m.id,
                                            name,
                                            order_index: index
                                        }));
                                        await supabase.from('module_sections').insert(toInsert);
                                        alert('Sections créées avec succès');
                                    } else {
                                        alert('Les sections existent déjà');
                                    }
                                }}
                                className="text-[10px] text-slate-500 hover:text-primary-600 underline text-left uppercase tracking-widest font-bold"
                            >
                                Réparer les sections manquantes
                            </button>
                        </div>
                    </div>
                ))}
                {modules.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-panel rounded-3xl border border-dashed border-white/5 bg-black/40">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/5" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Aucun module pour ce groupe.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                    <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{currentModule ? 'Modifier le module' : 'Nouveau module'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nom du module (ex: Physics 1)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Nom du module..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none min-h-[100px] transition-all"
                                    placeholder="Détails du module..."
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10">Enregistrer</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Modules;
