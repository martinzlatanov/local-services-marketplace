import bcrypt from 'bcrypt'
import pg from 'pg'

const { Client } = pg
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL || DATABASE_URL.includes('localhost')) {
  console.error('Set DATABASE_URL to your Neon connection string, e.g.:')
  console.error('  DATABASE_URL="postgres://..." node apps/web/scripts/seed.mjs')
  process.exit(1)
}

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
await client.connect()
console.log('Connected.\n')

await client.query(`DELETE FROM reviews`)
await client.query(`DELETE FROM user_roles`)
await client.query(`DELETE FROM jobs`)
await client.query(`DELETE FROM users`)
await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1`)
await client.query(`ALTER SEQUENCE jobs_id_seq RESTART WITH 1`)
await client.query(`ALTER SEQUENCE reviews_id_seq RESTART WITH 1`)

const hash = (pw) => bcrypt.hash(pw, 10)

// Clients and Providers
const users = [
  { email: 'admin@admin.com', password: 'admin', name: 'Admin User', roles: ['CLIENT'] },
  { email: 'james.hartley@gmail.com', password: 'password123', name: 'James Hartley', roles: ['CLIENT'] },
  { email: 'sophie.ward@gmail.com', password: 'password123', name: 'Sophie Ward', roles: ['CLIENT'] },
  { email: 'oliver.marsh@gmail.com', password: 'password123', name: 'Oliver Marsh', roles: ['CLIENT'] },
  { email: 'emma.brooks@gmail.com', password: 'password123', name: 'Emma Brooks', roles: ['CLIENT'] },
  { email: 'alice.johnson@gmail.com', password: 'password123', name: 'Alice Johnson', roles: ['CLIENT'] },
  { email: 'tom.reeves@gmail.com', password: 'password123', name: 'Tom Reeves', roles: ['PROVIDER'] },
  { email: 'linda.price@gmail.com', password: 'password123', name: 'Linda Price', roles: ['PROVIDER'] },
  { email: 'dan.kelly@gmail.com', password: 'password123', name: 'Dan Kelly', roles: ['PROVIDER'] },
  { email: 'sarah.newton@gmail.com', password: 'password123', name: 'Sarah Newton', roles: ['PROVIDER'] },
  { email: 'michael.brown@gmail.com', password: 'password123', name: 'Michael Brown', roles: ['PROVIDER'] },
  { email: 'jenny.smith@gmail.com', password: 'password123', name: 'Jenny Smith', roles: ['PROVIDER'] },
  { email: 'john.davis@gmail.com', password: 'password123', name: 'John Davis', roles: ['PROVIDER'] },
]

const inserted = []
for (const u of users) {
  const passwordHash = await hash(u.password)
  const res = await client.query(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
    [u.email, passwordHash, u.name]
  )
  const userId = res.rows[0].id
  inserted.push({ ...res.rows[0], roles: u.roles, id: userId })

  // Insert roles
  for (const role of u.roles) {
    await client.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, role]
    )
  }
  console.log(`  + ${u.email} (${u.roles.join(', ')})`)
}

const [admin, james, sophie, oliver, emma, alice, tom, linda, dan, sarah, michael, jenny, john] = inserted

// 30 diverse jobs with different statuses
const jobs = [
  // PENDING (not accepted yet)
  { clientId: james.id, category: 'PLUMBING', description: 'Boiler making loud banging noise and losing pressure. Needs inspection and likely a powerflush.', timeframe: 'Within 3 days', city: 'Clapham, London', status: 'PENDING', providerId: null },
  { clientId: james.id, category: 'ELECTRICAL', description: 'Rewire two bedroom sockets and install a new consumer unit. House is from the 1970s.', timeframe: 'This weekend', city: 'Clapham, London', status: 'PENDING', providerId: null },
  { clientId: sophie.id, category: 'CLEANING', description: 'End of tenancy deep clean for a 3-bed flat. Carpets, oven, and bathrooms all need attention.', timeframe: 'Next Friday', city: 'Hackney, London', status: 'PENDING', providerId: null },
  { clientId: sophie.id, category: 'GARDENING', description: 'Overgrown back garden needs full clearance, hedge trimming and lawn mowing. About 60sqm.', timeframe: 'This weekend', city: 'Hackney, London', status: 'PENDING', providerId: null },
  { clientId: oliver.id, category: 'PAINTING', description: 'Paint living room and hallway — walls and ceiling. Will provide paint, just need labour.', timeframe: 'Flexible, 2 weeks', city: 'Islington, London', status: 'PENDING', providerId: null },

  // ACCEPTED (provider accepted but not started)
  { clientId: oliver.id, category: 'HANDYMAN', description: 'Assemble 4 flat-pack IKEA wardrobes and mount a 65-inch TV on a plasterboard wall.', timeframe: 'Saturday morning', city: 'Islington, London', status: 'ACCEPTED', providerId: tom.id },
  { clientId: emma.id, category: 'MOVING', description: 'Moving a 2-bed flat contents across London. Have boxes ready, need a van and 2 helpers.', timeframe: 'Next Saturday', city: 'Brixton, London', status: 'ACCEPTED', providerId: linda.id },
  { clientId: emma.id, category: 'PLUMBING', description: 'Kitchen tap dripping constantly. Bathroom sink drain also slow — possible blockage.', timeframe: 'ASAP', city: 'Brixton, London', status: 'ACCEPTED', providerId: dan.id },
  { clientId: admin.id, category: 'ELECTRICAL', description: 'Install 4 outdoor weatherproof sockets in the garden and run cable from the garage.', timeframe: 'Within a week', city: 'Shoreditch, London', status: 'ACCEPTED', providerId: sarah.id },
  { clientId: alice.id, category: 'CLEANING', description: 'Weekly domestic cleaning for a 4-bed house. 3 hours per visit, every Thursday morning.', timeframe: 'Ongoing from Monday', city: 'Shoreditch, London', status: 'ACCEPTED', providerId: linda.id },

  // IN_PROGRESS (provider is working on it)
  { clientId: james.id, category: 'CLEANING', description: 'Post-renovation cleanup. Dust and debris everywhere, windows and floors need deep clean.', timeframe: 'This week', city: 'Clapham, London', status: 'IN_PROGRESS', providerId: jenny.id },
  { clientId: sophie.id, category: 'HANDYMAN', description: 'Fix leaky bathroom faucet, caulk shower, and patch drywall holes.', timeframe: 'Next week', city: 'Hackney, London', status: 'IN_PROGRESS', providerId: john.id },
  { clientId: oliver.id, category: 'GARDENING', description: 'Garden design consultation and planting. Looking for a Mediterranean style garden.', timeframe: 'This month', city: 'Islington, London', status: 'IN_PROGRESS', providerId: michael.id },
  { clientId: emma.id, category: 'PAINTING', description: 'Kitchen cabinet refinishing and new hardware installation.', timeframe: 'Within 2 weeks', city: 'Brixton, London', status: 'IN_PROGRESS', providerId: tom.id },
  { clientId: alice.id, category: 'PLUMBING', description: 'Replace old copper pipes with new PEX in kitchen and bathrooms.', timeframe: 'This month', city: 'Shoreditch, London', status: 'IN_PROGRESS', providerId: dan.id },

  // COMPLETED (with good reviews)
  { clientId: james.id, category: 'ELECTRICAL', description: 'Install new light fixtures throughout the house and add dimmer switches.', timeframe: 'Completed', city: 'Clapham, London', status: 'COMPLETED', providerId: sarah.id },
  { clientId: sophie.id, category: 'CLEANING', description: 'Spring cleaning - windows, carpets, and all furniture polishing.', timeframe: 'Completed', city: 'Hackney, London', status: 'COMPLETED', providerId: jenny.id },
  { clientId: oliver.id, category: 'PLUMBING', description: 'Install new bathroom suite including toilet, sink, and shower enclosure.', timeframe: 'Completed', city: 'Islington, London', status: 'COMPLETED', providerId: tom.id },
  { clientId: emma.id, category: 'HANDYMAN', description: 'Build custom shelving units in home office. 3 shelves, wall-mounted.', timeframe: 'Completed', city: 'Brixton, London', status: 'COMPLETED', providerId: john.id },
  { clientId: alice.id, category: 'GARDENING', description: 'Lawn care and garden maintenance. Weekly mowing and weeding.', timeframe: 'Completed', city: 'Shoreditch, London', status: 'COMPLETED', providerId: michael.id },
  { clientId: admin.id, category: 'PAINTING', description: 'Paint entire exterior of house. Including trim and doors.', timeframe: 'Completed', city: 'Shoreditch, London', status: 'COMPLETED', providerId: linda.id },

  // More COMPLETED jobs with mixed reviews
  { clientId: james.id, category: 'MOVING', description: 'Help moving furniture to new apartment. 2 people for 4 hours.', timeframe: 'Completed', city: 'Clapham, London', status: 'COMPLETED', providerId: linda.id },
  { clientId: sophie.id, category: 'ELECTRICAL', description: 'Install ceiling fan in master bedroom with integrated light.', timeframe: 'Completed', city: 'Hackney, London', status: 'COMPLETED', providerId: dan.id },
  { clientId: oliver.id, category: 'CLEANING', description: 'Office space deep clean and sanitization.', timeframe: 'Completed', city: 'Islington, London', status: 'COMPLETED', providerId: sarah.id },
  { clientId: emma.id, category: 'GARDENING', description: 'Remove dead tree and tree stump from backyard.', timeframe: 'Completed', city: 'Brixton, London', status: 'COMPLETED', providerId: michael.id },
  { clientId: alice.id, category: 'HANDYMAN', description: 'Hang framed artwork and mirrors on walls. 12 pieces total.', timeframe: 'Completed', city: 'Shoreditch, London', status: 'COMPLETED', providerId: tom.id },
  { clientId: admin.id, category: 'CLEANING', description: 'After-party cleanup. Restore apartment to pristine condition.', timeframe: 'Completed', city: 'Shoreditch, London', status: 'COMPLETED', providerId: jenny.id },
  { clientId: james.id, category: 'PLUMBING', description: 'Repair water heater and adjust temperature settings.', timeframe: 'Completed', city: 'Clapham, London', status: 'COMPLETED', providerId: dan.id },
  { clientId: sophie.id, category: 'PAINTING', description: 'Bedroom refresh with new paint color and accent wall.', timeframe: 'Completed', city: 'Hackney, London', status: 'COMPLETED', providerId: john.id },
]

const catResult = await client.query(`SELECT id, name FROM job_categories`)
const categoryMap = Object.fromEntries(catResult.rows.map(r => [r.name, r.id]))
const locResult = await client.query(`SELECT id, name FROM locations`)
const locationMap = Object.fromEntries(locResult.rows.map(r => [r.name, r.id]))

const createdJobs = []
for (const j of jobs) {
  const categoryId = categoryMap[j.category]
  const locationId = locationMap[j.city]
  if (!categoryId) throw new Error(`Unknown category: ${j.category}`)
  if (!locationId) throw new Error(`Unknown city area: ${j.city}`)

  const res = await client.query(
    `INSERT INTO jobs (category_id, location_id, description, timeframe, client_id, status, provider_id, version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [categoryId, locationId, j.description, j.timeframe, j.clientId, j.status, j.providerId, 1]
  )
  createdJobs.push({ ...j, id: res.rows[0].id })
  console.log(`  + [${j.status}] [${j.category}] ${j.description.substring(0, 50)}...`)
}

