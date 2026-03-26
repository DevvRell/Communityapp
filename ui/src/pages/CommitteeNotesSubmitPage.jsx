import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Plus, Trash2, Loader2, CheckCircle, Paperclip, X, FileText, Search } from 'lucide-react'
import { committeeNotesAPI } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CB5_COMMITTEES = [
  'Aging, Health & Social Services',
  'Cannabis',
  'Economic Development, IBZ, & BIDs',
  'Education & Youth Services',
  'Land Use & Housing',
  'Parks, Sanitation & Environment',
  'Public Safety & Quality of Life',
  'Transportation & TLC',
  'General Board Meeting',
]

const DEFAULT_LOCATION = '127 Pennsylvania Ave, Brooklyn, NY 11207'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']

const emptyAgendaItem = () => ({ title: '', discussionSummary: '', presenter: '' })
const emptyMotion = () => ({ motionText: '', movedBy: '', secondedBy: '', votesFor: 0, votesAgainst: 0, abstentions: 0, outcome: 'Passed' })
const emptyActionItem = () => ({ description: '', assignedTo: '', dueDate: '' })

const CommitteeNotesSubmitPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [error, setError] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(!!editId)
  const [isEditMode, setIsEditMode] = useState(false)

  // Section 1 — Meeting Identification
  const [committeeName, setCommitteeName] = useState(CB5_COMMITTEES[0])
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingLocation, setMeetingLocation] = useState(DEFAULT_LOCATION)
  const [callToOrderTime, setCallToOrderTime] = useState('')
  const [adjournmentTime, setAdjournmentTime] = useState('')

  // Section 2 — Attendance
  const [chairperson, setChairperson] = useState('')
  const [membersPresent, setMembersPresent] = useState('')
  const [membersAbsent, setMembersAbsent] = useState('')
  const [guests, setGuests] = useState('')
  const [quorumReached, setQuorumReached] = useState(true)

  // Section 3 — Agenda Items
  const [agendaItems, setAgendaItems] = useState([emptyAgendaItem()])

  // Section 4 — Motions & Votes
  const [motions, setMotions] = useState([])

  // Section 5 — Action Items
  const [actionItems, setActionItems] = useState([])

  // Section 6 — Additional Notes
  const [publicComment, setPublicComment] = useState('')
  const [generalNotes, setGeneralNotes] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')

  // File attachments
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState(null)
  const [existingAttachments, setExistingAttachments] = useState([])

  // Edit lookup
  const [lookupId, setLookupId] = useState('')
  const [showLookup, setShowLookup] = useState(false)

  // Load existing note for editing
  useEffect(() => {
    if (!editId) return
    const loadNote = async () => {
      try {
        const note = await committeeNotesAPI.getById(Number(editId))
        if (!note) {
          setError('Submission not found.')
          setLoadingEdit(false)
          return
        }
        if (note.submissionStatus !== 'PENDING') {
          setError('This submission can no longer be edited — it has been reviewed.')
          setLoadingEdit(false)
          return
        }
        populateForm(note)
        setIsEditMode(true)
      } catch (err) {
        setError(err.message || 'Failed to load submission for editing.')
      } finally {
        setLoadingEdit(false)
      }
    }
    loadNote()
  }, [editId])

  const populateForm = (note) => {
    setCommitteeName(note.committeeName || CB5_COMMITTEES[0])
    setMeetingDate(note.meetingDate ? note.meetingDate.split('T')[0] : '')
    setMeetingLocation(note.meetingLocation || DEFAULT_LOCATION)
    setCallToOrderTime(note.callToOrderTime || '')
    setAdjournmentTime(note.adjournmentTime || '')
    setChairperson(note.chairperson || '')
    setMembersPresent(note.membersPresent || '')
    setMembersAbsent(note.membersAbsent || '')
    setGuests(note.guests || '')
    setQuorumReached(note.quorumReached !== false)
    setAgendaItems(Array.isArray(note.agendaItems) && note.agendaItems.length > 0 ? note.agendaItems : [emptyAgendaItem()])
    setMotions(Array.isArray(note.motions) ? note.motions : [])
    setActionItems(Array.isArray(note.actionItems) ? note.actionItems : [])
    setPublicComment(note.publicComment || '')
    setGeneralNotes(note.generalNotes || '')
    setSubmittedBy(note.submittedBy || '')
    setSubmitterEmail(note.submitterEmail || '')
    setExistingAttachments(Array.isArray(note.attachments) ? note.attachments : [])
  }

  const handleFileAdd = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFileError(null)

    for (const file of selectedFiles) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" is not a supported file type. Use PDF, JPG, PNG, GIF, or WebP.`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`"${file.name}" is too large. Maximum file size is 10 MB.`)
        return
      }
    }

    setFiles(prev => [...prev, ...selectedFiles])
    e.target.value = '' // reset input
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateAgendaItem = (index, field, value) => {
    setAgendaItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const updateMotion = (index, field, value) => {
    setMotions(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const updateActionItem = (index, field, value) => {
    setActionItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const buildFormData = () => {
    const formData = new FormData()
    formData.append('committeeName', committeeName)
    formData.append('meetingDate', meetingDate)
    if (meetingLocation) formData.append('meetingLocation', meetingLocation)
    formData.append('callToOrderTime', callToOrderTime)
    if (adjournmentTime) formData.append('adjournmentTime', adjournmentTime)
    formData.append('chairperson', chairperson)
    formData.append('membersPresent', membersPresent)
    if (membersAbsent) formData.append('membersAbsent', membersAbsent)
    if (guests) formData.append('guests', guests)
    formData.append('quorumReached', String(quorumReached))
    formData.append('agendaItems', JSON.stringify(agendaItems.filter(a => a.title.trim())))
    formData.append('motions', JSON.stringify(motions.filter(m => m.motionText.trim())))
    formData.append('actionItems', JSON.stringify(actionItems.filter(a => a.description.trim())))
    if (publicComment) formData.append('publicComment', publicComment)
    if (generalNotes) formData.append('generalNotes', generalNotes)
    formData.append('submittedBy', submittedBy)
    formData.append('submitterEmail', submitterEmail)

    for (const file of files) {
      formData.append('attachments', file)
    }

    return formData
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      let result
      if (isEditMode && editId) {
        // Try multipart first, fall back to JSON for edit
        try {
          const formData = buildFormData()
          const res = await fetch(`${API_BASE}/api/committee-notes/${editId}`, {
            method: 'PUT',
            body: formData,
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || `Update failed (${res.status})`)
          }
          result = await res.json()
        } catch (fetchErr) {
          // Fall back to JSON update if multipart fails
          if (files.length === 0) {
            result = await committeeNotesAPI.update(Number(editId), {
              committeeName,
              meetingDate,
              meetingLocation: meetingLocation || null,
              callToOrderTime,
              adjournmentTime: adjournmentTime || null,
              chairperson,
              membersPresent,
              membersAbsent: membersAbsent || null,
              guests: guests || null,
              quorumReached,
              agendaItems: agendaItems.filter(a => a.title.trim()),
              motions: motions.filter(m => m.motionText.trim()),
              actionItems: actionItems.filter(a => a.description.trim()),
              publicComment: publicComment || null,
              generalNotes: generalNotes || null,
              submittedBy,
              submitterEmail,
            })
          } else {
            throw fetchErr
          }
        }
      } else {
        // New submission — try multipart, fall back to JSON
        if (files.length > 0) {
          const formData = buildFormData()
          const res = await fetch(`${API_BASE}/api/committee-notes`, {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || `Submission failed (${res.status})`)
          }
          result = await res.json()
        } else {
          result = await committeeNotesAPI.create({
            committeeName,
            meetingDate,
            meetingLocation: meetingLocation || null,
            callToOrderTime,
            adjournmentTime: adjournmentTime || null,
            chairperson,
            membersPresent,
            membersAbsent: membersAbsent || null,
            guests: guests || null,
            quorumReached,
            agendaItems: agendaItems.filter(a => a.title.trim()),
            motions: motions.filter(m => m.motionText.trim()),
            actionItems: actionItems.filter(a => a.description.trim()),
            publicComment: publicComment || null,
            generalNotes: generalNotes || null,
            submittedBy,
            submitterEmail,
          })
        }
      }
      setSubmittedId(result?.id || editId)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-lg text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Notes Updated' : 'Notes Submitted'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isEditMode
              ? 'Your meeting notes have been updated and remain pending review.'
              : 'Your meeting notes have been submitted for review. They will appear on the Committee Updates page once approved by an admin.'}
          </p>
          {submittedId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">
                Submission ID: <span className="font-mono font-bold text-gray-900">{submittedId}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Save this ID to edit your submission while it's pending review.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/committee-updates')}
            className="btn-primary"
          >
            Back to Committee Updates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ClipboardList className="text-primary-600" size={32} />
            {isEditMode ? 'Edit Meeting Notes' : 'Submit Meeting Notes'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? 'Update your pending submission. Changes will be saved for admin review.'
              : 'Record meeting minutes for a CB5 committee. All submissions are reviewed before publishing.'}
          </p>
        </div>

        {/* Edit Lookup */}
        {!isEditMode && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowLookup(!showLookup)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              <Search size={16} />
              Edit a previous submission
            </button>
            {showLookup && (
              <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submission ID</label>
                  <input
                    type="text"
                    value={lookupId}
                    onChange={e => setLookupId(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter your submission ID"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (lookupId.trim()) {
                      navigate(`/committee-updates/submit?edit=${lookupId.trim()}`)
                    }
                  }}
                  className="btn-primary text-sm"
                  disabled={!lookupId.trim()}
                >
                  Load
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1 — Meeting Identification */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Committee *</label>
                <select value={committeeName} onChange={e => setCommitteeName(e.target.value)} className="input-field w-full" required>
                  {CB5_COMMITTEES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date *</label>
                <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call to Order Time *</label>
                <input type="time" value={callToOrderTime} onChange={e => setCallToOrderTime(e.target.value)} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjournment Time</label>
                <input type="time" value={adjournmentTime} onChange={e => setAdjournmentTime(e.target.value)} className="input-field w-full" />
              </div>
            </div>
          </section>

          {/* Section 2 — Attendance */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson *</label>
                <input type="text" value={chairperson} onChange={e => setChairperson(e.target.value)} className="input-field w-full" required placeholder="Name of presiding chair" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members Present *</label>
                <textarea value={membersPresent} onChange={e => setMembersPresent(e.target.value)} className="input-field w-full" rows={2} required placeholder="Comma-separated names" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members Absent</label>
                <textarea value={membersAbsent} onChange={e => setMembersAbsent(e.target.value)} className="input-field w-full" rows={2} placeholder="Comma-separated names" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests / Public Attendees</label>
                <textarea value={guests} onChange={e => setGuests(e.target.value)} className="input-field w-full" rows={2} placeholder="Names of non-board attendees" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="quorum" checked={quorumReached} onChange={e => setQuorumReached(e.target.checked)} className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                <label htmlFor="quorum" className="text-sm font-medium text-gray-700">Quorum Reached</label>
              </div>
            </div>
          </section>

          {/* Section 3 — Agenda Items */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Agenda Items</h2>
              <button
                type="button"
                onClick={() => agendaItems.length < 20 && setAgendaItems([...agendaItems, emptyAgendaItem()])}
                disabled={agendaItems.length >= 20}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            <div className="space-y-6">
              {agendaItems.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-600">Item {idx + 1}</span>
                    {agendaItems.length > 1 && (
                      <button type="button" onClick={() => setAgendaItems(agendaItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input type="text" value={item.title} onChange={e => updateAgendaItem(idx, 'title', e.target.value)} className="input-field w-full" required placeholder="Brief description" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discussion Summary *</label>
                      <textarea value={item.discussionSummary} onChange={e => updateAgendaItem(idx, 'discussionSummary', e.target.value)} className="input-field w-full" rows={3} required placeholder="Key points discussed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Presenter</label>
                      <input type="text" value={item.presenter} onChange={e => updateAgendaItem(idx, 'presenter', e.target.value)} className="input-field w-full" placeholder="Person who led this item" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 — Motions & Votes */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Motions & Votes</h2>
              <button
                type="button"
                onClick={() => setMotions([...motions, emptyMotion()])}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Add Motion
              </button>
            </div>
            {motions.length === 0 && (
              <p className="text-sm text-gray-500">No motions recorded. Click "Add Motion" if votes were taken.</p>
            )}
            <div className="space-y-6">
              {motions.map((motion, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-600">Motion {idx + 1}</span>
                    <button type="button" onClick={() => setMotions(motions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motion Text *</label>
                      <textarea value={motion.motionText} onChange={e => updateMotion(idx, 'motionText', e.target.value)} className="input-field w-full" rows={2} required placeholder="The resolution or motion as stated" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moved By *</label>
                        <input type="text" value={motion.movedBy} onChange={e => updateMotion(idx, 'movedBy', e.target.value)} className="input-field w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seconded By *</label>
                        <input type="text" value={motion.secondedBy} onChange={e => updateMotion(idx, 'secondedBy', e.target.value)} className="input-field w-full" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">For *</label>
                        <input type="number" min={0} value={motion.votesFor} onChange={e => updateMotion(idx, 'votesFor', parseInt(e.target.value) || 0)} className="input-field w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Against *</label>
                        <input type="number" min={0} value={motion.votesAgainst} onChange={e => updateMotion(idx, 'votesAgainst', parseInt(e.target.value) || 0)} className="input-field w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abstain *</label>
                        <input type="number" min={0} value={motion.abstentions} onChange={e => updateMotion(idx, 'abstentions', parseInt(e.target.value) || 0)} className="input-field w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label>
                        <select value={motion.outcome} onChange={e => updateMotion(idx, 'outcome', e.target.value)} className="input-field w-full" required>
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Tabled">Tabled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 — Action Items */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Action Items & Next Steps</h2>
              <button
                type="button"
                onClick={() => setActionItems([...actionItems, emptyActionItem()])}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Add Action Item
              </button>
            </div>
            {actionItems.length === 0 && (
              <p className="text-sm text-gray-500">No action items. Click "Add Action Item" to record follow-ups.</p>
            )}
            <div className="space-y-4">
              {actionItems.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-600">Action {idx + 1}</span>
                    <button type="button" onClick={() => setActionItems(actionItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea value={item.description} onChange={e => updateActionItem(idx, 'description', e.target.value)} className="input-field w-full" rows={2} required placeholder="What needs to be done" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <input type="text" value={item.assignedTo} onChange={e => updateActionItem(idx, 'assignedTo', e.target.value)} className="input-field w-full" placeholder="Person or committee" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" value={item.dueDate} onChange={e => updateActionItem(idx, 'dueDate', e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 — Additional Notes & Attachments */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Comment Summary</label>
                <textarea value={publicComment} onChange={e => setPublicComment(e.target.value)} className="input-field w-full" rows={3} placeholder="Summary of public comments made during the meeting" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
                <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} className="input-field w-full" rows={3} placeholder="Anything not captured above" />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Paperclip size={14} className="inline mr-1" />
                  Attachments
                </label>
                <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG, GIF, or WebP. Max 10 MB per file.</p>

                {/* Existing attachments (edit mode) */}
                {existingAttachments.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Previously uploaded:</p>
                    {existingAttachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5">
                        <FileText size={14} className="text-gray-400" />
                        <span className="truncate">{att.originalName}</span>
                        <span className="text-xs text-gray-400">({(att.fileSize / 1024).toFixed(0)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* New file selection */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-primary-50 text-primary-700 rounded-lg px-3 py-1.5 text-sm">
                      <FileText size={14} />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-primary-400 hover:text-primary-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  id="file-attach"
                  className="hidden"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  multiple
                  onChange={handleFileAdd}
                />
                <label
                  htmlFor="file-attach"
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  <Plus size={14} /> Add file
                </label>

                {fileError && (
                  <p className="text-red-600 text-sm mt-1">{fileError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input type="text" value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} className="input-field w-full" required placeholder="Name of the person submitting" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                  <input type="email" value={submitterEmail} onChange={e => setSubmitterEmail(e.target.value)} className="input-field w-full" required placeholder="For admin follow-up" />
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/committee-updates')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{isEditMode ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Submission' : 'Submit for Review'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommitteeNotesSubmitPage
