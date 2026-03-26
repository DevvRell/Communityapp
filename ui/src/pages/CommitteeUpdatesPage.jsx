import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ChevronDown, Calendar, FileText, List, Loader2, Play, PlusCircle, Users, Vote, CheckSquare, MessageCircle, Sparkles } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CB5_COMMITTEES = [
  'All Committees',
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

// Fallback hardcoded data in case API is not yet available
const FALLBACK_UPDATES = [
  {
    id: 'planning',
    committeeName: 'Land Use & Housing',
    meetingDate: '2024-02-12',
    agenda: 'Review of variance request – 123 Oak Street\nDiscussion: Downtown mixed-use development guidelines\nUpdate on Main Street sidewalk improvement project\nPublic comment period',
    minutes: 'Meeting called to order at 6:00 PM. All members present.\nVariance request for 123 Oak Street was approved with conditions regarding setback compliance.\nCommittee agreed to draft revised mixed-use guidelines for council review by March 1.\nSidewalk project timeline confirmed; construction to begin April 15.\nThree residents spoke during public comment regarding noise ordinances.\nNext meeting scheduled for March 11, 2024.',
  },
  {
    id: 'parks',
    committeeName: 'Parks, Sanitation & Environment',
    meetingDate: '2024-02-08',
    agenda: 'Summer program registration timeline\nPark maintenance budget allocation\nNew playground equipment proposal – Riverside Park\nCommunity garden expansion request',
    minutes: 'Meeting called to order at 5:30 PM.\nSummer program registration to open March 1; brochure to be distributed next week.\nBudget approved as presented; focus on trail repairs and restroom upgrades.\nRiverside Park playground proposal tabled pending cost estimates.\nCommunity garden expansion approved for 12 additional plots.\nNext meeting: February 22, 2024.',
  },
  {
    id: 'safety',
    committeeName: 'Public Safety & Quality of Life',
    meetingDate: '2024-02-05',
    agenda: 'Quarterly crime statistics report\nNeighborhood Watch program expansion\nEmergency preparedness drill schedule\nCrosswalk safety near schools',
    minutes: 'Meeting called to order at 4:00 PM.\nCrime stats showed 8% decrease in property crime year-over-year.\nNeighborhood Watch to expand to Northside; training sessions set for March.\nCommunity-wide drill scheduled for April 20; flyers to be mailed.\nDPW and police to coordinate on crosswalk signage at Lincoln and Washington schools.\nAdjourned at 5:45 PM. Next meeting March 4, 2024.',
  },
]

function generateAISummary(note) {
  const parts = []
  const date = new Date(note.meetingDate).toLocaleDateString('en-US', { dateStyle: 'long' })
  parts.push(`The ${note.committeeName} met on ${date}`)
  if (note.chairperson) parts[0] += `, chaired by ${note.chairperson}`
  parts[0] += '.'

  if (note.quorumReached === false) {
    parts.push('Quorum was not reached.')
  }

  const agendaItems = Array.isArray(note.agendaItems) ? note.agendaItems : []
  if (agendaItems.length > 0) {
    parts.push(`${agendaItems.length} agenda item${agendaItems.length > 1 ? 's were' : ' was'} discussed, including ${agendaItems.slice(0, 3).map(a => a.title).join(', ')}${agendaItems.length > 3 ? ', and more' : ''}.`)
  }

  const motions = Array.isArray(note.motions) ? note.motions : []
  if (motions.length > 0) {
    const passed = motions.filter(m => m.outcome === 'Passed').length
    const failed = motions.filter(m => m.outcome === 'Failed').length
    const tabled = motions.filter(m => m.outcome === 'Tabled').length
    const motionParts = []
    if (passed) motionParts.push(`${passed} passed`)
    if (failed) motionParts.push(`${failed} failed`)
    if (tabled) motionParts.push(`${tabled} tabled`)
    parts.push(`${motions.length} motion${motions.length > 1 ? 's were' : ' was'} brought to vote: ${motionParts.join(', ')}.`)
  }

  const actionItems = Array.isArray(note.actionItems) ? note.actionItems : []
  if (actionItems.length > 0) {
    parts.push(`${actionItems.length} action item${actionItems.length > 1 ? 's were' : ' was'} assigned for follow-up.`)
  }

  if (note.publicComment) {
    parts.push('Public comments were heard during the meeting.')
  }

  return parts.join(' ')
}

const CommitteeUpdatesPage = () => {
  const navigate = useNavigate()
  const [updates, setUpdates] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCommittee, setSelectedCommittee] = useState('All Committees')
  const [video, setVideo] = useState(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [expandedNote, setExpandedNote] = useState(null)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/committee-updates`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setUpdates(data)
          } else {
            setUpdates(FALLBACK_UPDATES)
          }
        } else {
          setUpdates(FALLBACK_UPDATES)
        }
      } catch {
        setUpdates(FALLBACK_UPDATES)
      }
    }

    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/committee-notes`)
        if (res.ok) {
          const data = await res.json()
          setNotes(data || [])
        }
      } catch {
        // notes endpoint may not exist yet
      }
    }

    const fetchVideo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/youtube/latest`)
        if (res.ok) {
          const data = await res.json()
          setVideo(data)
        }
      } catch {
        // silently fail
      } finally {
        setVideoLoading(false)
      }
    }

    Promise.all([fetchUpdates(), fetchNotes()]).finally(() => setLoading(false))
    fetchVideo()
  }, [])

  const parseLines = (text) => {
    if (!text) return []
    return text.split('\n').filter((line) => line.trim())
  }

  // Combine updates and notes, filter by committee
  const filteredUpdates = updates.filter(u =>
    selectedCommittee === 'All Committees' || (u.committeeName || u.name) === selectedCommittee
  )
  const filteredNotes = notes.filter(n =>
    selectedCommittee === 'All Committees' || n.committeeName === selectedCommittee
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ClipboardList className="text-primary-600" size={36} />
            Committee Updates
          </h1>
          <p className="mt-2 text-gray-600">
            Meeting minutes and agendas for CB5 East New York committees
          </p>
        </div>

        {/* YouTube Latest Video Section */}
        {!videoLoading && video && video.videoId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="bg-primary-50 px-6 py-3 border-b border-primary-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Play size={20} className="text-primary-600" />
                Latest from CB5ENY
              </h2>
            </div>
            <div className="p-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title || 'Latest CB5 ENY Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {video.title && (
                <p className="mt-3 text-sm font-medium text-gray-900">{video.title}</p>
              )}
              {video.publishedAt && (
                <p className="text-xs text-gray-500">
                  Published {new Date(video.publishedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Meeting Notes Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/committee-updates/submit')}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>Submit Meeting Notes</span>
          </button>
        </div>

        {/* Committee Filter */}
        <div className="mb-8">
          <label htmlFor="committee-select" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by committee
          </label>
          <div className="relative">
            <select
              id="committee-select"
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {CB5_COMMITTEES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>

        {/* Approved Committee Notes (structured) */}
        {filteredNotes.length > 0 && (
          <div className="space-y-6 mb-10">
            <h2 className="text-xl font-semibold text-gray-900">Meeting Notes</h2>
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{note.committeeName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={14} />
                      {new Date(note.meetingDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                      {note.chairperson && (
                        <span className="ml-2">| Chair: {note.chairperson}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${expandedNote === note.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedNote === note.id && (
                  <div className="border-t border-gray-200 px-6 py-4 space-y-6">
                    {/* Attendance */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                        <Users size={16} className="text-primary-600" />
                        Attendance
                      </h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        {note.chairperson && <p><strong>Chair:</strong> {note.chairperson}</p>}
                        {note.membersPresent && <p><strong>Present:</strong> {note.membersPresent}</p>}
                        {note.membersAbsent && <p><strong>Absent:</strong> {note.membersAbsent}</p>}
                        {note.guests && <p><strong>Guests:</strong> {note.guests}</p>}
                        <p><strong>Quorum:</strong> {note.quorumReached ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    {/* Agenda Items */}
                    {Array.isArray(note.agendaItems) && note.agendaItems.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                          <List size={16} className="text-primary-600" />
                          Agenda Items
                        </h4>
                        <div className="space-y-3">
                          {note.agendaItems.map((item, i) => (
                            <div key={i} className="border-l-2 border-primary-200 pl-4">
                              <p className="text-sm font-medium text-gray-900">{i + 1}. {item.title}</p>
                              {item.presenter && <p className="text-xs text-gray-500">Presented by: {item.presenter}</p>}
                              <p className="text-sm text-gray-700 mt-1">{item.discussionSummary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motions & Votes */}
                    {Array.isArray(note.motions) && note.motions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                          <Vote size={16} className="text-primary-600" />
                          Motions & Votes
                        </h4>
                        <div className="space-y-3">
                          {note.motions.map((motion, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                              <p className="font-medium text-gray-900">{motion.motionText}</p>
                              <p className="text-gray-600 mt-1">
                                Moved by {motion.movedBy}, seconded by {motion.secondedBy}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-gray-600">
                                <span>For: {motion.votesFor}</span>
                                <span>Against: {motion.votesAgainst}</span>
                                <span>Abstain: {motion.abstentions}</span>
                                <span className={`font-medium ${motion.outcome === 'Passed' ? 'text-green-600' : motion.outcome === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                                  {motion.outcome}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {Array.isArray(note.actionItems) && note.actionItems.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                          <CheckSquare size={16} className="text-primary-600" />
                          Action Items
                        </h4>
                        <ul className="space-y-2">
                          {note.actionItems.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-primary-600 font-medium">{i + 1}.</span>
                              <div>
                                <p>{item.description}</p>
                                {item.assignedTo && <p className="text-xs text-gray-500">Assigned to: {item.assignedTo}</p>}
                                {item.dueDate && <p className="text-xs text-gray-500">Due: {new Date(item.dueDate).toLocaleDateString()}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Public Comment */}
                    {note.publicComment && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                          <MessageCircle size={16} className="text-primary-600" />
                          Public Comment
                        </h4>
                        <p className="text-sm text-gray-700">{note.publicComment}</p>
                      </div>
                    )}

                    {/* General Notes */}
                    {note.generalNotes && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">General Notes</h4>
                        <p className="text-sm text-gray-700">{note.generalNotes}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-primary-600" />
                        AI Summary
                      </h4>
                      <p className="text-sm text-gray-700">{generateAISummary(note)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legacy Committee Updates (from /api/committee-updates) */}
        {filteredUpdates.length > 0 && (
          <div className="space-y-6">
            {filteredNotes.length > 0 && (
              <h2 className="text-xl font-semibold text-gray-900">Committee Updates</h2>
            )}
            {filteredUpdates.map((update, idx) => (
              <div key={update.id || idx} className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span className="font-medium text-gray-900">{update.committeeName || update.name}</span>
                  <span>|</span>
                  {new Date(update.meetingDate || update.lastMeeting).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </div>

                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-primary-50 px-6 py-3 border-b border-primary-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <List size={20} className="text-primary-600" />
                      Agenda
                    </h2>
                  </div>
                  <ul className="px-6 py-4 space-y-2">
                    {parseLines(update.agenda).map((item, i) => (
                      <li key={i} className="flex gap-2 text-gray-700">
                        <span className="text-primary-600 font-medium">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-primary-50 px-6 py-3 border-b border-primary-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText size={20} className="text-primary-600" />
                      Meeting Minutes
                    </h2>
                  </div>
                  <ul className="px-6 py-4 space-y-3">
                    {parseLines(update.minutes).map((item, i) => (
                      <li key={i} className="flex gap-2 text-gray-700">
                        <span className="text-primary-600 font-medium shrink-0">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredUpdates.length === 0 && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-600">
              No committee updates available for the selected filter. Try selecting "All Committees".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommitteeUpdatesPage
