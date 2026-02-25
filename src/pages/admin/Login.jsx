import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/admin/dashboard');
            }
        });
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            setLoading(false);
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
            {/* Background Islamic Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23333333' stroke-width='1'%3E%3Cpath d='M40 0 L50 30 L80 40 L50 50 L40 80 L30 50 L0 40 L30 30 Z'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Cpath d='M0 0 L20 20 M60 20 L80 0 M0 80 L20 60 M60 60 L80 80'/%3E%3Ccircle cx='0' cy='0' r='10'/%3E%3Ccircle cx='80' cy='0' r='10'/%3E%3Ccircle cx='0' cy='80' r='10'/%3E%3Ccircle cx='80' cy='80' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] border border-white/5 z-10 mx-4 shadow-2xl shadow-black"
                dir="rtl"
            >
                <div className="text-center mb-10">
                    <div className="mx-auto w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/40 mb-8 group transition-transform hover:scale-105">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white font-serif tracking-tight">
                        مدخل <span className="text-primary-600">الآدمن</span>
                    </h2>
                    <p className="text-slate-500 mt-3 text-xs font-bold uppercase tracking-widest">منطقة محمية لـ CICADA</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-500 text-xs font-bold"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-600 group-focus-within:text-primary-500 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full rounded-2xl border border-white/5 bg-white/5 px-12 py-4 text-white placeholder-slate-600 focus:border-primary-600 focus:bg-white/10 focus:outline-none transition-all"
                                placeholder="votre@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-2">كلمة المرور</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-600 group-focus-within:text-primary-500 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full rounded-2xl border border-white/5 bg-white/5 px-12 py-4 text-white placeholder-slate-600 focus:border-primary-600 focus:bg-white/10 focus:outline-none transition-all"
                                placeholder="أدخل الرمز السري..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>دخول للنظام</span>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-white/5">
                        <p className="text-[10px] text-slate-600 font-medium">تأكد من إدخال بيانات الآدمن الصحيحة</p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AdminLogin;
