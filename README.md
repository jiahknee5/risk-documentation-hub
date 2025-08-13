# Risk Documentation Hub

A secure, searchable library for risk-related documents with AI-powered features built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Features
- **Document Management**: Upload, store, and organize risk documents with categorization
- **Advanced Search**: Full-text search with filters by category, risk level, compliance status, and more
- **AI-Powered Insights**: Automatic document summarization, key points extraction, and risk assessment
- **Role-Based Access Control**: Admin, Manager, User, and Viewer roles with appropriate permissions
- **Audit Trail**: Complete activity logging for compliance and security
- **Version Control**: Track document versions and changes over time
- **Compliance Tracking**: Monitor compliance status across different frameworks (SOX, GDPR, ISO 27001, etc.)

### Security Features
- **Secure Authentication**: NextAuth.js with credential-based authentication
- **File Upload Security**: File type validation and size limits
- **Encrypted Data**: Secure password hashing with bcrypt
- **Activity Monitoring**: Comprehensive audit logging of all user actions

### AI Features
- **Document Summarization**: Automatic summary generation using OpenAI
- **Key Points Extraction**: AI-powered identification of critical information
- **Risk Assessment**: Automated risk level evaluation
- **Compliance Insights**: AI-generated compliance recommendations
- **Change Detection**: Automatic identification of document changes between versions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API
- **File Processing**: PDF parsing, text extraction
- **UI Components**: Lucide React icons, custom components

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd risk-documentation-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="your-openai-api-key" # Optional
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

The seed script creates demo users for testing:

- **Admin**: admin@example.com / password123
- **Manager**: manager@example.com / password123  
- **User**: user@example.com / password123

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── documents/     # Document CRUD operations
│   │   ├── search/        # Search functionality
│   │   ├── upload/        # File upload handling
│   │   ├── users/         # User management
│   │   └── audit/         # Audit log endpoints
│   ├── auth/              # Authentication pages
│   ├── documents/         # Document pages
│   ├── search/            # Search interface
│   └── admin/             # Admin panel
├── components/            # Reusable React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── DocumentCard.tsx   # Document display component
│   ├── SearchBar.tsx      # Search interface
│   ├── Navbar.tsx         # Navigation component
│   └── StatsCard.tsx      # Statistics display
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── ai.ts             # AI integration
│   ├── utils.ts          # General utilities
│   └── seed.ts           # Database seeding
├── types/                 # TypeScript type definitions
└── generated/             # Generated Prisma client
```

## API Endpoints

### Documents
- `GET /api/documents` - List documents with filtering
- `POST /api/documents` - Create new document
- `GET /api/documents/[id]` - Get single document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

### Search
- `GET /api/search` - Simple search
- `POST /api/search` - Advanced search with filters

### Upload
- `POST /api/upload` - Upload and process files

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user

### Audit
- `GET /api/audit` - Get audit logs
- `POST /api/audit` - Export audit report

## Database Schema

The application uses a comprehensive schema including:

- **Users**: User accounts with roles and departments
- **Documents**: Document metadata and content
- **DocumentVersions**: Version control for documents
- **DocumentAccess**: Access control permissions
- **AuditLogs**: Complete activity tracking
- **Approvals**: Document approval workflow
- **Comments**: Document collaboration
- **ComplianceChecks**: Compliance monitoring

## Configuration

### File Upload
- Maximum file size: 10MB (configurable via `MAX_FILE_SIZE`)
- Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX
- Upload directory: `./uploads` (configurable via `UPLOAD_PATH`)

### AI Features
- Requires OpenAI API key for document analysis
- Automatic fallback to manual review if AI is unavailable
- Configurable AI model and parameters

### Security
- Password hashing with bcrypt (configurable rounds)
- JWT secret for session management
- Rate limiting and input validation

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure environment variables** in the Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `OPENAI_API_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Custom Domain
Configure your custom domain (e.g., johnnychung.com/ragdocumenthub) in the Vercel dashboard.

### Production Database
For production, replace SQLite with PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/risk_docs"
```

## Development

### Database Commands
```bash
# Reset database and reseed
npm run db:reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Considerations

- All file uploads are validated and sanitized
- User authentication is required for all operations
- Complete audit trail for compliance
- Role-based access control
- Secure password storage
- Input validation and sanitization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please contact the development team or create an issue in the repository.