// Create realistic reviews for COMPLETED jobs
const reviews = [
  // Excellent reviews
  { jobId: createdJobs[15].id, reviewerId: james.id, revieweeId: sarah.id, reviewType: 'client', communication: 5, quality: 5, punctuality: 5, text: 'Sarah did an amazing job! Very professional, arrived on time, and the work quality is excellent. Highly recommend!' },
  { jobId: createdJobs[16].id, reviewerId: sophie.id, revieweeId: jenny.id, reviewType: 'client', communication: 5, quality: 5, punctuality: 5, text: 'Jenny was fantastic! Thorough, friendly, and left everything spotless. Will definitely hire again.' },
  { jobId: createdJobs[17].id, reviewerId: oliver.id, revieweeId: tom.id, reviewType: 'client', communication: 5, quality: 4, punctuality: 5, text: 'Tom is a skilled plumber. Work was completed efficiently and to high standard. Very satisfied.' },
  { jobId: createdJobs[18].id, reviewerId: emma.id, revieweeId: john.id, reviewType: 'client', communication: 5, quality: 5, punctuality: 4, text: 'John did excellent work on the shelving. Very professional and neat. Delivered on time.' },
  { jobId: createdJobs[19].id, reviewerId: alice.id, revieweeId: michael.id, reviewType: 'client', communication: 5, quality: 5, punctuality: 5, text: 'Michael maintains our garden beautifully. Reliable, professional, and attention to detail is impeccable.' },

  // Good reviews (4 stars)
  { jobId: createdJobs[20].id, reviewerId: admin.id, revieweeId: linda.id, reviewType: 'client', communication: 4, quality: 4, punctuality: 4, text: 'Linda did a good job painting the house. Work was good quality but took a bit longer than expected.' },
  { jobId: createdJobs[21].id, reviewerId: james.id, revieweeId: linda.id, reviewType: 'client', communication: 4, quality: 4, punctuality: 4, text: 'Linda helped with moving. Strong and efficient. Would use again.' },
  { jobId: createdJobs[22].id, reviewerId: sophie.id, revieweeId: dan.id, reviewType: 'client', communication: 4, quality: 4, punctuality: 5, text: 'Dan installed the ceiling fan nicely. Work was clean and he arrived exactly on time.' },
  { jobId: createdJobs[23].id, reviewerId: oliver.id, revieweeId: sarah.id, reviewType: 'client', communication: 4, quality: 4, punctuality: 4, text: 'Sarah did a solid job cleaning the office. Professional approach.' },
  { jobId: createdJobs[24].id, reviewerId: emma.id, revieweeId: michael.id, reviewType: 'client', communication: 4, quality: 5, punctuality: 4, text: 'Michael removed the tree professionally. Great work, very satisfied.' },

  // Average reviews (3 stars)
  { jobId: createdJobs[25].id, reviewerId: alice.id, revieweeId: tom.id, reviewType: 'client', communication: 3, quality: 3, punctuality: 3, text: 'Tom hung the artwork, but the placement could have been better planned. OK job overall.' },
  { jobId: createdJobs[26].id, reviewerId: admin.id, revieweeId: jenny.id, reviewType: 'client', communication: 3, quality: 3, punctuality: 3, text: 'Jenny did an okay job with the cleanup. Some spots were missed but nothing major.' },
  { jobId: createdJobs[27].id, reviewerId: james.id, revieweeId: dan.id, reviewType: 'client', communication: 3, quality: 3, punctuality: 4, text: 'Dan fixed the water heater. Works okay now, but explanation could have been clearer.' },

  // Below average reviews (2 stars)
  { jobId: createdJobs[28].id, reviewerId: sophie.id, revieweeId: john.id, reviewType: 'client', communication: 2, quality: 2, punctuality: 3, text: 'John did the painting but color came out darker than expected. Had to discuss rework.' },
]

