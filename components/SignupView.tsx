import React, { useState } from 'react';
// FIX: The path alias '@/' is used to maintain consistency.
import { TeamMember } from '@/types';

interface SignupViewProps {
  // FIX: Update the 'onSignup' prop type to reflect the new TeamMember interface, which now includes a 'password'.
  onSignup: (newMemberData: Omit<TeamMember, 'id' | 'isAdmin'>) => boolean;
  onSwitchToLogin: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatar(result);
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.');
        return;
    }

    // FIX: Pass the password to the onSignup function to align with the updated TeamMember type. This resolves the error on the 'password' property.
    const success = onSignup({
      name,
      role,
      email,
      password,
      avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
    });

    if (!success) {
      setError('이미 사용 중인 이메일입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600"><i className="fas fa-tasks mr-2"></i> ProjectFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">새 계정을 만들어 팀에 합류하세요.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">이름</label>
                    <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">직책</label>
                    <input id="role" type="text" required value={role} onChange={(e) => setRole(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">이메일 주소</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호 확인</label>
                    <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">프로필 사진</label>
                    <div className="mt-1 flex items-center space-x-4">
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                            {avatarPreview ? (
                                <img className="h-full w-full object-cover" src={avatarPreview} alt="Avatar preview" />
                            ) : (
                                <svg className="h-full w-full text-slate-300 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </span>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-white dark:bg-slate-700 py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                            <span>사진 선택</span>
                            <input id="avatar-upload" name="avatar" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div>
                    <button type="submit" className="w-full btn-primary mt-2">회원가입</button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                이미 계정이 있으신가요?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
                    로그인
                </button>
            </p>
        </div>
      </div>
       {/* FIX: Removed invalid 'jsx' prop from style tag. */}
       <style>{`
        .input-field {
            appearance: none;
            display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #cbd5e1; /* slate-300 */
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            background-color: white;
        }
        .dark .input-field {
            border-color: #475569; /* slate-600 */
            background-color: #334155; /* slate-700 */
        }
        .input-field:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 2px #a5b4fc; /* indigo-300 */
            border-color: #6366f1; /* indigo-500 */
        }
        .btn-primary {
            display: flex;
            width: 100%;
            justify-content: center;
            padding: 0.5rem 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            font-size: 0.875rem;
            font-weight: 500;
            color: white;
            background-color: #4f46e5; /* indigo-600 */
        }
        .btn-primary:hover {
            background-color: #4338ca; /* indigo-700 */
        }
      `}</style>
    </div>
  );
};

export default SignupView;
