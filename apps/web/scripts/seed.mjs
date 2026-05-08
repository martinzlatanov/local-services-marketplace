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

await client.query(`DELETE FROM jobs`)
await client.query(`DELETE FROM users`)
await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1`)
await client.query(`ALTER SEQUENCE jobs_id_seq RESTART WITH 1`)

const hash = (pw) => bcrypt.hash(pw, 10)

const users = [
  { email: 'admin@admin.com',         password: 'admin',       role: 'CLIENT'   },
  { email: 'james.hartley@gmail.com', password: 'password123', role: 'CLIENT'   },
  { email: 'sophie.ward@gmail.com',   password: 'password123', role: 'CLIENT'   },
  { email: 'oliver.marsh@gmail.com',  password: 'password123', role: 'CLIENT'   },
  { email: 'emma.brooks@gmail.com',   password: 'password123', role: 'CLIENT'   },
  { email: 'tom.reeves@gmail.com',    password: 'password123', role: 'PROVIDER' },
  { email: 'linda.price@gmail.com',   password: 'password123', role: 'PROVIDER' },
  { email: 'dan.kelly@gmail.com',     password: 'password123', role: 'PROVIDER' },
  { email: 'sarah.newton@gmail.com',  password: 'password123', role: 'PROVIDER' },
]

const inserted = []
for (const u of users) {
  const passwordHash = await hash(u.password)
  const res = await client.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role`,
    [u.email, passwordHash, u.role]
  )
  inserted.push(res.rows[0])
  console.log(`  + ${u.email} (${u.role})`)
}

const [admin, james, sophie, oliver, emma] = inserted

const jobs = [
  { clientId: james.id,  category: 'PLUMBING',   description: 'Boiler making loud banging noise and losing pressure. Needs inspection and likely a powerflush.',       timeframe: 'Within 3 days',     city: 'Clapham, London'    },
  { clientId: james.id,  category: 'ELECTRICAL', description: 'Rewire two bedroom sockets and install a new consumer unit. House is from the 1970s.',                  timeframe: 'This weekend',       city: 'Clapham, London'    },
  { clientId: sophie.id, category: 'CLEANING',   description: 'End of tenancy deep clean for a 3-bed flat. Carpets, oven, and bathrooms all need attention.',          timeframe: 'Next Friday',        city: 'Hackney, London'    },
  { clientId: sophie.id, category: 'GARDENING',  description: 'Overgrown back garden needs full clearance, hedge trimming and lawn mowing. About 60sqm.',              timeframe: 'This weekend',       city: 'Hackney, London'    },
  { clientId: oliver.id, category: 'PAINTING',   description: 'Paint living room and hallway — walls and ceiling. Will provide paint, just need labour.',               timeframe: 'Flexible, 2 weeks',  city: 'Islington, London'  },
  { clientId: oliver.id, category: 'HANDYMAN',   description: 'Assemble 4 flat-pack IKEA wardrobes and mount a 65-inch TV on a plasterboard wall.',                    timeframe: 'Saturday morning',   city: 'Islington, London'  },
  { clientId: emma.id,   category: 'MOVING',     description: 'Moving a 2-bed flat contents across London. Have boxes ready, need a van and 2 helpers.',               timeframe: 'Next Saturday',      city: 'Brixton, London'    },
  { clientId: emma.id,   category: 'PLUMBING',   description: 'Kitchen tap dripping constantly. Bathroom sink drain also slow — possible blockage.',                   timeframe: 'ASAP',               city: 'Brixton, London'    },
  { clientId: admin.id,  category: 'ELECTRICAL', description: 'Install 4 outdoor weatherproof sockets in the garden and run cable from the garage.',                   timeframe: 'Within a week',      city: 'Shoreditch, London' },
  { clientId: admin.id,  category: 'CLEANING',   description: 'Weekly domestic cleaning for a 4-bed house. 3 hours per visit, every Thursday morning.',                timeframe: 'Ongoing from Monday',city: 'Shoreditch, London' },
]

for (const j of jobs) {
  await client.query(
    `INSERT INTO jobs (category, description, timeframe, city_area, client_id) VALUES ($1, $2, $3, $4, $5)`,
    [j.category, j.description, j.timeframe, j.city, String(j.clientId)]
  )
  console.log(`  + [${j.category}] ${j.description.substring(0, 60)}...`)
}

await client.end()
console.log(`
Seed complete!

Login credentials:
  admin@admin.com          / admin        (CLIENT)
  james.hartley@gmail.com  / password123  (CLIENT)
  sophie.ward@gmail.com    / password123  (CLIENT)
  oliver.marsh@gmail.com   / password123  (CLIENT)
  emma.brooks@gmail.com    / password123  (CLIENT)
  tom.reeves@gmail.com     / password123  (PROVIDER)
  linda.price@gmail.com    / password123  (PROVIDER)
  dan.kelly@gmail.com      / password123  (PROVIDER)
  sarah.newton@gmail.com   / password123  (PROVIDER)
`)
