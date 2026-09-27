// 🔧 COMPONENTE DE DEBUG PARA DESENVOLVEDORES
import React from 'react';
import { adminCache } from './adminDebug';

interface AdminDebugPanelProps {
  stats: any;
  filters: any;
  performance?: { [key: string]: number };
}

export const AdminDebugPanel: React.FC<AdminDebugPanelProps> = ({
  stats,
  filters,
  performance,
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black/90 text-white text-xs p-4 rounded-lg z-aviso max-h-96 overflow-y-auto">
      <h4 className="font-bold mb-2 text-atencao">🔍 Admin Debug Panel</h4>

      <div className="mb-2">
        <strong>Filters Applied:</strong>
        <pre className="text-ok mt-1 text-xs">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>

      <div className="mb-2">
        <strong>Stats Summary:</strong>
        <div className="text-aviso">
          <div>Total: {stats?.total || 0}</div>
          <div>ByEpoch: {stats?.byEpoch?.length || 0} items</div>
          <div>ByInstrument: {stats?.byInstrument?.length || 0} items</div>
          <div>ByQuality: {stats?.byQuality?.length || 0} items</div>
        </div>
      </div>

      {performance && (
        <div>
          <strong>Performance:</strong>
          {Object.entries(performance).map(([key, value]) => (
            <div key={key} className="text-atencao">
              {key}: {value.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          console.log('🔍 Full Debug Data:', { stats, filters, performance });
          adminCache.clear();
          console.log('🗑️ Cache cleared');
        }}
        className="mt-2 px-2 py-1 bg-erro text-white rounded text-xs hover:bg-erro"
      >
        Log Full Data & Clear Cache
      </button>
    </div>
  );
};
