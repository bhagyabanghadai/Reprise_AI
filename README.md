# Reprise: AI-Powered Fitness Platform

Reprise is an advanced AI-powered fitness platform that delivers hyper-personalized workout experiences through intelligent goal tracking, adaptive planning, and real-time progress analysis.

![Reprise - AI Fitness Coach](generated-icon.png)

## 🌟 Features

### 💬 Conversational AI Trainer
- Natural language interactions with an AI fitness coach
- One-question-at-a-time approach for personalized fitness profiles
- Persistent chat history that remembers your preferences
- Ask questions about exercises, nutrition, and recovery

### 🏋️ Intelligent Workout Planning
- AI-generated workout plans tailored to your goals, experience level, and available equipment
- Progressive overload strategies for optimal strength and muscle gains
- Adaptive planning based on your feedback and progress

### 📊 Progress Tracking & Analysis
- Comprehensive dashboard with visual progress metrics
- Strength and volume tracking over time
- Performance insights and goal achievement monitoring
- Photo progress tracking capabilities

### 🍎 Nutrition Guidance
- Personalized nutrition recommendations
- Macro and calorie calculations based on your goals
- Meal planning suggestions and nutrition education

### 🧠 Smart Recovery Monitoring
- Intelligent recovery recommendations
- Sleep quality integration
- Injury prevention strategies

### 🏆 Gamification & Motivation
- Achievement system to celebrate milestones
- Consistency tracking with streak counters
- Community challenges and support

## 💻 Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Nvidia Llama-3.1-Nemotron-70b model
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom theming

## 🚀 Getting Started

### Prerequisites
1. Node.js (v18 or newer)
2. PostgreSQL database
3. Git (optional, for cloning)
4. Llama API key for AI functionality

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd reprise
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/reprise_db
   LLAMA_API_KEY=your_llama_api_key
   NEXTAUTH_SECRET=generate_a_random_string_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Create the PostgreSQL database
   createdb reprise_db
   
   # Apply the database schema
   npx drizzle-kit push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start the Production Server**
   ```bash
   npm start
   ```

## 🧩 Project Structure

```
reprise/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API routes for backend functionality
│   │   ├── dashboard/        # User dashboard 
│   │   ├── workouts/         # Workout pages
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── ui/               # UI component library
│   │   └── ...               # Feature components
│   ├── lib/                  # Utility functions and services
│   │   ├── ai/               # AI service integration
│   │   ├── db/               # Database schema and client
│   │   └── ...               # Other utilities
│   └── styles/               # Global styles
├── public/                   # Static assets
└── ...                       # Configuration files
```

## 🔧 API Endpoints

- `/api/ai-chat`: AI conversation endpoint
- `/api/workout-plan`: Generate and retrieve workout plans
- `/api/exercises`: Exercise database access
- `/api/workouts`: Log and retrieve workout data
- `/api/user/profile`: User profile management
- `/api/nutrition`: Nutrition recommendations
- `/api/chat/messages`: Chat history management

## 🧪 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check your DATABASE_URL environment variable
- Ensure database user has proper permissions

### AI Integration Issues
- Confirm your LLAMA_API_KEY is valid
- Check network connectivity to the API service
- Verify request/response formats

### Application Performance
- For slow initial loads, consider preloading data
- Check browser console for errors
- Monitor server logs for backend issues

## 📝 Contributing

We welcome contributions to Reprise! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ by the Reprise Team
