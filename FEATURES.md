# PolovniSatovi - Feature Documentation

## Overview

PolovniSatovi is a multi-seller marketplace for buying and selling used and vintage watches in the Balkan region. The platform connects buyers with sellers, allowing authenticated users to browse listings, contact sellers, and manage their own listings as sellers.

## Core Features

### 1. User Authentication & Authorization

#### Registration & Login
- **Email/Password Authentication**: Users can create accounts using email and password
- **Password Requirements**: 
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
- **Session Management**: JWT-based sessions using NextAuth.js v5
- **Role-Based Access Control**: Three user roles:
  - `BUYER` - Default role, can browse and contact sellers
  - `SELLER` - Can create listings and manage seller profile
  - `ADMIN` - Can approve/reject listings and manage reports

#### Security Features
- Password hashing with bcryptjs
- Rate limiting on authentication endpoints (5 signups per 15 minutes per IP)
- Session protection with secure cookies
- Middleware-based route protection

### 2. User Profiles

#### Buyer Profile
- Basic user information (name, email)
- Dashboard access to view favorites and messages
- Ability to upgrade to seller account

#### Seller Profile
- **Store Information**:
  - Store name
  - Description
  - Location (country and city)
  - Average rating (future feature)
- Users can create a seller profile after registration
- Automatic role upgrade to `SELLER` upon profile creation

### 3. Listing Management

#### Creating Listings
- **Required Fields**:
  - Title
  - Brand
  - Model
  - Condition (New, Like New, Excellent, Very Good, Good, Fair)
  - Price (in EUR cents)
- **Optional Fields**:
  - Reference number
  - Year of production
  - Box and papers status
  - Description
  - Location
- **Photo Upload**:
  - Upload up to 10 photos per listing
  - Cloudinary integration for image hosting
  - Signed upload URLs for secure client-side uploads
  - First photo becomes the main/featured image
- **Listing Statuses**:
  - `DRAFT` - Saved but not submitted
  - `PENDING` - Submitted for admin approval
  - `APPROVED` - Published and visible to buyers
  - `REJECTED` - Rejected by admin (with reason)
  - `ARCHIVED` - Hidden from public view

#### Editing Listings
- Sellers can edit their own listings
- Can only edit listings in `DRAFT` or `REJECTED` status
- Changes require re-submission for approval

#### Listing Workflow
1. Seller creates listing → Status: `DRAFT`
2. Seller submits for approval → Status: `PENDING`
3. Admin reviews and approves/rejects → Status: `APPROVED` or `REJECTED`
4. Approved listings are visible to all buyers
5. Seller receives email notification on approval/rejection

### 4. Browse & Search

#### Listing Discovery
- **Public Browse Page**: View all approved listings
- **Filtering Options**:
  - Search by brand, model, or reference
  - Filter by brand
  - Filter by condition
  - Price range (min/max)
  - Year of production
  - Location
- **Sorting Options**:
  - Newest first (default)
  - Price: Low to High
  - Price: High to Low
  - Oldest first
- **Pagination**: 20 listings per page

#### Listing Details
- Full listing information display
- Photo gallery (main image + thumbnails)
- Seller information card
- Contact seller form
- Report listing option
- Currency conversion display

### 5. Communication

#### Contact Seller
- Buyers can contact sellers about specific listings
- Contact form requires authentication
- Email relay system:
  - Buyer's message is sent to seller via email
  - Seller can reply directly to the email
  - Rate limiting: 10 messages per 15 minutes per IP
- Email notifications sent to sellers

### 6. Admin Panel

#### Listing Management
- **Approval Queue**: View all pending listings
- **Listing Actions**:
  - Approve listing (with email notification)
  - Reject listing (with optional reason and email notification)
  - View listing details
- **Status Filtering**: View listings by status (Pending, Approved, Rejected, Draft)

#### Report Management
- View all reported listings
- Close reports
- Track reporter and listing information
- Status filtering (Open, Closed)

#### Dashboard
- Statistics overview:
  - Pending listings count
  - Open reports count
- Recent activity feed
- Quick access to queues

### 7. Internationalization (i18n)

