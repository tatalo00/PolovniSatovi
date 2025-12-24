# Design Document: Platform Testing & QA

## Overview

This design document outlines a comprehensive testing and quality assurance strategy for the PolovniSatovi watch marketplace platform. The approach combines build verification, API testing, integration testing, and manual verification to ensure all platform features work correctly.

## Architecture

The testing strategy follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Build Verification                        │
│         (TypeScript compilation, route validation)           │
├─────────────────────────────────────────────────────────────┤
│                    Unit/Integration Tests                    │
│              (API routes, business logic)                    │
├─────────────────────────────────────────────────────────────┤
│                    E2E/Manual Testing                        │
│           (User flows, UI interactions)                      │
├─────────────────────────────────────────────────────────────┤
│                    Database Verification                     │
│         (Schema validation, query performance)               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Build Verification Component

Responsible for validating the build process completes successfully.

```typescript
interface BuildVerification {
  runPrismaGenerate(): Promise<BuildResult>;
  runNextBuild(): Promise<BuildResult>;
  validateRoutes(): Promise<RouteValidationResult>;
}

interface BuildResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  duration: number;
}
```

### 2. API Testing Component

Tests all API endpoints for correct behavior.

```typescript
interface APITestSuite {
  testAuthEndpoints(): Promise<TestResults>;
  testListingEndpoints(): Promise<TestResults>;
  testAdminEndpoints(): Promise<TestResults>;
  testMessagingEndpoints(): Promise<TestResults>;
  testReviewEndpoints(): Promise<TestResults>;
  testFavoriteEndpoints(): Promise<TestResults>;
  testUploadEndpoints(): Promise<TestResults>;
  testSellerEndpoints(): Promise<TestResults>;
}

interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  details: TestDetail[];
}
```

### 3. Page Verification Component

Validates frontend pages render correctly.

```typescript
interface PageVerification {
  testPublicPages(): Promise<PageTestResults>;
  testAuthenticatedPages(): Promise<PageTestResults>;
  testAdminPages(): Promise<PageTestResults>;
  testErrorBoundaries(): Promise<PageTestResults>;
}
```

### 4. Database Verification Component

Validates database schema and query performance.

```typescript
interface DatabaseVerification {
  validateSchema(): Promise<SchemaResult>;
  testIndexUsage(): Promise<IndexResult>;
  validateRelations(): Promise<RelationResult>;
}
```

## Data Models

### Test Configuration

```typescript
interface TestConfig {
  baseUrl: string;
  testUserCredentials: {
    buyer: { email: string; password: string };
    seller: { email: string; password: string };
    admin: { email: string; password: string };
  };
  timeouts: {
    api: number;
    page: number;
    build: number;
  };
}
```

### Test Report

```typescript
interface TestReport {
  timestamp: Date;
  buildStatus: BuildResult;
  apiTests: TestResults;
  pageTests: PageTestResults;
  databaseTests: DatabaseResult;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    coverage: number;
  };
  issues: Issue[];
}

interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location: string;
  suggestedFix?: string;
}
```

## Testing Approach

### Phase 1: Build Verification

1. Run `prisma generate` to ensure schema is valid
2. Run `npm run build` to compile TypeScript and validate routes
3. Capture and categorize any errors
4. Fix critical build errors before proceeding

### Phase 2: API Route Testing

For each API endpoint:
1. Test happy path with valid data
2. Test validation with invalid data
3. Test authentication requirements
4. Test authorization (role-based access)
5. Test error handling

### Phase 3: Frontend Page Testing

1. Verify all public pages render
2. Verify authenticated pages with session
3. Verify admin pages with admin session
4. Test error boundaries

### Phase 4: Integration Testing

1. Test complete user flows (signup → create listing → submit)
2. Test buyer-seller messaging flow
3. Test admin moderation flow

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auth Signup Validation

*For any* email and password combination, if the email is valid format and password meets strength requirements, signup SHALL succeed and create a user; otherwise, signup SHALL fail with appropriate validation error.

**Validates: Requirements 2.1, 2.2**

### Property 2: Auth Signin Validation

*For any* email and password combination, if the user exists and password matches, signin SHALL succeed and create a session; otherwise, signin SHALL fail without revealing which credential was wrong.

**Validates: Requirements 2.3, 2.4**

### Property 3: Listing Creation Validation

*For any* listing data submitted by an authenticated user, if all required fields are present and valid, a DRAFT listing SHALL be created; otherwise, validation errors SHALL be returned.

