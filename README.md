# Academic Portfolio Website - Ngozi Blessing Umoru (PhD)

A comprehensive Next.js 15 academic portfolio website featuring blog, resources, and contact management with full SEO optimization for UK academic searches.

## 🎯 Features

### Public Features
- **Homepage**: Professional academic portfolio with hero, about, experience, education, publications sections
- **Blog**: Article listing, individual post views, comments system, related posts
- **Resources**: Teaching materials, worksheets, curriculum guides with category filtering
- **Contact**: Professional contact form with purpose selection

### Admin Dashboard
- **Blog Management**: Create, edit, publish, schedule blog posts with rich text editor
- **Resource Management**: Upload and manage teaching resources with Cloudinary integration
- **Comments Moderation**: Approve, reject, or delete blog comments
- **Contact Management**: View and respond to contact form submissions
- **Analytics Dashboard**: Overview of blog posts, resources, comments, and contacts

### SEO Features ⭐
- **Technical SEO**: robots.txt, dynamic sitemap.xml, canonical URLs
- **Metadata Optimization**: Comprehensive meta tags for all public pages
- **Structured Data**: JSON-LD schemas (Person, Article, WebSite, BreadcrumbList)
- **Google Analytics**: GA4 and GTM integration
- **UK Optimization**: Targeted for "UK Academic portfolio" searches
- **Performance**: Next.js Image optimization, fast loading
- **Localization**: en-GB locale, British English

## 🚀 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form
- **Analytics**: Google Analytics 4, Google Tag Manager
- **Email**: Resend API
- **Date**: date-fns
- **Rich Text**: TipTap or similar

## 📦 Installation

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB database
- Cloudinary account
- Resend account (for emails)
- Google Analytics account (optional, for tracking)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd academic-portfolio-website
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. **Run development server**
```bash
pnpm dev
```

5. **Access the application**
- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

## 🔐 Admin Access

Default admin credentials should be created through the admin registration page:
- Navigate to `/auth/admin-register`
- Create admin account with credentials
- Login at `/auth/login`

## 📁 Project Structure

```
academic-portfolio-website/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Admin dashboard routes
│   │   └── admin/               # Admin pages
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── blog/                # Blog API endpoints
│   │   ├── contact/             # Contact API endpoints
│   │   ├── resources/           # Resources API endpoints
│   │   └── upload/              # File upload endpoints
│   ├── auth/                    # Authentication pages
│   ├── blog/                    # Blog pages
│   │   ├── page.tsx             # Blog listing
│   │   └── [slug]/              # Individual blog posts
│   ├── contact/                 # Contact page
│   ├── resources/               # Resources page
│   ├── layout.tsx               # Root layout with SEO
│   ├── page.tsx                 # Homepage
│   ├── sitemap.ts              # Dynamic sitemap
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   ├── blog/                   # Blog components
│   ├── dashboard/              # Dashboard components
│   ├── home/                   # Homepage sections
│   ├── ui/                     # shadcn/ui components
│   ├── analytics.tsx           # GA4/GTM components
│   ├── navigation.tsx          # Main navigation
│   ├── footer.tsx              # Footer
│   └── structured-data.tsx     # JSON-LD schemas
├── lib/                        # Utility functions
│   ├── auth.ts                 # Authentication logic
│   ├── blog.ts                 # Blog operations
│   ├── mongodb.ts              # Database connection
│   ├── email.ts                # Email service
│   └── utils.ts                # Helper functions
├── public/                     # Static assets
│   └── robots.txt             # Search engine directives
├── .env.example               # Environment variables template
├── SEO_GUIDE.md              # Comprehensive SEO documentation
├── SEO_IMPLEMENTATION_SUMMARY.md  # Quick SEO reference
├── DEPLOYMENT_CHECKLIST.md   # Deployment guide
└── package.json              # Dependencies
```

## 🎨 Key Features Details

### Blog System
- Rich text editor for content creation
- Markdown support
- Image uploads with Cloudinary
- Tags and categories
- Comment system with moderation
- View counter
- Related posts recommendations
- SEO-optimized meta tags per post
- Article structured data (JSON-LD)

### Resources Management
- Multiple file type support (PDF, DOC, PPT, images, videos)
- Category-based organization
- Search and filter functionality
- Dynamic View/Download buttons
- File type detection and icons
- Size formatting
- Date tracking
- Cloudinary integration

