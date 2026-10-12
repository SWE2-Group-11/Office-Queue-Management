import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CounterReadyView from './CounterReadyView';
import CounterActiveCallView from './CounterActiveCallView';
import { callNextTicket } from '../../api/officer';
import { loginDevice, ApiError } from '../../api/client';
import Header from '../common/Header';

export default function OfficerWorkstation() {
  const { counterId } = useParams<{ counterId: string }>();


  const currentCounter = Number(counterId);
  const validCounter = Number.isInteger(currentCounter) && currentCounter > 0;

  const [activeTicket, setActiveTicket] = useState<{ code: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: replace with a real officer login once the backend has an officer role.
  // The counters route currently requires the "device" session.
  useEffect(() => {
    loginDevice().catch(() => setError('Cannot log in to the server'));
  }, []);

  // Changing counter in the URL must not keep the previous counter's ticket
  useEffect(() => {
    setActiveTicket(null);
  }, [counterId]);

  const handleCallNext = async () => {
    if (loading || !validCounter) return;
    setLoading(true);
    setError(null);
    try {
      const ticket = await callNextTicket(currentCounter);
      if (!ticket) {
        setError('No customers waiting for this counter');
        return;
      }
      setActiveTicket({ code: ticket.code });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cannot reach the server');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-gray-900">
      <Header />

      {!validCounter && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 font-bold text-sm">
          ⚠️ Invalid counter
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 font-bold text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="mt-3flex justify-between items-center mb-4">
        <span className="text-xs font-extrabold text-gray-500 tracking-wider">
          OFFICER WORKSTATION · COUNTER {validCounter ? currentCounter : '?'}
        </span>
       {/*  <button
          onClick={handleSwitchCounter}
          className="text-xs font-extrabold text-gray-600 hover:text-gray-900 underline cursor-pointer"
        >
          Sign out / switch counter
        </button>*/}
      </div>

      <div className="max-w-2xl mx-auto">
        {!activeTicket ? (
          <CounterReadyView
            counterNumber={currentCounter}
            onCallNext={handleCallNext}
            loading={loading}
          />
        ) : (
          <CounterActiveCallView
            counterNumber={currentCounter}
            ticketCode={activeTicket.code}
            onComplete={() => setActiveTicket(null)}
          />
        )}
      </div>
    </div>
  );
}