**Validates: Requirements 3.1, 3.2**

### Property 4: Listing Filter Correctness

*For any* filter combination applied to the listings API, all returned listings SHALL match every specified filter criterion, and no matching listings SHALL be excluded.

**Validates: Requirements 3.3, 3.4**

### Property 5: Listing Authorization

*For any* listing modification request, the operation SHALL succeed only if the requester is the listing owner or an admin; otherwise, 403 SHALL be returned.

**Validates: Requirements 3.5, 3.6, 3.8**

### Property 6: Admin Listing Moderation

*For any* PENDING listing, admin approval SHALL change status to APPROVED, and admin rejection SHALL change status to REJECTED with the provided reason stored.

**Validates: Requirements 4.1, 4.2**

### Property 7: Admin Authorization

*For any* request to admin endpoints, if the requester does not have ADMIN role, 403 SHALL be returned regardless of the operation.

**Validates: Requirements 4.3**

### Property 8: Message Thread Access Control

*For any* message thread, only users who are the buyer or seller in that thread SHALL be able to access it; all other users SHALL receive 403.

**Validates: Requirements 5.4, 5.5**

### Property 9: Review Creation and Rating Update

*For any* valid review submission, the review SHALL be created and the seller's average rating SHALL be recalculated to include the new rating.

**Validates: Requirements 6.1, 6.4**

### Property 10: Favorites Toggle

*For any* listing and user, adding to favorites SHALL create a favorite record, removing SHALL delete it, and fetching favorites SHALL return exactly the user's favorited listings.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 11: API Error Response Consistency

*For any* API request, validation errors SHALL return 400, authentication failures SHALL return 401, and authorization failures SHALL return 403, each with appropriate error messages.

**Validates: Requirements 11.1, 11.2, 11.3**

## Error Handling

### Build Errors

| Error Type | Detection | Resolution |
|------------|-----------|------------|
| TypeScript compilation | Build fails with TS errors | Fix type errors in indicated files |
| Missing imports | Build fails with module not found | Add missing dependencies or fix import paths |
| Invalid route | Build fails with route validation | Fix route file structure or exports |
| Prisma schema | Generate fails | Fix schema syntax or relations |

### Runtime Errors

| Error Type | Detection | Resolution |
|------------|-----------|------------|
| Database connection | 500 errors on API calls | Check DATABASE_URL and connection |
| Auth configuration | Session errors | Verify AUTH_SECRET and callbacks |
| Missing env vars | Feature failures | Add required environment variables |
| Rate limiting | 429 responses | Adjust rate limit configuration |

### Test Failures

| Failure Type | Investigation | Resolution |
|--------------|---------------|------------|
| API returns wrong status | Check route logic | Fix conditional logic |
| Validation not working | Check Zod schemas | Update validation rules |
| Auth not enforcing | Check middleware | Fix auth checks |
| Data not persisting | Check Prisma queries | Fix database operations |

## Testing Strategy

### Testing Framework

The platform uses Next.js with TypeScript. For testing:

- **Build Testing**: `npm run build` with exit code verification
- **API Testing**: Direct HTTP requests to API routes
- **Manual Testing**: Browser-based verification of UI flows

### Test Categories

1. **Smoke Tests**: Verify build passes and basic pages load
2. **API Tests**: Verify all endpoints return expected responses
3. **Integration Tests**: Verify complete user flows work
4. **Regression Tests**: Verify fixes don't break existing functionality

### Test Execution Order

1. Build verification (must pass before other tests)
2. Database connection verification
3. Authentication flow tests
4. Core API tests (listings, favorites, messages)
5. Admin functionality tests
6. Frontend page rendering tests

### Property-Based Testing Configuration

For property-based tests, use a testing library like `fast-check` with:
- Minimum 100 iterations per property
- Seed-based reproducibility for debugging
- Shrinking enabled to find minimal failing cases

Each property test should be tagged with:
- **Feature: platform-testing-qa, Property {number}: {property_text}**

### Unit vs Property Test Balance

- **Unit tests**: Specific examples, edge cases, error conditions
- **Property tests**: Universal properties across all valid inputs
- Both are complementary and necessary for comprehensive coverage

## Implementation Notes

### Environment Requirements

```env
# Required for testing
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
AUTH_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Test Data Management

- Use separate test database or transactions that rollback
- Create test users with known credentials
- Clean up test data after test runs

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci
  
- name: Generate Prisma client
  run: npx prisma generate
  
- name: Run build
  run: npm run build
  
- name: Run tests
  run: npm test
```

