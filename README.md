# Backend for Ladies Bag

This backend is a modular Node.js API built with Firebase Admin SDK. It provides user authentication, admin login, Firestore order management, and site configuration for the frontend.

## Structure

- `index.js` - Express server entrypoint
- `firebase.js` - Firebase Admin initialization
- `routes/` - API route definitions
- `controllers/` - Business logic for auth, orders, and admin settings
- `middleware/` - Firebase auth middleware
- `worker.js` - Cloudflare Worker proxy example
- `.env` - Environment variables for Firebase and admin credentials
- `wrangler.toml` - Cloudflare Worker configuration

## Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Add Firebase credentials

- Place your Firebase service account JSON file at `backend/serviceAccountKey.json`
- Update `backend/.env` with your Firebase settings and admin credentials

3. Start locally

```bash
npm start
```

## API Endpoints

### Auth
- `POST /auth/signup` - Create a new customer account
- `POST /auth/login` - Customer login
- `POST /auth/admin/login` - Admin login using the admin credentials from `.env`

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Admin-only: list all orders
- `GET /orders/:id` - Admin-only: get one order
- `PUT /orders/:id` - Admin-only: update order status or fields

### Admin
- `GET /admin/homepage` - Admin-only: fetch homepage configuration
- `PUT /admin/homepage` - Admin-only: update homepage, sections, custom code, and hero content

## Security

- Firebase token validation is done by `middleware/authMiddleware.js`
- Admin access is restricted to `ADMIN_EMAIL` in `.env`
- CORS allows the origin configured by `FRONTEND_ORIGIN`

## Cloudflare Workers

The `worker.js` file is an example proxy that forwards requests from a Cloudflare Worker to your backend server.

### Deploy as a worker

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Set your backend URL in `backend/worker.js`

3. From the `backend` folder run:

```bash
wrangler publish
```

If you use a worker as a proxy to a deployed backend, set the `BACKEND_URL` variable to the backend host.

## Netlify Integration

- Set `FRONTEND_ORIGIN` in `.env` to your Netlify frontend URL
- Use the backend API endpoints from the Netlify frontend via the Worker proxy or direct backend URL

## Notes

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured in `.env`
- `adminLogin` will create the admin user in Firebase if it does not already exist
- Use Firestore collection `orders` for order storage and `admin/homepage` for site configuration
