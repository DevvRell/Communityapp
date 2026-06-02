/**
 * Admin data-table registry.
 *
 * Single source of truth describing every table the admin console can CRUD.
 * Drives both backend validation (coerce/serialize) and frontend form generation
 * (exposed via GET /api/admin/data/tables).
 *
 * To expose a new table: add an entry here. No new route or UI code required.
 *
 * Field semantics for writes (see buildWriteData):
 *   - required: true     -> non-nullable column with NO db default; must be present & non-empty.
 *   - nullable: true     -> nullable column; an empty value clears it to NULL.
 *   - neither            -> non-nullable column WITH a db default; an empty value is omitted
 *                           so the default (create) or existing value (update) stands.
 */

export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'enum';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Column accepts NULL — an empty value clears it. */
  nullable?: boolean;
  /** Shown in the form but never written (id, timestamps, derived fields). */
  readOnly?: boolean;
  /** Allowed values for `enum` fields. */
  enumValues?: string[];
}

export interface TableDef {
  /** Prisma delegate key, e.g. 'business' -> prisma.business */
  model: string;
  label: string;
  capabilities: { create: boolean; update: boolean; delete: boolean };
  /** Fields searched by the ?search= query param (string columns only). */
  searchFields: string[];
  /** Columns shown in the admin grid. */
  listColumns: string[];
  fields: FieldDef[];
}

const SUBMISSION_STATUS = ['PENDING', 'APPROVED', 'REJECTED'];

const idField: FieldDef = { name: 'id', label: 'ID', type: 'number', readOnly: true };
const timestampFields: FieldDef[] = [
  { name: 'createdAt', label: 'Created', type: 'datetime', readOnly: true },
  { name: 'updatedAt', label: 'Updated', type: 'datetime', readOnly: true },
];
// Non-nullable with a db default — required in the form so it always carries a valid value.
const submissionStatusField: FieldDef = {
  name: 'submissionStatus',
  label: 'Submission Status',
  type: 'enum',
  required: true,
  enumValues: SUBMISSION_STATUS,
};