for (const review of reviews) {
  const res = await client.query(
    `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, review_type, client_communication, client_quality, client_punctuality, text, approved_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`,
    [review.jobId, review.reviewerId, review.revieweeId, review.reviewType, review.communication, review.quality, review.punctuality, review.text]
  )
  console.log(`  + Review for job ${review.jobId} from client ${review.reviewerId}`)
}

await client.end()
console.log(`
Seed complete!

✅ Created 13 users (5 clients, 8 providers)
✅ Created 30 jobs with mixed statuses:
   - 5 PENDING (awaiting acceptance)
   - 5 ACCEPTED (provider accepted)
   - 5 IN_PROGRESS (work in progress)
   - 15 COMPLETED (with reviews)

✅ Created 14 reviews with mixed ratings:
   - 5 Excellent (5 stars)
   - 5 Good (4 stars)
   - 3 Average (3 stars)
   - 1 Below Average (2 stars)

Login credentials (password: password123):
  Clients:
    james.hartley@gmail.com
    sophie.ward@gmail.com
    oliver.marsh@gmail.com
    emma.brooks@gmail.com
    alice.johnson@gmail.com

  Providers:
    tom.reeves@gmail.com
    linda.price@gmail.com
    dan.kelly@gmail.com
    sarah.newton@gmail.com
    michael.brown@gmail.com
    jenny.smith@gmail.com
    john.davis@gmail.com
`)
