# Contributing to LeadsFlow

Thank you for considering contributing to LeadsFlow! We welcome contributions from the community and are grateful for any help you can provide.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- A Supabase account for testing
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/leadsflow.git
   cd leadsflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up your development database**
   - Create a new Supabase project
   - Run the SQL migration from `supabase-migration.sql`
   - Create a test admin user

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠 Development Guidelines

### Code Style

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code will be automatically formatted
- **Naming**: Use descriptive names for variables, functions, and components

### Component Guidelines

- Use functional components with hooks
- Follow the existing component structure in `src/components/`
- Use shadcn/ui components when possible
- Ensure components are responsive and accessible

### Database Guidelines

- All database operations should go through Supabase
- Use proper TypeScript types from `database.types.ts`
- Follow Row Level Security (RLS) best practices
- Test database changes thoroughly

## 📝 Contribution Process

### 1. Create an Issue

Before starting work, please create an issue describing:
- What you want to add/fix
- Why it's needed
- How you plan to implement it

### 2. Branch Naming

Use descriptive branch names:
- `feature/add-export-functionality`
- `fix/csv-import-validation`
- `docs/update-readme`

### 3. Commit Messages

Follow conventional commits:
```
feat: add lead export functionality
fix: resolve CSV parsing issue with special characters
docs: update API documentation
refactor: improve database query performance
```

### 4. Pull Request Process

1. **Create a pull request** with a clear title and description
2. **Link the related issue** using "Closes #123"
3. **Add screenshots** for UI changes
4. **Update documentation** if needed
5. **Ensure all checks pass**:
   - TypeScript compilation
   - ESLint checks
   - Build succeeds

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Tested with different user roles

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🧪 Testing

### Manual Testing

- Test with both Admin and Caller roles
- Test CSV import with various file formats
- Test on different screen sizes
- Verify database operations work correctly

### Areas to Test

1. **Authentication**
   - Login/logout flow
   - Role-based access control
   - Session management

2. **Lead Management**
   - CSV import functionality
   - Lead filtering and search
   - Assignment system
   - Custom fields

3. **User Management**
   - User creation and editing
   - Role changes
   - Status updates

## 🎯 Priority Areas for Contributions

### High Priority
- **Performance optimizations**
- **Bug fixes**
- **Security improvements**
- **Accessibility enhancements**

### Medium Priority
- **New features** (discussed in issues)
- **UI/UX improvements**
- **Documentation improvements**
- **Test coverage**

### Ideas for Contributions

- **Export functionality** (CSV, Excel)
- **Advanced filtering options**
- **Email notifications**
- **Dashboard analytics**
- **Bulk operations**
- **Mobile app** (React Native)
- **API documentation**
- **Automated testing**

## 📚 Resources

### Project Structure
```
src/
├── actions/          # Server actions (Supabase operations)
├── app/             # Next.js app router pages
├── components/      # React components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
└── styles/          # Global styles
```

### Key Technologies
- **Next.js 15**: App Router, Server Actions
- **Supabase**: Database, Authentication, Real-time
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **TanStack Table**: Data tables
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run typecheck    # Check TypeScript
npm run lint         # Run ESLint

# Database
# Run in Supabase SQL Editor
SELECT * FROM users;
SELECT * FROM leads;
```

## 🚫 What Not to Do

- Don't commit sensitive information (API keys, passwords)
- Don't break existing functionality without discussion
- Don't ignore TypeScript errors
- Don't skip testing your changes
- Don't commit directly to main branch

## 💬 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check README.md and inline comments

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given credit in commit messages

Thank you for contributing to LeadsFlow! 🙏