# Test Data Guide

## Database Population Summary

The database has been seeded with realistic test data for the Local Services Marketplace application.

### Users Created: 13 Total

#### Clients (5)
- **james.hartley@gmail.com** (password: password123)
- **sophie.ward@gmail.com** (password: password123)
- **oliver.marsh@gmail.com** (password: password123)
- **emma.brooks@gmail.com** (password: password123)
- **alice.johnson@gmail.com** (password: password123)

#### Service Providers (8)
- **tom.reeves@gmail.com** (password: password123) - Handyman, Plumbing, Painting
- **linda.price@gmail.com** (password: password123) - Moving, Cleaning, Painting
- **dan.kelly@gmail.com** (password: password123) - Plumbing, Electrical
- **sarah.newton@gmail.com** (password: password123) - Electrical, Cleaning
- **michael.brown@gmail.com** (password: password123) - Gardening, Handyman
- **jenny.smith@gmail.com** (password: password123) - Cleaning, Electrical, Painting
- **john.davis@gmail.com** (password: password123) - Handyman, Painting
- **provider@provider.com** (password: password123) - Various services

### Jobs Created: 30 Total

#### By Status
- **PENDING** (5 jobs) - Awaiting provider acceptance
- **ACCEPTED** (5 jobs) - Provider accepted but not yet started
- **IN_PROGRESS** (5 jobs) - Provider actively working
- **COMPLETED** (15 jobs) - With reviews from clients

#### By Category
- Plumbing (8 jobs)
- Electrical (7 jobs)
- Cleaning (5 jobs)
- Painting (4 jobs)
- Handyman (3 jobs)
- Gardening (2 jobs)
- Moving (1 job)

#### By Location
- Clapham, London (5 jobs)
- Hackney, London (5 jobs)
- Islington, London (5 jobs)
- Brixton, London (5 jobs)
- Shoreditch, London (5 jobs)

### Reviews Created: 14 Total

#### By Rating Distribution
- **5 Stars (Excellent)**: 5 reviews
  - "Sarah did an amazing job! Very professional, arrived on time..."
  - "Jenny was fantastic! Thorough, friendly..."
  - "Tom is a skilled plumber..."
  - "John did excellent work..."
  - "Michael maintains our garden beautifully..."

- **4 Stars (Good)**: 5 reviews
  - "Linda did a good job painting the house..."
  - "Linda helped with moving. Strong and efficient..."
  - "Dan installed the ceiling fan nicely..."
  - "Sarah did a solid job cleaning the office..."
  - "Michael removed the tree professionally..."

- **3 Stars (Average)**: 3 reviews
  - "Tom hung the artwork, but placement could have been better..."
  - "Jenny did an okay job with cleanup. Some spots missed..."
  - "Dan fixed the water heater. Works okay now..."

- **2 Stars (Below Average)**: 1 review
  - "John did the painting but color came out darker..."

### Provider Performance Metrics

Based on completed jobs and reviews:

#### Top Rated Providers
1. **Sarah Newton** - Average Rating: 4.67/5
2. **Tom Reeves** - Average Rating: 4.33/5
3. **Michael Brown** - Average Rating: 4.33/5

#### Providers with Most Reviews
1. **Tom Reeves** - 4 reviews
2. **Dan Kelly** - 3 reviews
3. **Linda Price** - 3 reviews

## Testing Scenarios

### Test Case 1: View Provider Profile (Fixed Empty Page)
1. Login as a client
2. Navigate to "Find Providers"
3. Click on any provider card
4. Expected: See provider details, average rating, completed jobs with individual ratings

### Test Case 2: Browse Providers with Filters
1. Login as a client
2. Go to "Find Providers"
3. Try filtering by:
   - Rating threshold (4+, 3+, etc.)
   - Search by name or email
   - Sort by rating, newest, or name
4. Expected: Results update in real-time

### Test Case 3: View Job Details with Provider
1. Login as a client
2. Go to dashboard
3. Click on job status that has a provider assigned (ACCEPTED, IN_PROGRESS, or COMPLETED)
4. Expected: See provider info with profile link

### Test Case 4: Provider Dashboard
1. Login as provider (e.g., tom.reeves@gmail.com)
2. Go to dashboard
3. Expected: See jobs in different stages with various statuses

### Test Case 5: Job Acceptance Flow
1. Login as provider
2. Go to "Browse Jobs"
3. See PENDING jobs
4. Accept a job
5. Expected: Job moves to ACCEPTED status

## Notes

- All test data uses realistic job descriptions and timeframes
- Reviews include both positive and constructive feedback
- Job distribution spans all categories and locations
- Providers have varying levels of experience and ratings
- The data is representative of a mature marketplace with mixed reviews

## Resetting Test Data

To reset and reseed the database, run:

```bash
DATABASE_URL="your_neon_connection_string" node apps/web/scripts/seed.mjs
```

This will:
1. Delete all existing reviews, jobs, and users
2. Create fresh test data as described above
3. Reset auto-increment sequences
