import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

function Groups() {
    const [groups, setGroups] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', level_id: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const [levelsRes, groupsRes] = await Promise.all([
                supabase.from('levels').select('*').eq('is_active', true),
                supabase.from('groups').select('*, levels(name)').order('created_at', { ascending: false })
            ]);

            if (levelsRes.error) throw levelsRes.error;
            if (groupsRes.error) throw groupsRes.error;

            setLevels(levelsRes.data || []);
            setGroups(groupsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (currentGroup) {
                const { error } = await supabase.from('groups').update(formData).eq('id', currentGroup.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('groups').insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving group:', error.message);
            alert('Erreur lors de l\'enregistrement');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;
        try {
            const { error } = await supabase.from('groups').delete().eq('id', id);
            if (error) throw error;
            fetchData();
            alert('Supprimé avec succès');
        } catch (error) {
            console.error('Error deleting group:', error.message);
            alert('Erreur lors de la suppression');
        }
    }

    const openModal = (group = null) => {
        if (group) {
            setCurrentGroup(group);
            setFormData({ name: group.name, level_id: group.level_id, description: group.description || '' });
        } else {
            setCurrentGroup(null);
            setFormData({ name: '', level_id: levels[0]?.id || '', description: '' });
        }
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner"></div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl shadow-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Users className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center text-primary-500 border border-primary-600/30">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-serif tracking-tight uppercase">Gestion des <span className="text-primary-600">Groupes</span></h1>
                        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Gérez vos groupes d'étude (ex: PC1, MATH2)</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-900/10 relative z-10"
                >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un groupe</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-primary-600/30 transition-all shadow-xl shadow-black relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{group.name}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openModal(group)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(group.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-primary-500 bg-primary-600/10 border border-primary-600/20 px-3 py-1.5 rounded-xl inline-block mb-4 uppercase tracking-widest">
                            Niveau: {group.levels?.name}
                        </p>
                        {group.description && <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase tracking-widest">{group.description}</p>}
                    </div>
                ))}
                {groups.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-panel rounded-3xl border border-dashed border-white/5 bg-black/40">
                        <Users className="w-16 h-16 mx-auto mb-4 text-white/5" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Aucun groupe trouvé.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                    <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{currentGroup ? 'Modifier le groupe' : 'Nouveau groupe'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nom du groupe (ex: PC pA)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Nom du groupe..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Niveau Académique</label>
                                <select
                                    required
                                    value={formData.level_id}
                                    onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 outline-none transition-all"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">Choisir un niveau...</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description (optionnel)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none min-h-[100px] transition-all"
                                    placeholder="Détails du groupe..."
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

export default Groups;
