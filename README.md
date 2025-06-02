# StrongHabit - Exercise Tracking App 💪

StrongHabit is a modern, Progressive Web Application (PWA) designed to help you build and maintain exercise habits. Track your daily exercises, celebrate achievements, and stay motivated on your fitness journey.

## Features ✨

- **Exercise Tracking**: Add and manage your daily exercise routines
- **Progress Monitoring**: Track reps and completion status for each exercise
- **Achievement Celebrations**: Get motivated with Rocky Balboa-style celebrations
- **Cloud Sync**: Data syncs across all your devices with Supabase
- **User Authentication**: Secure user accounts with Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Support**: Install as a native app on your device
- **Offline Support**: Works without an internet connection
- **Data Backup**: Your data is safely stored in the cloud
- **Real-time Updates**: Changes sync instantly across devices

## Tech Stack 🛠️

- Next.js 15 (App Router)
- React 19
- Supabase (Database & Authentication)
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Getting Started 🚀

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/strong-habit-app.git
cd strong-habit-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
```bash
npm run setup:supabase
```

This will create a `.env.local` file with the required environment variables.

### 4. Configure Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Update `.env.local` with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 5. Set up the database schema

1. Go to your Supabase dashboard > SQL Editor
2. Copy and run the SQL schema from `supabase-setup.md`
3. Enable anonymous sign-ins in Authentication > Settings

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Migration from localStorage 🔄

If you were using the previous localStorage version, don't worry! The app will automatically migrate your existing data to Supabase when you first load it after setting up the database.

Your migrated data includes:
- All exercises with current progress
- Streak information
- Achievement history

## Database Schema 🗄️

The app uses the following Supabase tables:

- **exercises**: Stores user exercises with targets and progress
- **user_stats**: Tracks user streaks and reset timestamps

See `supabase-setup.md` for the complete schema and setup instructions.

## Environment Variables 🔧

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts 📝

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup:supabase` - Initialize Supabase configuration

## Deployment 🚀

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your Supabase environment variables in Vercel's dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js. Make sure to:

1. Set the environment variables
2. Run `npm run build`
3. Deploy the generated files

## Contributing 🤝

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup

1. Follow the "Getting Started" steps above
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Roadmap 🗺️

- [ ] Social authentication (Google, Facebook)
- [ ] Exercise templates and suggestions
- [ ] Progress analytics and insights
- [ ] Social features and challenges
- [ ] Exercise history and trends
- [ ] Custom exercise categories
- [ ] Data export functionality

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

If you encounter any issues or have questions:

1. Check the `supabase-setup.md` guide
2. Look through existing GitHub issues
3. Create a new issue with detailed information

Happy habit tracking! 💪