#### Supported Languages
- Serbian (default)
- English
- Croatian
- Bosnian

#### Translation System
- Server-side translation utilities
- Nested translation keys for organized structure
- Easy to extend with additional languages

### 8. Currency Conversion

#### Supported Currencies
- **EUR** (Euro) - Base currency
- **RSD** (Serbian Dinar)
- **BAM** (Bosnian Mark)
- **HRK** (Croatian Kuna)

#### Features
- Automatic currency conversion based on exchange rates
- User preference saved in localStorage
- Currency switcher in navbar
- All prices displayed in selected currency
- Proper locale-specific formatting

#### Exchange Rates
- Currently hardcoded (can be updated to fetch from API)
- Rates stored in currency utility
- Configurable per currency

### 9. Image Management

#### Cloudinary Integration
- **Signed Uploads**: Secure client-side image uploads
- **Optimized Delivery**: Automatic image optimization
- **Transformations**: Automatic format conversion (WebP when supported)
- **Folder Organization**: Images organized by type (listings, profiles)

#### Features
- Drag-and-drop upload interface
- Image preview before upload
- Progress tracking
- Multiple image upload support
- Image ordering (first image is featured)

### 10. Email Notifications

#### Resend Integration
- Transactional email service
- Email Types:
  - **Contact Seller**: Notifies seller when buyer contacts them
  - **Listing Status**: Notifies seller when listing is approved/rejected
  - **Welcome Email**: Sent to new users (future feature)

#### Email Features
- HTML email templates
- Reply-to functionality
- Professional formatting
- Error handling and logging

### 11. Security & Validation

#### Input Validation
- **Zod Schemas**: Type-safe validation
- **Common Validators**:
  - Email format validation
  - Password strength validation
  - Name validation (alphanumeric, special characters)
  - Phone number validation
  - URL validation
- **Sanitization**: Automatic input sanitization to prevent XSS

#### Rate Limiting
- **In-Memory Rate Limiter**: Prevents abuse
- **Endpoints Protected**:
  - Signup: 5 requests per 15 minutes per IP
  - Contact form: 10 requests per 15 minutes per IP
- **Response Headers**: Includes `Retry-After` header
- **Future**: Redis-based rate limiting for production

### 12. Logging & Monitoring

#### Logging System
- **Structured Logging**: Context-aware logging
- **Log Levels**: Info, Warn, Error, Debug
- **Features**:
  - Timestamp formatting
  - Context data logging
  - Development vs production handling
  - Error stack traces

#### Analytics Tracking
- **Event Tracking**: Custom event tracking system
- **Tracked Events**:
  - Page views
  - Listing views
  - Contact seller actions
  - Listing creation
  - User signup/signin
- **Ready for Integration**: Google Analytics, Mixpanel, etc.

### 13. Error Handling

#### Error Pages
- **404 Not Found**: Custom 404 page with navigation
- **Error Boundary**: General error page with retry functionality
- **Global Error Handler**: Catches critical application errors

#### Error Features
- User-friendly error messages
- Development error details (stack traces)
- Production error masking
- Retry functionality
- Navigation to safe pages

### 14. Database Schema

#### Core Models
- **User**: User accounts with authentication
- **SellerProfile**: Extended seller information
- **Listing**: Watch listings with details
- **ListingPhoto**: Listing images
- **MessageThread**: Conversation threads
- **Message**: Individual messages
- **Report**: Listing reports
- **Favorite**: User favorites (future feature)

#### Authentication Models (NextAuth)
- **Account**: OAuth account connections
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## Technical Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Database (via Supabase)
- **NextAuth.js v5**: Authentication
- **bcryptjs**: Password hashing

