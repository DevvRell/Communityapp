import { useState } from 'react'
import { ClipboardList, ChevronDown, Calendar, FileText, List } from 'lucide-react'

const committees = [
  {
    id: 'planning',
    name: 'Planning & Zoning Committee',
    lastMeeting: '2024-02-12',
    agenda: [
      'Review of variance request – 123 Oak Street',
      'Discussion: Downtown mixed-use development guidelines',
      'Update on Main Street sidewalk improvement project',
      'Public comment period',
    ],
    minutes: [
      'Meeting called to order at 6:00 PM. All members present.',
      'Variance request for 123 Oak Street was approved with conditions regarding setback compliance.',
      'Committee agreed to draft revised mixed-use guidelines for council review by March 1.',
      'Sidewalk project timeline confirmed; construction to begin April 15.',
      'Three residents spoke during public comment regarding noise ordinances.',
      'Next meeting scheduled for March 11, 2024.',
    ],
  },
  {
    id: 'parks',
    name: 'Parks & Recreation Committee',
    lastMeeting: '2024-02-08',
    agenda: [
      'Summer program registration timeline',
      'Park maintenance budget allocation',
      'New playground equipment proposal – Riverside Park',
      'Community garden expansion request',
    ],
    minutes: [
      'Meeting called to order at 5:30 PM.',
      'Summer program registration to open March 1; brochure to be distributed next week.',
      'Budget approved as presented; focus on trail repairs and restroom upgrades.',
      'Riverside Park playground proposal tabled pending cost estimates.',
      'Community garden expansion approved for 12 additional plots.',
      'Next meeting: February 22, 2024.',
    ],
  },
  {
    id: 'safety',
    name: 'Public Safety Committee',
    lastMeeting: '2024-02-05',
    agenda: [
      'Quarterly crime statistics report',
      'Neighborhood Watch program expansion',
      'Emergency preparedness drill schedule',
      'Crosswalk safety near schools',
    ],
    minutes: [
      'Meeting called to order at 4:00 PM.',
      'Crime stats showed 8% decrease in property crime year-over-year.',
      'Neighborhood Watch to expand to Northside; training sessions set for March.',
      'Community-wide drill scheduled for April 20; flyers to be mailed.',
      'DPW and police to coordinate on crosswalk signage at Lincoln and Washington schools.',
      'Adjourned at 5:45 PM. Next meeting March 4, 2024.',
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Budget Committee',
    lastMeeting: '2024-02-01',
    agenda: [
      'FY2024 mid-year budget review',
      'Capital improvement priorities',
      'Grant applications status',
      'Reserve fund policy discussion',
    ],
    minutes: [
      'Meeting called to order at 6:30 PM.',
      'Mid-year review: revenues on track; utilities and materials over budget, to be monitored.',
      'Capital priorities ranked: water main replacement, community center roof, fleet vehicles.',
      'Two grant applications submitted; decision expected by May.',
      'Committee recommended maintaining 15% reserve policy; motion carried.',
      'Next meeting February 29, 2024.',
    ],
  },
  {
    id: 'environment',
    name: 'Environment & Sustainability Committee',
    lastMeeting: '2024-01-29',
    agenda: [
      'Curbside recycling contract renewal',
      'Tree planting initiative – spring schedule',
      'Solar incentive program for residents',
      'Composting pilot program update',
    ],
    minutes: [
      'Meeting called to order at 5:00 PM.',
      'Recycling contract: recommendation to renew with current provider with 3% increase.',
      'Tree planting set for April 6 and April 13; 80 trees ordered.',
      'Solar incentive details to be posted on website by February 15.',
      'Composting pilot in Ward 2 showing strong participation; expansion to be considered in June.',
      'Next meeting February 26, 2024.',
    ],
  },
]

const CommitteeUpdatesPage = () => {
  const [selectedId, setSelectedId] = useState(committees[0].id)
  const selected = committees.find((c) => c.id === selectedId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ClipboardList className="text-primary-600" size={36} />
            Committee Updates
          </h1>
          <p className="mt-2 text-gray-600">
            Meeting minutes and agendas for community committees
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="committee-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a committee
          </label>
          <div className="relative">
            <select
              id="committee-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>

        {selected && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              Last meeting: {new Date(selected.lastMeeting).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </div>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-50 px-6 py-3 border-b border-primary-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <List size={20} className="text-primary-600" />
                  Agenda
                </h2>
              </div>
              <ul className="px-6 py-4 space-y-2">
                {selected.agenda.map((item, i) => (
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
                {selected.minutes.map((item, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="text-primary-600 font-medium shrink-0">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommitteeUpdatesPage
