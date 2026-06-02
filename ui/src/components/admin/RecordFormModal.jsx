import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, Save } from 'lucide-react'

/**
 * Schema-driven create/edit modal. Renders one input per field in `fields`
 * (from the admin data-table registry), picking the control by field.type.
 *
 * Props:
 *   table     - { slug, label, fields }
 *   record    - existing row when editing, or null when creating
 *   saving    - boolean (disables submit)
 *   onSave    - (data) => void   receives the assembled, JSON-ready object
 *   onClose   - () => void
 */
export default function RecordFormModal({ table, record, saving, onSave, onClose }) {
  const isEdit = !!record
  const editableFields = useMemo(
    () => table.fields.filter((f) => !f.readOnly),
    [table.fields]
  )
  const readOnlyFields = useMemo(
    () => table.fields.filter((f) => f.readOnly),
    [table.fields]
  )

  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  // Seed form values from the record (edit) or sensible blanks (create).
  useEffect(() => {
    const seed = {}
    for (const field of table.fields) {
      const raw = record ? record[field.name] : undefined
      seed[field.name] = toInputValue(field, raw)
    }
    setValues(seed)
    setErrors({})
  }, [table, record])

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    const payload = {}

    for (const field of editableFields) {
      const v = values[field.name]

      // Required check
      const empty = v === '' || v === null || v === undefined
      if (field.required && empty && field.type !== 'boolean') {
        nextErrors[field.name] = 'Required'
        continue
      }

      // JSON validation
      if (field.type === 'json') {
        if (empty) {
          payload[field.name] = field.required ? undefined : null
        } else {
          try {
            JSON.parse(v)
            payload[field.name] = v // server parses; send the raw string
          } catch {
            nextErrors[field.name] = 'Invalid JSON'
            continue
          }
        }
        continue
      }

      if (field.type === 'boolean') {
        payload[field.name] = !!v
        continue
      }

      payload[field.name] = empty ? '' : v
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-forest-950/50 backdrop-blur-sm p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-display text-2xl text-forest-900">
            {isEdit ? `Edit ${table.label} #${record.id}` : `New ${singular(table.label)}`}
          </h2>
          <button
            onClick={onClose}
            className="text-forest-400 hover:text-forest-700 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {editableFields.map((field) => (
              <div
                key={field.name}
                className={fullWidthTypes.has(field.type) ? 'sm:col-span-2' : ''}
              >
                <FieldControl
                  field={field}
                  value={values[field.name]}
                  error={errors[field.name]}
                  onChange={(v) => setField(field.name, v)}
                />
              </div>
            ))}

            {/* Read-only metadata (edit only) */}
            {isEdit && readOnlyFields.length > 0 && (
              <div className="sm:col-span-2 mt-2 pt-4 border-t border-forest-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-400 mb-2">
                  System fields (read-only)
                </p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm text-forest-500">
                  {readOnlyFields.map((f) => (
                    <div key={f.name} className="truncate">
                      <span className="text-forest-400">{f.label}:</span>{' '}
                      <span className="text-forest-700">{displayReadOnly(record?.[f.name])}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-forest-100 bg-cream-50/50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const fullWidthTypes = new Set(['text', 'json'])

function FieldControl({ field, value, error, onChange }) {
  const labelEl = (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700 mb-1.5">
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )

  let control
  switch (field.type) {
    case 'text':
      control = (
        <textarea
          rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
      break
    case 'json':
      control = (
        <textarea
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder='e.g. [] or {"key":"value"}'
          className="input-field font-mono text-sm"
        />
      )
      break
    case 'boolean':
      control = (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-forest-300 text-forest-700 focus:ring-forest-500"
          />
          <span className="text-sm text-forest-600">{value ? 'Yes' : 'No'}</span>
        </label>
      )
      break
    case 'enum':
      control = (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input-field">
          {!field.required && <option value="">—</option>}
          {(field.enumValues || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
      break
    case 'number':
    case 'decimal':
      control = (
        <input
          type="number"
          step={field.type === 'decimal' ? '0.01' : '1'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
      break
    case 'date':
      control = (
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
      break
    case 'datetime':
      control = (
        <input
          type="datetime-local"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
      break
    default:
      control = (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
  }

  return (
    <div>
      {field.type !== 'boolean' && labelEl}
      {field.type === 'boolean' && labelEl}
      {control}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// --- value conversion helpers -------------------------------------------------

/** Convert a stored/API value into the string the form control expects. */
function toInputValue(field, raw) {
  if (raw === null || raw === undefined) {
    if (field.type === 'boolean') return false
    // Seed required enums (e.g. status) with a valid default so create never submits blank.
    if (field.type === 'enum' && field.required && field.enumValues?.length) {
      return field.enumValues[0]
    }
    return ''
  }
  switch (field.type) {
    case 'boolean':
      return !!raw
    case 'json':
      return typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)
    case 'date':
      // API serializes date-only fields as YYYY-MM-DD already.
      return String(raw).slice(0, 10)
    case 'datetime':
      // <input datetime-local> wants YYYY-MM-DDTHH:mm
      return String(raw).slice(0, 16)
    default:
      return String(raw)
  }
}

function displayReadOnly(v) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function singular(label) {
  // "Businesses" -> "Business", "Events" -> "Event", "Feedback" -> "Feedback"
  if (label.endsWith('ies')) return label.slice(0, -3) + 'y'
  if (label.endsWith('ses')) return label.slice(0, -2)
  if (label.endsWith('s')) return label.slice(0, -1)
  return label
}
