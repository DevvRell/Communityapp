import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Database, Plus, Pencil, Trash2, Search, RefreshCw, Loader2,
  AlertCircle, ChevronLeft, ChevronRight, ClipboardCheck, Table2,
} from 'lucide-react'
import { adminDataAPI, adminAPI, ApiClientError } from '../services/api'
import { useToast } from '../components/Toast'
import PageHeader from '../components/ui/PageHeader'
import RecordFormModal from '../components/admin/RecordFormModal'

const PAGE_SIZE = 25

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const formatCell = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  const s = String(value)
  // ISO timestamps -> friendly date
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return new Date(s).toLocaleDateString('en-US', { dateStyle: 'medium' })
  }
  return s.length > 60 ? s.slice(0, 57) + '…' : s
}

const StatusBadge = ({ value }) => {
  const cls =
    value === 'APPROVED' ? 'bg-green-100 text-green-800' :
    value === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
    value === 'REJECTED' ? 'bg-red-100 text-red-800' :
    'bg-gray-100 text-gray-700'
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{value}</span>
}

export default function AdminDataPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tables, setTables] = useState([])
  const [activeSlug, setActiveSlug] = useState(null)
  const [tablesError, setTablesError] = useState(null)

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [listError, setListError] = useState(null)

  const [editing, setEditing] = useState(null)   // { record } | { record: null } when modal open
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const activeTable = tables.find((t) => t.slug === activeSlug) || null

  const handleAuthError = useCallback((e) => {
    if (e instanceof ApiClientError && (e.statusCode === 403 || e.statusCode === 401)) {
      // 403 on a write may be a capability error, not auth — only bounce on the list/tables calls.
      adminAPI.logout()
      navigate('/admin/login', { replace: true })
      return true
    }
    return false
  }, [navigate])

  // Load table registry once.
  useEffect(() => {
    let cancelled = false
    adminDataAPI.listTables()
      .then((res) => {
        if (cancelled) return
        setTables(res.tables || [])
        const requested = searchParams.get('table')
        const requestedValid = requested && res.tables?.some((t) => t.slug === requested)
        setActiveSlug((prev) => prev || (requestedValid ? requested : res.tables?.[0]?.slug) || null)
      })
      .catch((e) => {
        if (cancelled) return
        if (!handleAuthError(e)) setTablesError(e.message || 'Failed to load tables.')
      })
    return () => { cancelled = true }
  }, [handleAuthError])

  const fetchRows = useCallback(async () => {
    if (!activeSlug) return
    setLoading(true)
    setListError(null)
    try {
      const res = await adminDataAPI.list(activeSlug, {
        page, limit: PAGE_SIZE, search: search.trim() || undefined, status: statusFilter || undefined,
      })
      setRows(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      if (!handleAuthError(e)) setListError(e.message || 'Failed to load records.')
    } finally {
      setLoading(false)
    }
  }, [activeSlug, page, search, statusFilter, handleAuthError])

  useEffect(() => { fetchRows() }, [fetchRows])

  // Reset paging/filters when switching tables.
  const selectTable = (slug) => {
    setActiveSlug(slug)
    setSearchParams({ table: slug }, { replace: true })
    setPage(1)
    setSearch('')
    setStatusFilter('')
    setConfirmingDelete(null)
  }

  const handleSave = async (data) => {
    if (!activeTable) return
    setSaving(true)
    try {
      if (editing.record) {
        await adminDataAPI.update(activeSlug, editing.record.id, data)
        toast.success(`${activeTable.label} #${editing.record.id} updated.`)
      } else {
        await adminDataAPI.create(activeSlug, data)
        toast.success(`${activeTable.label} record created.`)
      }
      setEditing(null)
      await fetchRows()
    } catch (e) {
      if (!handleAuthError(e)) toast.error(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    try {
      await adminDataAPI.remove(activeSlug, id)
      toast.success(`${activeTable.label} #${id} deleted.`)
      setConfirmingDelete(null)
      // Step back a page if we just removed the last row on it.
      if (rows.length === 1 && page > 1) setPage((p) => p - 1)
      else await fetchRows()
    } catch (e) {
      if (!handleAuthError(e)) toast.error(e.message || 'Delete failed.')
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const columns = activeTable?.listColumns || []

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        eyebrow="Admin Console"
        title={<>Manage <em className="text-gold-300">the data.</em></>}
        subtitle="Create, edit, and delete records across every table — no redeploy required."
        size="sm"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-2 text-sm text-cream-100 bg-forest-800/60 border border-cream-100/15 rounded-lg px-3 py-2 hover:bg-forest-800 transition-colors"
          >
            <ClipboardCheck size={15} /> Review queue
          </Link>
          <button
            onClick={fetchRows}
            disabled={loading || !activeSlug}
            className="inline-flex items-center gap-2 text-sm text-cream-100 bg-forest-800/60 border border-cream-100/15 rounded-lg px-3 py-2 hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {tablesError && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            <AlertCircle size={16} /> {tablesError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Table selector */}
          <aside className="lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-2">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-400 flex items-center gap-2">
                <Database size={13} /> Tables
              </p>
              <nav className="flex flex-col">
                {tables.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => selectTable(t.slug)}
                    className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.slug === activeSlug
                        ? 'bg-forest-900 text-cream-50 font-medium'
                        : 'text-forest-700 hover:bg-cream-100'
                    }`}
                  >
                    <Table2 size={14} className="shrink-0 opacity-70" />
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main panel */}
          <section>
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-4 mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={18} className="text-forest-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder={activeTable ? `Search ${activeTable.label.toLowerCase()}…` : 'Search…'}
                  className="input-field w-full py-2"
                  disabled={!activeTable}
                />
              </div>

              {activeTable?.hasSubmissionStatus && (
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                  className="input-field w-auto py-2"
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              )}

              <span className="text-sm text-forest-500">
                {loading ? 'Loading…' : `${total} record${total !== 1 ? 's' : ''}`}
              </span>

              {activeTable?.capabilities?.create && (
                <button
                  onClick={() => setEditing({ record: null })}
                  className="btn-primary flex items-center gap-1.5 text-sm ml-auto"
                >
                  <Plus size={16} /> Add new
                </button>
              )}
            </div>

            {/* States */}
            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-forest-600" size={32} />
              </div>
            )}

            {!loading && listError && (
              <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-12 text-center">
                <AlertCircle className="mx-auto text-red-400 mb-3" size={40} />
                <p className="text-forest-700 font-medium">Could not load records</p>
                <p className="text-sm text-forest-500 mt-1">{listError}</p>
              </div>
            )}

            {!loading && !listError && rows.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-12 text-center">
                <Database className="mx-auto text-forest-200 mb-3" size={40} />
                <p className="text-forest-600 font-medium">
                  {search || statusFilter ? 'No records match your filters.' : 'No records yet.'}
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !listError && rows.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-100/60 border-b border-forest-100 text-left">
                        {columns.map((col) => (
                          <th key={col} className="px-4 py-3 font-semibold text-forest-700 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right font-semibold text-forest-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const isConfirming = confirmingDelete === row.id
                        const isBusy = busyId === row.id
                        return (
                          <tr key={row.id} className="border-b border-forest-50 hover:bg-cream-50/60">
                            {columns.map((col) => (
                              <td key={col} className="px-4 py-3 text-forest-700 align-top">
                                {col === 'submissionStatus'
                                  ? <StatusBadge value={row[col]} />
                                  : formatCell(row[col])}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                {isConfirming ? (
                                  <>
                                    <span className="text-xs text-red-600 font-medium">Delete?</span>
                                    <button
                                      onClick={() => handleDelete(row.id)}
                                      disabled={isBusy}
                                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setConfirmingDelete(null)}
                                      disabled={isBusy}
                                      className="text-xs text-forest-500 hover:text-forest-700 px-2 py-1.5"
                                    >
                                      No
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {activeTable?.capabilities?.update && (
                                      <button
                                        onClick={() => setEditing({ record: row })}
                                        className="p-1.5 text-forest-500 hover:text-forest-800 hover:bg-cream-100 rounded-lg transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil size={15} />
                                      </button>
                                    )}
                                    {activeTable?.capabilities?.delete && (
                                      <button
                                        onClick={() => setConfirmingDelete(row.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-forest-100 bg-cream-50/40">
                    <span className="text-xs text-forest-500">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
                      >
                        <ChevronLeft size={15} /> Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
                      >
                        Next <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {editing && activeTable && (
        <RecordFormModal
          table={activeTable}
          record={editing.record}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
