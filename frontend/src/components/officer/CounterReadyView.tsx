interface CounterReadyViewProps {
  counterNumber: number;
  onCallNext: () => void;
  loading?: boolean;
}

export default function CounterReadyView({
  counterNumber,
  onCallNext,
  loading = false,
}: CounterReadyViewProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex flex-col justify-between shadow-sm h-full">
      <div className="flex flex-col h-full justify-between items-center text-center">
        <div className="text-4xl bg-gray-100 w-20 h-20 flex items-center justify-center rounded-full mb-4">
          🔔
        </div>
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Ready to serve</h3>
          <p className="text-base font-semibold text-gray-600 max-w-xs leading-relaxed">
            Press "Call Next Ticket" to call the next customer to Counter {counterNumber}.
          </p>
        </div>
        <button
          onClick={onCallNext}
          disabled={loading}
          className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-extrabold text-xl py-5 rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md"
        >
          <span>🔔</span> {loading ? 'Calling...' : 'Call Next Ticket'}
        </button>
      </div>
    </div>
  );
}