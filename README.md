# <div align="center">🚀 JOBLANCE 🚀</div>
### <div align="center">*AI-Powered Job Analysis Platform*</div>

<!-- [Demo Video Coming Soon](https://github.com/your-username/joblance) -->

## 💡 About The Project

**JOBLANCE** is a revolutionary AI-powered job analysis platform that transforms the job searching experience. With advanced resume analysis, intelligent skill gap detection, and seamless Chrome extension integration, JOBLANCE provides instant job posting analysis across all major job boards. The platform leverages Google Gemini AI to deliver personalized career recommendations, application priority scoring, and comprehensive career growth insights.

> "Revolutionize your job search with AI-powered career intelligence and instant job analysis."



## ✨ Key Features

<table>
  <tr>
    <td>
      <h3>🤖 AI-Powered Analysis</h3>
      <ul>
        <li>📄 Advanced resume skill extraction</li>
        <li>🎯 Intelligent job matching algorithms</li>
        <li>📊 Comprehensive career profiling</li>
        <li>🧠 Google Gemini AI integration</li>
        <li>📈 Personalized recommendations</li>
      </ul>
    </td>
    <td>
      <h3>🔍 Universal Job Analysis</h3>
      <ul>
        <li>🌐 Works on LinkedIn, Indeed, any job board</li>
        <li>⚡ Instant skill gap analysis</li>
        <li>🎨 Chrome extension integration</li>
        <li>📋 Real-time job requirement parsing</li>
        <li>🏆 Application priority scoring</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📊 Career Intelligence</h3>
      <ul>
        <li>📈 Skill gap analysis</li>
        <li>💰 Market insights and salary analysis</li>
        <li>🎯 Career growth recommendations</li>
        <li>📉 Resume to job role recommendations</li>
        <li>📋 Detailed progress reports</li>
      </ul>
    </td>
    <td>
      <h3>🛡️ Enterprise Features</h3>
      <ul>
        <li>🔐 JWT authentication system</li>
        <li>🔒 Encrypted API key storage</li>
        <li>📱 Cross-platform compatibility</li>
        <li>⚡ Modern responsive dashboard</li>
        <li>📊 Interactive data visualizations</li>
      </ul>
    </td>
  </tr>
</table>

## 🛠️ Technologies Used

<div align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
</div>


### Installation

```bash
# 1. Clone the repository
git clone https://github.com/debjitmitra000/joblance.git

# 2. Navigate to the project directory
cd joblance

# 3. Install dependencies
npm install

# 4. Database setup
npm run db:push

# 5. Environment configuration
cp .env.example .env
# Edit .env with your configuration (see below)

# 6. Start development server
npm run dev

# Visit http://localhost:5000
```

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=pg-connection-url-from-neon

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=32-bit-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Development URLs
FRONTEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### Chrome Extension Setup

1. Open Chrome → Extensions → Enable Developer Mode
2. Click "Load Unpacked" → Select `./extension` folder
3. Extension will appear in your Chrome toolbar
4. Pin the extension for easy access

## 🔍 How It Works

### 1. **Resume Analysis & Profile Setup**
   - Upload your resume (DOCX supported)
   - AI extracts and categorizes skills automatically
   - Comprehensive career profile generation
   - Skill inventory and experience mapping

### 2. **Universal Job Analysis**
   - Navigate to any job posting on any website
   - Click the JOBLANCE extension icon
   - Get instant skill match analysis
   - Receive personalized recommendations

### 3. **Career Intelligence Dashboard**
   - Track skill development over time
   - Monitor application success rates
   - Receive market insights and salary data
   - Export detailed career reports

### 4. **AI-Powered Recommendations**
   - Application priority scoring
   - Skill gap identification and learning paths
   - Career progression insights
   - Industry trend analysis

## 📁 Project Structure

```
joblance/
├── 📁 client/                    # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📁 Analysis/      # Job analysis components
│   │   │   ├── 📁 API/           # API integration components
│   │   │   ├── 📁 Auth/          # Authentication components
│   │   │   ├── 📁 Extension/     # Extension-related components
│   │   │   ├── 📁 Resume/        # Resume management components
│   │   │   ├── 📁 ResumeUpload/  # File upload components
│   │   │   └── 📁 ui/            # Base UI components (shadcn)
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 lib/               # Utilities and configurations
│   │   ├── 📁 pages/             # Route components
│   │   └── 📁 utils/             # Helper functions
├── 📁 server/                    # Express.js backend
│   ├── 📁 middleware/            # Custom middleware
│   ├── 📁 utils/                 # Backend utilities
│   ├── 📄 db.ts                  # Database connection
│   ├── 📄 routes.ts              # API route definitions
│   └── 📄 storage.ts             # Data access layer
├── 📁 extension/                 # Chrome extension
│   ├── 📄 manifest.json          # Extension configuration
│   ├── 📄 background.js          # Service worker
│   ├── 📄 content.js             # Content script injection
│   └── 📄 popup.html             # Extension popup UI
└── 📁 shared/                    # Shared types and schemas
```
## 🛠️ Development

### Available Scripts for DB setup
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:push      # Push database schema
npm run db:generate  # Generate migrations
```

## 🌟 Benefits

- **AI-Powered Intelligence**: Advanced skill extraction and job matching using Google Gemini AI
- **Universal Compatibility**: Works seamlessly across LinkedIn, Indeed, and any job board
- **Real-time Analysis**: Instant feedback without leaving the job posting page
- **Comprehensive Insights**: Detailed skill gap analysis and career recommendations
- **Enterprise Security**: JWT authentication, encrypted storage, and secure data handling
- **Modern Architecture**: Full-stack TypeScript with type-safe development
- **Scalable Infrastructure**: PostgreSQL with Drizzle ORM for efficient data management

---

<div align="center">
  <br>
  <p>🚀 Transform your job search with AI-powered Job Analysis</p>
  
  <a href="https://github.com/debjitmitra000/joblance/stargazers">
    <img src="https://img.shields.io/badge/⭐_Star_This_Repo-171515?style=for-the-badge&logo=github&logoColor=white" alt="Star on GitHub"/>
  </a>
  
  <br><br>
  <sub>Built with ❤️ and cutting-edge AI technology</sub>
</div>