export const TABLES: Record<string, TableDef> = {
  businesses: {
    model: 'business',
    label: 'Businesses',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['name', 'category', 'address', 'borough', 'sub_category'],
    listColumns: ['id', 'name', 'category', 'borough', 'submissionStatus', 'createdAt'],
    fields: [
      idField,
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'category', label: 'Category', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'text', nullable: true },
      { name: 'address', label: 'Address', type: 'string', required: true },
      { name: 'phone', label: 'Phone', type: 'string', required: true },
      { name: 'email', label: 'Email', type: 'string', nullable: true },
      { name: 'rating', label: 'Rating', type: 'decimal' },
      { name: 'reviews', label: 'Reviews', type: 'number' },
      { name: 'hours', label: 'Hours', type: 'string', nullable: true },
      { name: 'website', label: 'Website', type: 'string', nullable: true },
      { name: 'image', label: 'Image URL', type: 'string', nullable: true },
      { name: 'borough', label: 'Borough', type: 'string', nullable: true },
      { name: 'zip', label: 'Zip', type: 'string', nullable: true },
      { name: 'sub_category', label: 'Sub-category', type: 'string', nullable: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },

  events: {
    model: 'event',
    label: 'Events',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['title', 'category', 'location', 'organizer'],
    listColumns: ['id', 'title', 'category', 'date', 'submissionStatus', 'createdAt'],
    fields: [
      idField,
      { name: 'title', label: 'Title', type: 'string', required: true },
      { name: 'category', label: 'Category', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'string', required: true },
      { name: 'location', label: 'Location', type: 'string', required: true },
      { name: 'organizer', label: 'Organizer', type: 'string', required: true },
      { name: 'attendees', label: 'Attendees', type: 'number' },
      { name: 'maxAttendees', label: 'Max Attendees', type: 'number', required: true },
      { name: 'image', label: 'Image URL', type: 'string', nullable: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },

  complaints: {
    model: 'complaint',
    label: 'Complaints',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['title', 'category', 'location', 'submittedBy'],
    listColumns: ['id', 'title', 'category', 'status', 'priority', 'submissionStatus'],
    fields: [
      idField,
      { name: 'title', label: 'Title', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'string', required: true },
      { name: 'location', label: 'Location', type: 'string', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        required: true,
        enumValues: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'enum',
        required: true,
        enumValues: ['LOW', 'MEDIUM', 'HIGH'],
      },
      { name: 'submittedBy', label: 'Submitted By', type: 'string', required: true },
      { name: 'submittedDate', label: 'Submitted Date', type: 'datetime' },
      { name: 'resolvedDate', label: 'Resolved Date', type: 'datetime', nullable: true },
      { name: 'response', label: 'Response', type: 'text', nullable: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },

  'committee-notes': {
    model: 'committeeNote',
    label: 'Committee Notes',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['committeeName', 'chairperson', 'submittedBy', 'submitterEmail'],
    listColumns: ['id', 'committeeName', 'meetingDate', 'chairperson', 'submissionStatus'],
    fields: [
      idField,
      { name: 'committeeName', label: 'Committee Name', type: 'string', required: true },
      { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
      { name: 'meetingLocation', label: 'Meeting Location', type: 'string', nullable: true },
      { name: 'callToOrderTime', label: 'Call To Order Time', type: 'string', required: true },
      { name: 'adjournmentTime', label: 'Adjournment Time', type: 'string', nullable: true },
      { name: 'chairperson', label: 'Chairperson', type: 'string', required: true },
      { name: 'membersPresent', label: 'Members Present', type: 'text', required: true },
      { name: 'membersAbsent', label: 'Members Absent', type: 'text', nullable: true },
      { name: 'guests', label: 'Guests', type: 'text', nullable: true },
      { name: 'quorumReached', label: 'Quorum Reached', type: 'boolean' },
      { name: 'agendaItems', label: 'Agenda Items', type: 'json', required: true },
      { name: 'motions', label: 'Motions', type: 'json', nullable: true },
      { name: 'actionItems', label: 'Action Items', type: 'json', nullable: true },
      { name: 'publicComment', label: 'Public Comment', type: 'text', nullable: true },
      { name: 'generalNotes', label: 'General Notes', type: 'text', nullable: true },
      { name: 'submittedBy', label: 'Submitted By', type: 'string', required: true },
      { name: 'submitterEmail', label: 'Submitter Email', type: 'string', required: true },
      { name: 'attachments', label: 'Attachments', type: 'json', nullable: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },

  'committee-updates': {
    model: 'committeeUpdate',
    label: 'Committee Updates',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['committeeName'],
    listColumns: ['id', 'committeeName', 'meetingDate', 'submissionStatus', 'createdAt'],
    fields: [
      idField,
      { name: 'committeeName', label: 'Committee Name', type: 'string', required: true },
      { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
      { name: 'agenda', label: 'Agenda', type: 'text', required: true },
      { name: 'minutes', label: 'Minutes', type: 'text', required: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },

  subscribers: {
    model: 'subscriber',
    label: 'Subscribers',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['email', 'source'],
    listColumns: ['id', 'email', 'source', 'createdAt'],
    fields: [
      idField,
      { name: 'email', label: 'Email', type: 'string', required: true },
      { name: 'source', label: 'Source', type: 'string', nullable: true },
      { name: 'createdAt', label: 'Created', type: 'datetime', readOnly: true },
    ],
  },

  feedback: {
    model: 'feedback',
    label: 'Feedback',
    capabilities: { create: true, update: true, delete: true },
    searchFields: ['message', 'email', 'category', 'source'],
    listColumns: ['id', 'category', 'email', 'createdAt'],
    fields: [
      idField,
      { name: 'message', label: 'Message', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'string', nullable: true },
      { name: 'category', label: 'Category', type: 'string', nullable: true },
      { name: 'source', label: 'Source', type: 'string', nullable: true },
      { name: 'createdAt', label: 'Created', type: 'datetime', readOnly: true },
    ],
  },

  photos: {
    model: 'photo',
    label: 'Photos',
    // Photos are created via Cloudinary upload, not a form. Status + delete only.
    capabilities: { create: false, update: true, delete: true },
    searchFields: ['originalName', 'submittedBy'],
    listColumns: ['id', 'originalName', 'submittedBy', 'submissionStatus', 'createdAt'],
    fields: [
      idField,
      { name: 'submittedBy', label: 'Submitted By', type: 'string', readOnly: true },
      { name: 'storedPath', label: 'Stored Path', type: 'string', readOnly: true },
      { name: 'url', label: 'URL', type: 'string', readOnly: true },
      { name: 'mimeType', label: 'MIME Type', type: 'string', readOnly: true },
      { name: 'originalName', label: 'Original Name', type: 'string', readOnly: true },
      { name: 'fileSize', label: 'File Size', type: 'number', readOnly: true },
      submissionStatusField,
      ...timestampFields,
    ],
  },
};

export function getTable(slug: string): TableDef | undefined {
  return Object.prototype.hasOwnProperty.call(TABLES, slug) ? TABLES[slug] : undefined;
}

/** Date-only field types render as YYYY-MM-DD rather than full ISO timestamps. */
const DATE_ONLY_FIELDS = new Set<string>(['date', 'meetingDate']);

/**
 * Coerce a NON-EMPTY input value into the shape Prisma expects for a field.
 * (Empty values are handled upstream in buildWriteData.)
 * Throws on invalid enum / number / date / JSON so callers can return a 400.
 */
export function coerceField(field: FieldDef, value: unknown): unknown {
  switch (field.type) {
    case 'number': {
      const n = Number(value);
      if (Number.isNaN(n)) throw new Error(`Field "${field.name}" must be a number.`);
      return Math.trunc(n);
    }
    case 'decimal': {
      const n = Number(value);
      if (Number.isNaN(n)) throw new Error(`Field "${field.name}" must be a number.`);
      return n;
    }
    case 'boolean':
      return value === true || value === 'true' || value === 'on' || value === 1;
    case 'date':
    case 'datetime': {
      const d = new Date(value as string);
      if (Number.isNaN(d.getTime())) throw new Error(`Field "${field.name}" must be a valid date.`);
      return d;
    }
    case 'json': {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Field "${field.name}" must be valid JSON.`);
        }
      }
      return value;
    }
    case 'enum': {
      const v = String(value);
      if (field.enumValues && !field.enumValues.includes(v)) {
        throw new Error(`Field "${field.name}" must be one of: ${field.enumValues.join(', ')}.`);
      }
      return v;
    }
    case 'string':
    case 'text':
    default:
      return String(value);
  }
}

function isEmptyValue(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

/**
 * Build a Prisma `data` object from a request body, honouring the registry.
 * Skips readOnly fields. For each writable field present in the body:
 *   - empty + required          -> throw (400)
 *   - empty + nullable          -> set NULL
 *   - empty + (default-backed)  -> omit (let db default / existing value stand)
 *   - non-empty                 -> coerce to the declared type
 * On create (requireAll), a missing required field also throws.
 */
export function buildWriteData(
  table: TableDef,
  body: Record<string, unknown>,
  requireAll: boolean
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of table.fields) {
    if (field.readOnly) continue;
    const present = Object.prototype.hasOwnProperty.call(body, field.name);

    if (!present) {
      if (requireAll && field.required) {
        throw new Error(`Field "${field.name}" is required.`);
      }
      continue;
    }

    const raw = body[field.name];
    // Booleans are never "empty" — false is a valid value.
    if (field.type !== 'boolean' && isEmptyValue(raw)) {
      if (field.required) throw new Error(`Field "${field.name}" is required.`);
      if (field.nullable) data[field.name] = null;
      // else: omit so the column default / existing value is preserved.
      continue;
    }

    data[field.name] = coerceField(field, raw);
  }
  return data;
}

/**
 * Serialize a Prisma row into JSON-friendly values:
 * Decimal -> number, Date -> ISO (date-only fields -> YYYY-MM-DD).
 */
export function serializeRecord(
  table: TableDef,
  row: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const field of table.fields) {
    const value = out[field.name];
    if (value === null || value === undefined) continue;
    if (field.type === 'decimal') {
      out[field.name] = Number(value);
    } else if (field.type === 'date' || field.type === 'datetime') {
      const d = value instanceof Date ? value : new Date(value as string);
      if (!Number.isNaN(d.getTime())) {
        out[field.name] = DATE_ONLY_FIELDS.has(field.name)
          ? d.toISOString().split('T')[0]
          : d.toISOString();
      }
    }
  }
  return out;
}
