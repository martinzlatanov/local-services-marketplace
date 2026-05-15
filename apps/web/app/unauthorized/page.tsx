export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-auth)] p-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-status-error-50 mb-4">
            <span className="text-2xl font-bold text-status-error-700">403</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Access Denied</h1>
          <p className="text-surface-600 mb-6">
            You do not have permission to access this page.
            Administrator privileges are required.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-btn)] bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
