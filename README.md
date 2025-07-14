
# LeadsFlow - Lead Management System

> **🎉 Now powered by Supabase!** - Migrated from Firebase for better performance, SQL capabilities, and developer experience.

A modern, full-featured lead management system built with Next.js and Supabase. Designed for educational institutes, sales teams, and businesses that need to efficiently manage and track leads through their entire lifecycle.

![LeadsFlow Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## ✨ Core Features

### 🔐 **Authentication & User Management**
- **Secure Authentication**: Powered by Supabase Auth with JWT tokens
- **Role-Based Access**: Admin and Caller roles with specific permissions
- **User Management**: Complete CRUD operations for user accounts
- **Session Management**: Persistent sessions with automatic token refresh

### 📊 **Lead Management**
- **CSV Import**: Bulk import leads from CSV files with smart field mapping
- **Custom Fields**: Dynamic custom fields stored in JSONB format
- **Campaign Tracking**: Assign and track multiple campaigns per lead
- **Advanced Filtering**: Filter by campaigns, schools, locations, gender, and more
- **Assignment System**: Assign leads to specific callers efficiently

### 📋 **Data Tables & Search**
- **Powerful Tables**: Built with TanStack Table for advanced functionality
- **Real-time Search**: Instant search across all lead data
- **Faceted Filters**: Multi-select filters with counts
- **Bulk Operations**: Select and operate on multiple leads at once
- **Pagination**: Efficient pagination for large datasets

### 📞 **Call Management**
- **Assignment History**: Complete timeline of lead assignments
- **Disposition Tracking**: Track call outcomes and sub-dispositions
- **Follow-up Scheduling**: Schedule callbacks and follow-ups
- **Caller Dashboard**: Dedicated interface for callers to manage their leads
- **Activity Logging**: Comprehensive activity tracking

### 💻 **Technical Excellence**
- **PostgreSQL Database**: Powerful SQL database with full ACID compliance
- **TypeScript**: 100% TypeScript for type safety
- **Server Actions**: Secure server-side operations
- **Row Level Security**: Database-level security policies
- **Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Supabase account ([supabase.com](https://supabase.com))

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd leadsflow
npm install
```

### 2. Set Up Supabase Project

1. **Create New Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create the project
   - Wait for the project to be ready (2-3 minutes)

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your Project URL and API keys

3. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-migration.sql`
   - Paste and run the SQL to create all tables and policies

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Create Your First Admin User

1. **In Supabase Dashboard**:
   - Go to Authentication → Users
   - Click "Add User"
   - Enter email: `admin@yourcompany.com`
   - Set a secure password
   - Check "Auto Confirm User"

2. **Update Users Table**:
   - Copy the User ID from the created user
   - Go to Table Editor → users table
   - Find the record with your email
   - Update the `role` to `admin` and `status` to `active`

### 5. Start the Application

```bash
npm run dev
```

Navigate to `http://localhost:9002` and log in with your admin credentials!

## 📋 Database Schema

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User accounts and authentication | Role-based access, status management |
| `leads` | Lead contact information | Custom fields (JSONB), campaign arrays |
| `assignments` | Lead assignment tracking | Disposition tracking, timeline |
| `login_activity` | User login/logout logs | Security monitoring |

### Key Features

- **UUID Primary Keys**: Better performance and security
- **JSONB Custom Fields**: Flexible, searchable JSON storage
- **Array Support**: Native PostgreSQL arrays for campaigns
- **Foreign Key Constraints**: Data integrity and relationships
- **Indexes**: Optimized for common query patterns
- **Row Level Security**: Database-level access control

## 📁 Project Structure

```
src/
├── actions/          # Server actions (Supabase operations)
├── app/             # Next.js app router pages
├── components/      # React components
│   ├── ui/         # Reusable UI components
│   ├── leads/      # Lead management components
│   ├── users/      # User management components
│   └── layout/     # Layout components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configurations
│   ├── supabase.ts     # Server-side Supabase client
│   ├── client-supabase.ts # Client-side Supabase client
│   ├── database.types.ts  # Generated TypeScript types
│   └── types.ts        # Application types
└── styles/         # Global styles
```

## 🔄 CSV Import Guide

### Step-by-Step Import Process

1. **Prepare Your CSV**
   - Required fields: `name`, `phone`
   - Optional fields: `gender`, `school`, `locality`, `district`
   - Custom fields: Any additional columns

2. **Access Import Feature**
   - Log in as Admin
   - Navigate to Leads page
   - Click "Import" button in toolbar

3. **Upload and Map Fields**
   - Drag & drop or select your CSV file
   - Map CSV columns to lead fields
   - Assign a campaign (optional)
   - Review mapping and click "Import"

### Sample CSV Format

```csv
name,phone,gender,school,locality,district,emergency_contact,age
John Doe,+1234567890,Male,Example High School,Downtown,Metro District,+1234567899,25
Jane Smith,+1234567891,Female,Sample College,Uptown,North District,+1234567898,22
Bob Johnson,+1234567892,Male,Test University,Midtown,Central District,+1234567897,24
```

### Custom Fields Support

The system automatically handles custom fields:
- **Universal Custom Fields**: Available for all leads
- **Campaign-Specific Fields**: Only for leads in specific campaigns
- **Dynamic Mapping**: Map any CSV column to any custom field
- **Type Preservation**: Values stored with metadata (updatedBy, updatedAt)

## 🔐 Security & Permissions

### Role-Based Access Control

| Feature | Admin | Caller |
|---------|-------|--------|
| Import Leads | ✅ | ❌ |
| Assign Leads | ✅ | ❌ |
| Manage Users | ✅ | ❌ |
| View All Leads | ✅ | ✅ |
| Update Lead Status | ✅ | ✅ |
| View Assigned Leads | ✅ | ✅ |

### Database Security

- **Row Level Security**: Enabled on all tables
- **JWT Verification**: All server actions verify user tokens
- **Role Enforcement**: Database policies enforce role-based access
- **Audit Trail**: All operations logged with user information

## 🛠 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Quality Assurance
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side operations | ✅ |

### Key Technologies

- **[Next.js 15](https://nextjs.org/)**: React framework with App Router
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service with PostgreSQL
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)**: High-quality React components
- **[TanStack Table](https://tanstack.com/table)**: Powerful data tables
- **[React Hook Form](https://react-hook-form.com/)**: Performant forms
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation

## 🚀 Deployment

### Supabase Deployment

The application is optimized for deployment on any platform that supports Next.js:

- **Vercel** (Recommended): Zero-config deployment
- **Netlify**: Full support for server actions
- **Railway**: Simple PostgreSQL hosting
- **Self-hosted**: Docker support available

### Production Checklist

- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Run database migration
- [ ] Set up admin user
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and backups

## 📈 Performance & Scalability

### Database Optimizations

- **Indexes**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Supabase handles connection pooling automatically
- **Query Optimization**: Efficient SQL queries with proper JOINs
- **JSONB Performance**: Optimized for custom field queries

### Frontend Optimizations

- **Server Components**: Leverage React Server Components for better performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js image optimization
- **Caching**: Strategic caching for static data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🎉 Migration from Firebase

This application was successfully migrated from Firebase to Supabase, bringing several benefits:

### Benefits of the Migration

- **Better Performance**: PostgreSQL is faster for complex queries
- **SQL Power**: Full SQL support with JOINs, transactions, and aggregations
- **Cost Efficiency**: More predictable pricing model
- **Type Safety**: Auto-generated TypeScript types
- **Better Developer Experience**: Superior tooling and debugging
- **Open Source**: No vendor lock-in

### Migration Highlights

- ✅ Zero data loss during migration
- ✅ All features preserved and improved
- ✅ Better type safety and error handling
- ✅ Improved performance and scalability
- ✅ More robust authentication system

---

**Built with ❤️ for efficient lead management**
