# Deployment Guide

## Prerequisites
- Node.js v18+
- PostgreSQL Database (Supabase recommended)
- Supabase Project (for Auth & Storage)

## Environment Variables
Ensure `.env` files are configured in `apps/server` and `apps/client`.

### Server `.env`
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PORT=3000
JWT_SECRET="your-secret"
SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
CLIENT_URL="http://localhost:5173"
```

### Client `.env`
```env
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY="eyJ..."
VITE_API_URL="http://localhost:3000/api"
```

## Build & Run

### Server
```bash
cd apps/server
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

### Client
```bash
cd apps/client
npm install
npm run build
npm run preview
```

## Database Seeding
To populate demo data:
```bash
cd apps/server
npx prisma db seed
```

## Troubleshooting
- **Prisma Errors**: Ensure `DATABASE_URL` is correct and accessible.
- **CORS Issues**: Check `CLIENT_URL` in server `.env`.
- **Auth Issues**: Verify Supabase keys and URL.
