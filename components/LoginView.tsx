import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => boolean;
  onSwitchToSignup: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, password);
    if (!success) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600"><i className="fas fa-tasks mr-2"></i> ProjectFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">프로젝트 관리를 시작하려면 로그인하세요.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">이메일 주소</label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        로그인
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                계정이 없으신가요?{' '}
                <button onClick={onSwitchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500">
                    회원가입
                </button>
            </p>
             <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                <b>데모 계정:</b><br/>
                Admin: admin@projectflow.com / admin123<br/>
                일반 사용자: cskim@example.com / password123
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
