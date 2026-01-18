# Test Users Created

**Date:** 2026-01-11
**Status:** ✅ Complete

## Users

| Tier | Email | Password | User ID | Status |
|------|-------|----------|---------|--------|
| Free | free@test.propequitylab.com | TestPass123! | 0380d07e-950e-4a7e-9180-f6e7ff107fe4 | ✅ Created |
| Premium | premium@test.propequitylab.com | TestPass123! | 1542bb50-a6cb-4041-8e8f-4d2ff0c44399 | ✅ Created |
| Pro | pro@test.propequitylab.com | TestPass123! | 3cae4493-c535-4ae2-ac4f-bcc3230d5207 | ✅ Created |

## Login

You can login to any of these accounts using:
- Email: (from table above)
- Password: `TestPass123!`

## API Access

To get an access token for any user:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"free@test.propequitylab.com","password":"TestPass123!"}'
```

## Notes

- All users have `email_verified=true`
- All users have `onboarding_completed=false`
- Ready for sample data population (Task 3)
