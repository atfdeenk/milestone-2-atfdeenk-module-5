# ShopSmart - Next.js E-commerce Application

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://shopsmart-next.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

ShopSmart is a modern, feature-rich e-commerce application built with Next.js, TypeScript, and Tailwind CSS. It provides a seamless shopping experience with advanced features like product browsing, cart management, user authentication, and more.

## 📱 Preview

### Home Page
![ShopSmart Home Page](/public/assets/shopsmart-nextjs.png)

### Home Page - User Logged In
![ShopSmart Home Page - User Logged In](/public/assets/shopsmart-nextjs-login.png)

## 🚀 Features

### Product Management
- **Product Catalog**
  - Browse comprehensive product listings
  - View detailed product information
  - See related products suggestions
  - Advanced filtering and sorting options
  - Real-time product search
  - Product categories and tags

### User Features
- **Authentication**
  - Secure user registration and login
  - Admin authentication with special privileges
  - Protected routes and authenticated API calls

- **Profile Management**
  - View and update user profile
  - Track order history
  - Manage favorite products

### Shopping Experience
- **Shopping Cart**
  - Add/remove products
  - Adjust quantities
  - Persistent cart data per user
  - Separate cart management for admin users
  - Real-time cart updates

- **Checkout Process**
  - Streamlined checkout flow
  - Order confirmation
  - Receipt generation

### User Interface
- **Responsive Design**
  - Mobile-first approach
  - Optimized for all screen sizes
  - Touch-friendly interactions

- **Theme Support**
  - Dark/Light mode toggle
  - Persistent theme preference
  - Smooth theme transitions

- **User Experience**
  - Loading states and animations
  - Toast notifications
  - Error handling and feedback
  - Infinite scroll for product listings

### Performance
- **Optimizations**
  - Server-side rendering (SSR)
  - Image optimization with Next.js
  - Code splitting and lazy loading
  - Caching strategies
  - Fast page navigation

## 🛠 Technology Stack

### Core Technologies
- **Frontend Framework**: Next.js 15.1.6
  - Server-side rendering
  - API routes
  - File-based routing
- **Language**: TypeScript
  - Type safety
  - Enhanced IDE support
  - Better code maintainability
- **Styling**: Tailwind CSS
  - Utility-first approach
  - Dark mode support
  - Custom configurations
- **State Management**: React Context & Hooks
  - Global state management
  - Custom hooks for reusability
  - Optimized re-renders

### Key Dependencies
- **UI Components**: React 19.0.0
- **Icons**: React Icons 5.4.0
- **Notifications**: React Toastify 11.0.3
- **HTTP Client**: Native Fetch API

### Development Tools
- **Testing**:
  - Jest 29.7.0
  - React Testing Library 16.2.0
  - MSW (Mock Service Worker) 1.3.2
- **Type Checking**: TypeScript 5
- **Code Quality**: ESLint & Prettier

## 📁 Project Structure

```
shopsmart/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   └── common/       # Shared components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Next.js pages
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin pages
│   │   └── products/    # Product pages
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/               # Static assets
├── tests/                # Test files
└── config files          # Configuration files
```

### Key Directories Explained

- **components/**: Reusable UI components organized by feature
- **context/**: React Context providers for global state management
- **hooks/**: Custom React hooks for shared logic
- **pages/**: Next.js pages and API routes
- **styles/**: Global styles and Tailwind configurations
- **types/**: TypeScript type definitions
- **utils/**: Helper functions and utilities
- **public/**: Static assets like images and icons
- **tests/**: Test files organized by feature

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/atfdeenk/milestone-2-atfdeenk-module-5.git
   cd milestone-2-atfdeenk-module-5
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🧪 Testing

### Running Tests

The project uses Jest and React Testing Library for testing. Tests are located in the `tests` directory.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- Unit tests for utility functions
- Component tests using React Testing Library
- Integration tests for key features
- API route tests
- Mock Service Worker for API mocking

## 🚀 Deployment

### Production Deployment

The application is deployed on Vercel and can be accessed at [https://shopsmart-next.vercel.app/](https://shopsmart-next.vercel.app/)

### Deployment Features

- Automatic deployments from main branch
- Preview deployments for pull requests
- Environment variable management
- SSL/TLS encryption
- CDN distribution
- Analytics and monitoring

## 🤝 Contributing

### Development Process

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Make your changes
4. Run tests and linting:
   ```bash
   npm run test
   npm run lint
   ```
5. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
6. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
7. Open a Pull Request

### Code Style

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🔒 Security

- All API routes are protected with appropriate authentication
- Sensitive data is never exposed to the client
- CORS is properly configured
- Input validation on both client and server
- Secure session management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Icons](https://react-icons.github.io/react-icons)
- [Platzi Fake Store API](https://api.escuelajs.co/docs/)

## 📧 Contact

- Author: atfdeenk
- GitHub: [https://github.com/atfdeenk](https://github.com/atfdeenk)
- Email: [your-email@example.com](mailto:your-email@example.com)

For any questions or feedback, please feel free to reach out!
