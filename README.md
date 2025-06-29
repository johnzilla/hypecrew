# HypeCrew

A two-sided marketplace connecting people who need hype talent (solo performers or crews) for events with professional hype artists. Think Airtasker meets TaskRabbit, but for entertainment and energy services.

**Live Demo**: [https://frolicking-torte-1269d1.netlify.app/](https://frolicking-torte-1269d1.netlify.app/)

## 🎯 What is HypeCrew?

HypeCrew bridges the gap between event organizers and professional hype performers. Whether you need energy for a wedding, gaming tournament, birthday party, or corporate event, HypeCrew connects you with verified talent who specialize in bringing the hype.

### Sample Use Cases
- "Hype person needed for birthday party - $120"
- "Wedding entrance energy crew - $300" 
- "Gaming tournament host/hype - $80/hour"
- "Corporate team building energizer - $200"

## 🚀 Features

### For Clients
- **Post gigs** with specific requirements and budgets
- **Browse performer profiles** with portfolios and specialties
- **Advanced filtering** by location, price, date, and hype style
- **Real-time messaging** with performers
- **Review and rating system** for quality assurance

### For Performers
- **Create detailed profiles** with portfolios and demo content
- **Browse available gigs** in your area
- **Apply to opportunities** that match your style
- **Manage bookings** and client communications
- **Build reputation** through reviews and ratings

### Hype Style Categories
**Energy Types**: High Energy, Smooth Vibes, Comedy Hype, Motivational  
**Event Specialties**: Wedding Hype, Workout/Fitness, Gaming/Esports, Social Media, Corporate Events

## 🛠 Tech Stack

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Deployment**: Netlify
- **Development Platform**: Bolt.new

## 🏗 Architecture

### Database Schema
- **Users**: Talent performers and clients with role-based access
- **Gig Listings**: Event details, requirements, budgets, locations
- **Performer Profiles**: Portfolios, specialties, rates, availability
- **Applications**: Performer interest in specific gigs
- **Bookings**: Confirmed gig assignments
- **Reviews**: Post-gig ratings and feedback
- **Messages**: Real-time communication system

### Security Features
- **Row Level Security (RLS)** policies for data protection
- **Role-based authentication** (performers vs clients)
- **Secure file upload** for portfolios and demos
- **Protected messaging** between users
- **Payment processing** integration ready

## 📱 UI/UX Design

- **Mobile-first responsive design**
- **Professional blue accent colors** (#007AFF)
- **Clean card-based layouts** with subtle shadows
- **Intuitive navigation** with bottom nav bar
- **Clear information hierarchy**
- **Subtle animations** and micro-interactions

## 🔧 Development

This project was built using **Bolt.new**, enabling rapid prototyping and deployment of a full-stack marketplace application.

### Key Technical Decisions
- **TypeScript** for type safety and developer experience
- **Supabase** for backend-as-a-service with real-time capabilities
- **Tailwind CSS** for rapid, consistent styling
- **Component-based architecture** for maintainability
- **Mobile-first design** for optimal user experience

## 🎨 Design Philosophy

HypeCrew balances **professionalism** with the **energy and excitement** of the hype industry. The interface is clean and trustworthy while maintaining the dynamic spirit of entertainment services.

## 🚀 Future Enhancements

- [ ] Payment processing with escrow system
- [ ] Push notifications for new gig matches
- [ ] Video portfolio uploads
- [ ] Calendar integration
- [ ] Multi-performer team booking
- [ ] Performance analytics dashboard
- [ ] Gig recommendation algorithm
- [ ] Performer verification system

## 💡 Innovation

HypeCrew represents the first dedicated platform for booking hype talent, identifying and solving a gap in the entertainment marketplace. It demonstrates how modern web technologies can create new opportunities in traditional industries.

## 📄 License

This project is part of a portfolio demonstrating full-stack development capabilities and marketplace architecture.

## 👨‍💻 Author

- LinkedIn: [@johnturner313](https://www.linkedin.com/in/johnturner313)
- GitHub: [@johnzilla](https://github.com/johnzilla)
- Portfolio: [johnturner.com](https://johnturner.com)
