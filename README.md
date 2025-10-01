# Fashion Breeze - Next.js E-commerce Store

This project has been converted from Angular to Next.js while preserving all the original functionality.

## Features

- **Product Catalog**: Browse and filter products by category, price, and search terms
- **Shopping Cart**: Add/remove items with size selection and quantity management
- **User Registration**: Customer registration with address details
- **WhatsApp Integration**: Order placement via WhatsApp
- **Admin Dashboard**: Product management and analytics
- **Responsive Design**: Mobile-friendly Bootstrap UI
- **Real-time Chat**: Customer support chatbot
- **Product Modal**: Detailed product view with image zoom and reviews

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
├── components/          # Reusable components
├── types/              # TypeScript interfaces
├── about/              # About page
├── contact/            # Contact page
├── login/              # Admin login
├── register/           # User registration
├── dashboard/          # Admin dashboard
├── profile/            # User profile
├── layout.tsx          # Root layout
├── page.tsx            # Home page (main store)
└── globals.scss        # Global styles

public/
├── logo.png           # Store logo
├── products.json      # Product data
└── ...               # Other assets
```

## Key Pages

- **/** - Main store with product catalog
- **/about** - About us page
- **/contact** - Contact form with WhatsApp integration
- **/register** - Customer registration
- **/profile** - User profile management
- **/login** - Admin login (demo: admin/admin123)
- **/dashboard** - Admin product management

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - Icon library
- **SCSS** - Styling
- **Local Storage** - Data persistence

## Features Converted from Angular

All Angular features have been successfully converted to Next.js:

- ✅ Component-based architecture
- ✅ State management (Angular signals → React useState)
- ✅ Routing (Angular Router → Next.js App Router)
- ✅ Forms and validation
- ✅ HTTP requests (Angular HttpClient → Fetch API)
- ✅ Local storage integration
- ✅ Bootstrap integration
- ✅ Responsive design
- ✅ TypeScript support

## Admin Features

- Product inventory management
- Sales analytics dashboard
- Customer data overview
- Real-time product updates

## Customer Features

- Product browsing and filtering
- Shopping cart management
- User registration and profiles
- WhatsApp order placement
- Live chat support
- Responsive mobile experience

## Deployment

Build the application:

```bash
npm run build
```

The application can be deployed to any platform that supports Next.js (Vercel, Netlify, etc.).

## License

This project is for educational and demonstration purposes.