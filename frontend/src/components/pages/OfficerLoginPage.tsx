import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Counters defined in the backend seed (backend has no endpoint to list them yet)
const COUNTERS = [1, 2, 3];

export default function OfficerLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [counter, setCounter] = useState<number>(COUNTERS[0]);
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // TODO: validate credentials against the backend once an officer role exists
    localStorage.setItem('isOfficerAuthenticated', 'true');
    navigate(`/counter/${counter}`);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
      <span className="text-xs font-extrabold text-gray-500 tracking-wider block mb-1">STAFF ACCESS</span>
      <h2 className="text-3xl font-black mb-6 text-gray-900">Officer Login</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
            Badge ID / Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg font-bold text-gray-900 focus:border-blue-600 outline-none"
            placeholder="e.g. officer_1"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg font-bold text-gray-900 focus:border-blue-600 outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
            Counter
          </label>
          <select
            value={counter}
            onChange={(e) => setCounter(Number(e.target.value))}
            className="w-full p-3 border-2 border-gray-200 rounded-lg font-bold text-gray-900 focus:border-blue-600 outline-none bg-white"
          >
            {COUNTERS.map((n) => (
              <option key={n} value={n}>
                Counter {n}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg py-4 rounded-lg transition-colors mt-2 cursor-pointer shadow-md"
        >
          Sign In to Workstation
        </button>
      </form>
    </div>
  );
}