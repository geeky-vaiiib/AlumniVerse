# AlumniVerse Backend Dependency Upgrade Guide

This document outlines breaking changes and migration steps for major dependency updates.

## Safe Updates (Already Applied)

The following packages have been updated to their latest versions:

| Package | Old | New | Notes |
|---------|-----|-----|-------|
| @supabase/supabase-js | 2.58.0 | 2.93.3 | Patch/minor updates only |
| axios | 1.12.2 | 1.13.4 | Minor updates |
| cors | 2.8.5 | 2.8.6 | Patch update |
| express-validator | 7.2.1 | 7.3.1 | Minor update |
| jsonwebtoken | 9.0.2 | 9.0.3 | Patch update |
| pg | 8.16.3 | 8.18.0 | Minor update |
| jest | 30.1.3 | 30.2.0 | Minor update |
| nodemon | 3.1.10 | 3.1.11 | Patch update |
| supertest | 7.1.4 | 7.2.2 | Minor update |

---

## Major Updates (Requires Manual Migration)

### Express 4.x → 5.x

**Current**: 4.22.1 → **Latest**: 5.2.1

**Breaking Changes**:
1. `req.host` now returns just hostname (port stripped)
2. `req.query` is no longer a plain object, use `Object.keys()`
3. Removed `app.param(fn)` signature
4. Promise rejection handling is automatic
5. Regular expression paths require escaping

**Migration Steps**:
```bash
npm install express@5
# Test all routes manually
```

---

### Helmet 7.x → 8.x

**Current**: 7.2.0 → **Latest**: 8.1.0

**Breaking Changes**:
1. Default CSP now blocks inline scripts/styles
2. `crossOriginEmbedderPolicy` defaults to `require-corp`

**Migration Steps**:
```javascript
// Update helmet config
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // Add 'unsafe-inline' if needed
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

---

### UUID 9.x → 13.x

**Current**: 9.0.1 → **Latest**: 13.0.0

**Breaking Changes**:
1. `uuid.v4()` renamed to `uuid.uuidv4()`
2. New import style recommended

**Migration Steps**:
```javascript
// Old
const { v4: uuidv4 } = require('uuid');

// New (v13+)
import { v4 as uuidv4 } from 'uuid';
```

---

### Nodemailer 6.x → 7.x

**Current**: 6.10.1 → **Latest**: 7.0.13

**Breaking Changes**:
1. Dropped Node.js 12-16 support (requires Node 18+)
2. Changed OAuth2 handling

**Migration Steps**:
- Ensure Node.js ≥ 18
- Review OAuth2 configuration if used

---

### Multer 1.x → 2.x

**Current**: 1.4.5-lts.2 → **Latest**: 2.0.2

**Breaking Changes**:
1. Promise-based API
2. `req.file` / `req.files` may be undefined instead of null

**Migration Steps**:
```javascript
// Add null checks
if (req.file) {
  // process file
}
```

---

### bcrypt 5.x → 6.x

**Current**: 5.1.1 → **Latest**: 6.0.0

**Breaking Changes**:
1. Dropped Node.js 14-16 support
2. Minor API changes

**Migration Steps**:
- Ensure Node.js ≥ 18
- Test hash generation/verification

---

### dotenv 16.x → 17.x

**Current**: 16.6.1 → **Latest**: 17.2.3

**Breaking Changes**:
1. Changed multiline value parsing

**Migration Steps**:
- Review any multiline env values
- Test environment loading

---

## Recommended Migration Order

1. ✅ Safe updates (already done)
2. **Express 5** (highest impact, test thoroughly)
3. **Helmet 8** (CSP changes may break frontend)
4. **UUID 13** (minor code changes)
5. **Nodemailer 7** (if using email)
6. **Multer 2** (if using file uploads)
7. **bcrypt 6** (Node.js version dependent)
8. **dotenv 17** (lowest risk)

---

## Testing After Updates

```bash
# Run all tests
cd backend && npm test

# Start server and verify endpoints
npm run dev

# Test health endpoint
curl http://localhost:5001/health
```
