import { PrismaClient, SubmissionStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const businesses = [
  {
    name: 'Crown Heights Roastery',
    category: 'Food & Beverage',
    description: 'Specialty coffee shop and roaster sourcing single-origin beans directly from farms. Features a tasting bar and weekend cupping sessions.',
    address: '743 Franklin Ave, Brooklyn, NY 11238',
    phone: '(718) 555-0182',
    email: 'hello@crownheightsroastery.com',
    rating: 4.8,
    reviews: 214,
    hours: 'Mon–Fri 7am–7pm, Sat–Sun 8am–6pm',
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    name: 'Brooklyn Boulders Crown Heights',
    category: 'Health & Fitness',
    description: 'Indoor climbing gym with top-rope, bouldering walls, and fitness programming for all skill levels. Day passes available.',
    address: '575 Degraw St, Brooklyn, NY 11217',
    phone: '(718) 555-0344',
    email: 'crownheights@brooklynboulders.com',
    rating: 4.6,
    reviews: 389,
    hours: 'Mon–Fri 6am–11pm, Sat–Sun 8am–10pm',
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    name: 'Nostrand Avenue Books',
    category: 'Retail',
    description: 'Independent bookstore specializing in Caribbean literature, Black history, and local authors. Hosts author readings every second Saturday.',
    address: '1049 Nostrand Ave, Brooklyn, NY 11225',
    phone: '(718) 555-0271',
    email: 'info@nostrandavebooks.com',
    rating: 4.9,
    reviews: 127,
    hours: 'Tue–Sun 10am–8pm',
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    name: 'CH Tech Repair',
    category: 'Technology',
    description: 'Same-day phone, tablet, and laptop repair. Also offers mobile device trade-ins and refurbished electronics at fair prices.',
    address: '812 Rogers Ave, Brooklyn, NY 11226',
    phone: '(718) 555-0499',
    email: 'repairs@chtechrepair.com',
    rating: 4.5,
    reviews: 98,
    hours: 'Mon–Sat 9am–7pm',
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    name: 'Park Slope Family Law Group',
    category: 'Professional Services',
    description: 'Boutique family law firm serving Brooklyn families. Practices include divorce, custody, adoption, and guardianship. Free 30-minute consultations.',
    address: '291 Flatbush Ave, Brooklyn, NY 11217',
    phone: '(718) 555-0633',
    email: 'contact@psflawgroup.com',
    rating: 4.7,
    reviews: 61,
    hours: 'Mon–Fri 9am–6pm',
    submissionStatus: SubmissionStatus.APPROVED,
  },
];

const events = [
  {
    title: 'Crown Heights Farmers Market',
    category: 'Community Service',
    description: 'Weekly outdoor market featuring local produce, artisan goods, and prepared foods from over 30 vendors. Live music every week. Free and open to all.',
    date: new Date('2026-03-21'),
    time: '09:00 AM - 02:00 PM',
    location: 'Brower Park, Brooklyn, NY 11213',
    organizer: 'Crown Heights Neighborhood Association',
    attendees: 42,
    maxAttendees: 500,
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    title: 'Youth Basketball Spring League Registration',
    category: 'Sports & Recreation',
    description: 'Sign up your child (ages 8–14) for the spring basketball league. Games held Saturday mornings. All skill levels welcome. Equipment provided.',
    date: new Date('2026-03-28'),
    time: '10:00 AM - 01:00 PM',
    location: 'Wingate Park Recreation Center, 1100 Brooklyn Ave, Brooklyn, NY 11203',
    organizer: 'Brooklyn Parks & Recreation',
    attendees: 18,
    maxAttendees: 60,
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    title: 'Community Financial Literacy Workshop',
    category: 'Education',
    description: 'Free workshop covering budgeting basics, building credit, and first-time homebuyer programs available in Brooklyn. Childcare provided on request.',
    date: new Date('2026-04-05'),
    time: '11:00 AM - 01:30 PM',
    location: 'Crown Heights Library, 560 New York Ave, Brooklyn, NY 11225',
    organizer: 'Bedford Stuyvesant Restoration Corporation',
    attendees: 27,
    maxAttendees: 75,
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    title: 'Prospect Park Community Cleanup',
    category: 'Community Service',
    description: 'Join neighbors to beautify Prospect Park. Gloves and bags provided. Perfect for families and scout troops. Volunteer hours documentation available.',
    date: new Date('2026-04-12'),
    time: '08:00 AM - 12:00 PM',
    location: 'Prospect Park Boathouse, Brooklyn, NY 11215',
    organizer: 'Prospect Park Alliance',
    attendees: 53,
    maxAttendees: 200,
    submissionStatus: SubmissionStatus.APPROVED,
  },
  {
    title: 'Brooklyn Caribbean Heritage Festival Planning Meeting',
    category: 'Culture & Arts',
    description: 'Open community meeting to shape this summer\'s Caribbean Heritage Festival. Share ideas for performers, food vendors, and activities. All are welcome.',
    date: new Date('2026-04-19'),
    time: '06:00 PM - 08:30 PM',
    location: 'Empire Blvd Community Center, 1234 Empire Blvd, Brooklyn, NY 11213',
    organizer: 'Caribbean Cultural Arts Alliance',
    attendees: 14,
    maxAttendees: 100,
    submissionStatus: SubmissionStatus.APPROVED,
  },
];

async function main() {
  console.log('Seeding test data...');

  const createdBusinesses = await Promise.all(
    businesses.map(b => prisma.business.create({ data: b }))
  );
  console.log(`Created ${createdBusinesses.length} businesses`);

  const createdEvents = await Promise.all(
    events.map(e => prisma.event.create({ data: e }))
  );
  console.log(`Created ${createdEvents.length} events`);

  console.log('Seed complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
