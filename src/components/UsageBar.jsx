import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function UsageBar({ usage, isPaid }) {
  if (!usage) return null;

  const FREE_LIMIT = 50000;
  const tokensUsed = usage.tokens_used_this_month || 0;
  const percentUsed = Math.min((tokensUsed / FREE_LIMIT) * 100, 100);
  const isNearLimit = percentUsed >= 80;
  const hasExceeded = percentUsed >= 100;

  if (isPaid) {
    return (
      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 font-medium">
          ✓ Unlimited usage (Paid Account)
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Monthly Token Usage</h3>
          <p className="text-xs text-slate-600 mt-1">
            {tokensUsed.toLocaleString()} / {FREE_LIMIT.toLocaleString()} tokens
          </p>
        </div>
        {hasExceeded && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">Limit Exceeded</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            hasExceeded
              ? 'bg-red-600'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-600'
          }`}
          style={{ width: `${percentUsed}%` }}
        ></div>
      </div>

      {/* Warning Message */}
      {hasExceeded && (
        <p className="mt-2 text-xs text-red-600">
          You've reached your free monthly limit. Upgrade coming soon!
        </p>
      )}
      {isNearLimit && !hasExceeded && (
        <p className="mt-2 text-xs text-yellow-600">
          You're using {Math.round(percentUsed)}% of your monthly limit.
        </p>
      )}
    </div>
  );
}
