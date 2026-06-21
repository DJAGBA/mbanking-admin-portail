# mbanking-admin

mbanking-admin is an internal administration platform for the **mbanking** solution, developed for **Yas-Togo**. It enables the management of users, pricing plans, rate limits, partner banks, and JWT token revocation. All routes (except authentication) require a valid JWT Bearer token.

## Tech Stack

| Technology   | Version |
|--------------|---------|
| Next.js      | 16.x    |
| TypeScript   | 5.x     |
| React        | 19.x    |
| Tailwind CSS | 4.x     |
| React Query  | Latest  |

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
git clone https://github.com/DJAGBA/mbanking-admin.git
cd mbanking-admin
npm install
```

### Environment Variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_API_URL=http://<host>:<port>
NEXT_PUBLIC_USE_MOCK=false
```

### Run

```bash
# Development
npm run dev

# Production
npm run build
```

## Project Structure

```
mbanking-admin/
├── app/
│   ├── (admin)/
│   │   ├── banks/
│   │   ├── dashboard/
│   │   ├── plans/
│   │   ├── rate-limits/
│   │   ├── url-limits/
│   │   └── users/
│   └── login/
├── components/
├── hooks/
├── services/
├── src/types/
└── lib/
```

## API Errors

| Code | Meaning               |
|------|-----------------------|
| 4000 | Validation error      |
| 4010 | Token absent          |
| 4011 | Token expired         |
| 4012 | Token invalid         |
| 4040 | Not found             |
| 4090 | Conflict / duplicate  |
| 4220 | Business rule error   |
| 5000 | Internal server error |

