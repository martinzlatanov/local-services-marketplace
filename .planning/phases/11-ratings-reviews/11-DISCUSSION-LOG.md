# Phase 11: Ratings & Reviews — Discussion Log

**Date:** 2026-05-08  
**Participants:** Martin (user), Claude (assistant)  
**Outcome:** Context captured; 5 gray areas discussed and resolved.

---

## Gray Areas Discussed

### 1. Review Submission Eligibility
**Question:** When can reviews be posted? Who reviews whom (client→provider, provider→client, both)?

**Options presented:**
- Clients review providers only, after job COMPLETED
- Mutual reviews after completion
- Flexible after any status

**User selection:** **Mutual reviews after completion**

**Rationale:** Both parties benefit from feedback on each other's professionalism, communication, and reliability. Limits mutual transparency post-job.

---

### 2. Approval Workflow & Visibility
**Question:** How should pending (unapproved) reviews appear on the provider's profile?

**Options presented:**
- Completely hidden until approved
- Visible as 'pending approval' with dimmed styling
- Visible but clearly marked as unapproved

**User selection:** **Completely hidden until approved**

**Rationale:** Reduces social pressure; keeps profile clean until reviews are moderated.

**Sub-decision:** One review per job, per direction (enforced in schema).

---

### 3. Photo Handling & Storage
**Question:** How should optional photos be stored and served?

**Options presented:**
- Vercel Blob Storage (file-based)
- External service (Cloudinary/Imgur)
- Base64 data URLs in database

**User selection:** **Vercel Blob Storage (file-based)**

**Rationale:** Integrates with Vercel deployment; no third-party cost; simpler than data URLs.

---

### 4. Review Visibility & Scope
**Question:** What should providers and clients see about each other's reviews?

**Options presented:**
- Limited: each party sees only reviews about them
- Open: can browse all reviews (filtered by reviewer/reviewee)
- Private: only the reviewed party sees their own reviews

**User selection:** **Limited: each party sees only reviews about them**

**Rationale:** Encourages honest feedback; reduces gamification / social comparison.

---

### 5. Provider Review Categories (Sub-Decision)
**Question:** For provider-to-client reviews, what rating dimensions make sense?

**Options presented:**
- Same three (communication, quality, punctuality)
- Different categories for providers
- Simple 1-5 star only

**User selection:** **Different categories for providers**

**Specific categories:** Payment Reliability, Communication Clarity, Professionalism

**Rationale:** Reflects the dynamics of provider→client feedback; different concerns than quality of service.

---

### 6. Review Uniqueness (Sub-Decision)
**Question:** Should the system prevent reviewing the same job twice?

**Options presented:**
- One review per job, per direction
- Allow multiple reviews per job
- One permanent review per party pair

**User selection:** **One review per job, per direction**

**Rationale:** Prevents multiple reviews of the same work; encourages deliberate feedback.

---

### 7. Overall Rating Calculation (Sub-Decision)
**Question:** Should different rating categories contribute equally to the overall rating?

**Options presented:**
- Simple average of all categories
- Weighted average
- Overall + categories separate

**User selection:** **Simple average of all categories**

**Rationale:** Simplicity; fairness across dimensions.

---

### 8. Approval Process (Sub-Decision)
**Question:** Who can approve reviews, and how fast should that happen?

**Options presented:**
- Manual admin approval
- Auto-approve with flagging
- Queue + deadline (auto-approve after N days)

**User selection:** **Manual admin approval**

**Rationale:** Ensures quality moderation; prevents bad-faith reviews from appearing on profiles; fits capstone scope.

---

## Deferred Ideas

1. **Image moderation** — Automatic/manual flagging of inappropriate photos in reviews (v2)
2. **Spam/abuse detection** — System for flagging fake or malicious reviews (v2)
3. **Review responses** — Reviewee can reply to reviews they receive (v2)
4. **Rating badges** — "Top Rated" badges for providers hitting thresholds (v2)
5. **Review filtering/sorting** — Clients filter reviews by rating, date, relevance (v2)

---

## Notes for Downstream Agents

- **Researcher:** Investigate Vercel Blob upload/retrieval API; admin dashboard patterns for review moderation.
- **Planner:** Design schema for mutual reviews; plan API endpoints for review submission, approval, and retrieval; plan admin approval dashboard component.
- **Executor:** Implement Drizzle migrations; API routes; Blob storage integration; frontend review form and history sections.