### Services
- **Cloudinary**: Image hosting and optimization
- **Resend**: Email delivery
- **Supabase**: PostgreSQL hosting

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Prisma Studio**: Database management UI

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `POST /api/listings` - Create new listing
- `GET /api/listings/[id]` - Get single listing
- `PATCH /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `POST /api/listings/[id]/submit` - Submit listing for approval
- `POST /api/listings/[id]/report` - Report a listing

### Seller
- `GET /api/seller/profile` - Get seller profile
- `POST /api/seller/profile` - Create seller profile
- `PATCH /api/seller/profile` - Update seller profile

### Admin
- `POST /api/admin/listings/[id]/approve` - Approve listing
- `POST /api/admin/listings/[id]/reject` - Reject listing
- `PATCH /api/admin/reports/[id]` - Update report status

### Contact
- `POST /api/contact` - Send contact message to seller

### Upload
- `POST /api/upload/signature` - Get Cloudinary signed upload parameters

## Pages & Routes

### Public Pages
- `/` - Homepage
- `/listings` - Browse all listings
- `/listing/[id]` - Listing detail page
- `/sell` - Information page for sellers

### Authentication
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

### Dashboard (Protected)
- `/dashboard` - User dashboard
- `/dashboard/listings` - Manage listings
- `/dashboard/listings/new` - Create new listing
- `/dashboard/listings/[id]/edit` - Edit listing
- `/dashboard/seller/profile` - Seller profile management

### Admin (Protected)
- `/admin` - Admin dashboard
- `/admin/listings` - Listing approval queue
- `/admin/reports` - Report management

## User Workflows

### Buyer Workflow
1. Browse listings on homepage or listings page
2. Apply filters to find specific watches
3. View listing details
4. Sign up/Log in if needed
5. Contact seller via contact form
6. Receive email response from seller

### Seller Workflow
1. Sign up for account
2. Create seller profile
3. Create listing (add photos, details, price)
4. Save as draft or submit for approval
5. Wait for admin approval
6. Receive email notification when approved/rejected
7. Manage listings from dashboard
8. Respond to buyer inquiries via email

### Admin Workflow
1. Access admin panel
2. View pending listings queue
3. Review listing details
4. Approve or reject listing (with reason)
5. Manage reported listings
6. View statistics and recent activity

## Future Enhancements

### Planned Features
- **Favorites/Wishlist**: Save favorite listings
- **Message Threads**: In-app messaging system
- **User Reviews**: Rating and review system
- **Advanced Search**: Full-text search with filters
- **Payment Integration**: Online payment processing
- **Shipping Integration**: Shipping label generation
- **Analytics Dashboard**: Seller analytics and insights
- **Mobile App**: React Native mobile application

### Improvements
- Redis-based rate limiting for production
- Real-time currency exchange rates API
- Enhanced email templates
- Advanced logging and monitoring (Sentry, Datadog)
- CDN integration for static assets
- Performance optimizations
- SEO improvements
- Accessibility enhancements

## Environment Variables

Required environment variables (see `docs/ENVIRONMENT.md` for details):

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
RESEND_API_KEY=
```

## Development Setup

See `SETUP.md` for detailed setup instructions.

### Quick Start
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard pages
│   ├── admin/             # Admin panel pages
│   └── listing/           # Listing pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── listings/         # Listing-related components
│   ├── auth/             # Authentication components
│   └── admin/            # Admin components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Authentication utilities
│   ├── logger.ts         # Logging utilities
│   ├── rate-limit.ts     # Rate limiting
│   ├── validation.ts     # Validation schemas
│   ├── currency.ts       # Currency conversion
│   └── i18n.ts           # Internationalization
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Security Considerations

### Implemented
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS prevention (input sanitization)
- CSRF protection (NextAuth)
- Secure session management

### Recommendations for Production
- Use HTTPS only
- Implement Content Security Policy (CSP)
- Add request ID tracking
- Set up security headers
- Regular security audits
- Database backup strategy
- Monitoring and alerting

## Performance Optimizations

### Implemented
- Image optimization with Cloudinary
- Database indexing on frequently queried fields
- Pagination for listings
- Lazy loading of components
- Static page generation where possible

### Future Optimizations
- Redis caching layer
- CDN for static assets
- Database query optimization
- Image lazy loading
- Code splitting
- Service worker for offline support

## Support & Documentation

- **Setup Guide**: `SETUP.md`
- **Environment Variables**: `docs/ENVIRONMENT.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Supabase Setup**: `SUPABASE_SETUP.md`

## License

[Add your license information here]

---

**Last Updated**: 2024
**Version**: 1.0.0 (MVP)