### Contact System
- Purpose-based categorization
- Email notifications (Resend)
- Admin response functionality
- Status tracking (New, In Progress, Resolved)
- Contact history

### Admin Dashboard
- Overview statistics
- Content management (CRUD operations)
- Comment moderation
- Contact management
- User-friendly interface
- Role-based access control

## 🔍 SEO Optimization

### Implemented Features
- ✅ **robots.txt**: Configured for search engines
- ✅ **Sitemap**: Dynamic XML sitemap with blog posts
- ✅ **Metadata**: Comprehensive meta tags on all pages
- ✅ **Structured Data**: Person, Article, WebSite, BreadcrumbList schemas
- ✅ **Google Analytics**: GA4 integration
- ✅ **OpenGraph**: Facebook/LinkedIn sharing optimization
- ✅ **Twitter Cards**: Twitter sharing optimization
- ✅ **Canonical URLs**: Prevent duplicate content
- ✅ **Alt Text**: All images have descriptive alt attributes
- ✅ **Mobile-First**: Responsive design
- ✅ **Performance**: Fast loading with Next.js optimization

### Target Keywords
- UK Academic portfolio
- Academic English Tutor UK
- EAP Tutor United Kingdom
- English for Academic Purposes Lecturer
- ESL Teacher UK Higher Education
- [See SEO_GUIDE.md for full list]

### Post-Deployment SEO Tasks
See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for:
- Google Search Console setup
- Sitemap submission
- Analytics verification
- Structured data testing
- Performance optimization

## 📚 Documentation

- **[SEO_GUIDE.md](SEO_GUIDE.md)**: Comprehensive SEO documentation (300+ lines)
- **[SEO_IMPLEMENTATION_SUMMARY.md](SEO_IMPLEMENTATION_SUMMARY.md)**: Quick reference and summary
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**: Step-by-step deployment guide

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
# Configure MONGODB_URI in .env.local
# Collections will be created automatically
```

### Adding New Blog Posts
1. Login to admin dashboard
2. Navigate to "Blog Posts"
3. Click "Create New Post"
4. Fill in title, content, excerpt, tags
5. Upload thumbnail image
6. Set status (Draft/Published/Scheduled)
7. Save

### Adding Teaching Resources
1. Login to admin dashboard
2. Navigate to "Resources"
3. Click "Add New Resource"
4. Upload file (any type supported)
5. Fill in title, description, category
6. Save

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Configure build command: `pnpm build`
- Output directory: `.next`
- Install command: `pnpm install`
- Node.js version: 18+

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed deployment steps.

## 📊 Analytics Setup

### Google Analytics 4
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
4. Redeploy application
5. Verify tracking in Real-Time reports

### Google Tag Manager (Optional)
1. Create GTM container at [tagmanager.google.com](https://tagmanager.google.com)
2. Get Container ID (GTM-XXXXXXX)
3. Add to environment: `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`
4. Configure tags in GTM interface

## 🔒 Security

- Authentication with secure password hashing
- Environment variables for sensitive data
- API route protection
- Input validation
- XSS protection
- CSRF protection
- Rate limiting (recommended for production)

## 🎯 Performance

- Next.js 15 App Router for optimal performance
- Image optimization with next/image
- Font optimization with next/font
- Code splitting and lazy loading
- Static site generation where possible
- Dynamic imports for heavy components

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Mobile-optimized navigation
- Fast mobile loading
- PWA-ready structure

## 🧪 Testing

### Manual Testing
- Homepage loads correctly
- Blog listing and detail pages
- Resources page with filtering
- Contact form submission
- Admin dashboard functionality

### SEO Testing
- robots.txt accessible at `/robots.txt`
- Sitemap at `/sitemap.xml`
- Google Rich Results Test
- Facebook Sharing Debugger
- PageSpeed Insights

## 🤝 Contributing

This is a private academic portfolio project. For issues or suggestions, contact the site administrator.

## 📄 License

Private and proprietary. All rights reserved.

## 👤 Author

**Ngozi Blessing Umoru (PhD)**
- Website: [ngoziumoru.info](https://ngoziumoru.info)
- Email: [Contact via website](https://ngoziumoru.info/contact)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for the component library
- Vercel for hosting platform
- MongoDB for database
- Cloudinary for file storage

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready with Full SEO
