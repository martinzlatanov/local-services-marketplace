# Vercel Deployment Guide

## Prerequisites
1. Vercel account connected to GitHub
2. Neon production database provisioned

## Steps
1. Run `npm install -g vercel`
2. Run `vercel login`
3. Run `vercel --prod` from project root
4. In Vercel dashboard: Settings → Environment Variables → Add all vars from .env.production
5. Redeploy if needed: `vercel --prod`

## Environment Variables
- DATABASE_URL: Neon production connection string
- JWT_SECRET: Strong secret key
- NEXT_PUBLIC_WS_URL: (Optional) WebSocket URL

## Notes
- Set root directory to `apps/web` in Vercel project settings
- The `vercel.json` at root identifies the project
- Use `vercel --prod` for production deployments
- Run `vercel` (without --prod) for preview deployments
