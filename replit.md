# StockCéramique - Inventory Management System

## Overview

StockCéramique is a comprehensive inventory management system designed for ceramic spare parts management. The application provides a complete solution for tracking stock levels, managing suppliers, processing purchase requests, handling receptions and outbound shipments, and generating reports. It features a modern web interface built with React and TypeScript, backed by a PostgreSQL database with Drizzle ORM for data persistence.

The system is specifically tailored for industrial environments where precise inventory control is critical, offering features like low stock alerts, detailed movement tracking, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 2025 - Migration & Form Integration Optimization Complete
- **Migration to Replit Environment Complete**: Successfully migrated comprehensive StockCéramique system from Replit Agent to standard Replit environment with full functionality preservation (August 15, 2025)
- **Real-time Dashboard Values Connected**: Fixed analytics service method naming issues and connected dashboard to live PostgreSQL database showing accurate €13,005 total stock value, 0 critical articles, and 5 total articles (August 15, 2025)
- **Database-Driven Analytics**: All dashboard metrics now pull from real database with proper formatting - total articles count, low stock alerts, pending requests, and financial calculations all working correctly (August 15, 2025)
- **Enhanced Dashboard Display**: Optimized both Dashboard.tsx and EnhancedDashboard.tsx to show real-time values with improved French locale formatting for currency and proper database field mapping (August 15, 2025)
- **Analytics Service Optimization**: Fixed TypeScript errors and method naming conflicts (getAllArticles → getArticles, etc.) ensuring all analytics endpoints return authentic database values (August 15, 2025)
- **Performance Metrics Integration**: Real-time performance monitoring with actual query times, cache hit ratios, and system metrics integrated into enhanced dashboard interface (August 15, 2025)
- **Administration Menu Cleanup**: Removed Administration menu item from user dropdown and streamlined navigation to Settings only (August 15, 2025)
- **Settings Integration Complete**: Connected ArticleForm Catégorie/Marque fields and RequestorForm Département/Poste fields to use data from Settings page instead of hardcoded values (August 15, 2025)
- **Dynamic Form Dropdowns**: Updated all form dropdowns to pull from database: Categories, Brands, Departments, and Positions now use Settings-managed data with proper API integration (August 15, 2025)
- **Advanced Optimization Components Deployed**: Successfully implemented ToastNotifications, KeyboardShortcuts, BulkOperations, VirtualizedDataTable, AdvancedAnalytics, and SmartAlerts components (August 15, 2025)
- **Database Performance Optimization**: Created and applied strategic database indexing including composite indexes for frequent query patterns, full-text search capabilities, and performance monitoring views (August 15, 2025)
- **PWA Enhancement Complete**: Advanced Progressive Web App functionality with offline support, background sync, push notifications, and intelligent caching strategies via service worker (August 15, 2025)
- **Global Optimization Integration**: Keyboard shortcuts and toast notifications integrated application-wide, with enhanced navigation and user feedback systems (August 15, 2025)
- **React Window Integration**: Added virtual scrolling capabilities for handling large datasets efficiently with react-window library (August 15, 2025)

### August 2025 - Migration Complete & Advanced Admin Settings
- **Migration Completed**: Successfully migrated StockCéramique from Replit Agent to standard Replit environment (August 15, 2025)
- **Enhanced Autocomplete System**: Implemented intelligent article search with 3-character trigger for purchase requests, receptions, and outbound entries (August 15, 2025)
- **Multi-Article Purchase Requests**: Added comprehensive purchase request system supporting multiple articles with individual quantities, prices, and suppliers (August 15, 2025)
- **Database Schema Migration**: Pushed complete database schema with all tables and relationships (August 13, 2025)
- **PostgreSQL Database**: Created and configured production PostgreSQL database with Neon provider (August 13, 2025)
- **TypeScript Issues Resolved**: Fixed all storage layer type compatibility issues for database operations (August 13, 2025)
- **API Integration Verified**: All REST endpoints working correctly with PostgreSQL backend (August 13, 2025)
- **Full Stack Testing**: Verified CRUD operations for articles, suppliers, requestors, and purchase requests (August 13, 2025)
- **Database Storage**: Implemented DatabaseStorage class replacing MemStorage for production use (August 13, 2025)
- **Project Dependencies**: Installed all 70+ required Node.js packages and dependencies successfully (August 13, 2025)
- **Workflow Configuration**: Application running successfully on port 5000 with hot reload enabled (August 13, 2025)
- **Architecture Validated**: Confirmed client/server separation with proper security practices
- **Production Ready**: System ready for deployment with authentic database backend
- **Advanced Admin Settings**: Comprehensive administration module with user management, system settings, security controls, backup management, audit logging, and maintenance tools (August 13, 2025)

#### Major Enhancements Implemented:
1. **Advanced Search & AI-Powered Filtering**
   - Implemented AdvancedSearch component with fuzzy matching and multi-criteria filtering
   - Added intelligent search suggestions and real-time filtering
   - Support for price ranges, stock levels, categories, and supplier filtering

2. **Interactive Analytics & Business Intelligence**
   - Created comprehensive Analytics page with predictive insights
   - Implemented InteractiveChart component with multiple visualization types
   - Added PredictiveAnalytics with AI-powered recommendations and demand forecasting
   - Enhanced Dashboard with interactive charts and trend analysis

3. **Performance Optimization & PWA Support**
   - Developed PerformanceOptimizer component for real-time performance monitoring
   - Implemented PWASupport for mobile app installation and offline capabilities
   - Added caching strategies and performance metrics tracking
   - Created PerformanceMonitor for system health monitoring

4. **Enhanced User Experience**
   - Modernized Articles page with advanced filtering and analytics visualization
   - Added real-time performance tracking and optimization recommendations
   - Implemented mobile-first design with PWA capabilities
   - Enhanced Dashboard with predictive analytics integration

5. **Comprehensive Settings System**
   - Built complete settings interface with tabbed organization
   - Added user preferences for workflow customization
   - Implemented theme controls, language settings, and visual customization
   - Created functional controls for auto-save, notifications, and security
   - Added import/export functionality for configuration backup/restore

#### Technical Achievements:
- **Database Migration**: Successfully migrated from localStorage to PostgreSQL with Neon Database
- **Real-time Dashboard**: Connected all stats and charts to live database queries
- **Chart Data APIs**: Implemented 4 new API endpoints for chart data (stock evolution, purchase status, category distribution, recent movements)
- **Empty State Handling**: Added proper empty states for charts when no data is available
- **Database Storage**: Implemented full DatabaseStorage class with optimized queries using Drizzle ORM
- **Reception System Optimization**: Implemented automatic conversion from purchase requests to receptions with editable quantity and price fields
- **Outbound System Enhancement**: Added stock optimization with real-time stock calculations, insufficient stock warnings, and stock-after-outbound display
- **Purchase Request Status Updates**: Fixed API validation issues for smooth status transitions
- **Enhanced Status Visualization**: Improved status badge colors with proper dark mode support
- All components use TypeScript for type safety
- Implemented responsive design with Tailwind CSS
- Added comprehensive error handling and loading states
- Created modular, reusable components for scalability
- Integrated Recharts for advanced data visualization
- Added real-time performance monitoring capabilities
- Built comprehensive settings system with full application control
- Implemented user preference management with persistent storage

### December 2024
- Added new modules as requested:
  - **"Suivi des Achats" (Purchase Follow-up)**: Complete purchase request tracking with status management (En Attente, Approuvé, Commandé, Refusé)
  - **"État du Stock" (Stock Status)**: Comprehensive inventory overview with stock level analysis, filtering, and visual indicators
- Enhanced navigation sidebar with new module links
- Implemented responsive UI components using Shadcn/ui for consistent design

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Microsoft-inspired design tokens
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot reload with Vite integration

### Data Storage
- **Primary Database**: PostgreSQL with connection pooling
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Backup Strategy**: Local storage backup functionality with JSON export

### Core Entities and Relationships
- **Articles**: Spare parts inventory with stock tracking, pricing, and supplier relationships
- **Suppliers**: Vendor management with contact information and payment terms
- **Requestors**: Employee/department management for purchase authorization
- **Purchase Requests**: Workflow for requesting new inventory with approval states
- **Receptions**: Incoming inventory tracking with delivery validation
- **Outbounds**: Stock consumption tracking with movement reasons
- **Stock Movements**: Comprehensive audit trail for all inventory changes

### Authentication and Authorization
Currently implements basic session-based approach with plans for role-based access control. The system architecture supports future expansion to include user roles like Administrator, Manager, and Employee with appropriate permission levels.

### API Design
RESTful API structure with consistent endpoint patterns:
- CRUD operations for all major entities
- Specialized endpoints for dashboard statistics and low stock alerts
- Error handling middleware with structured error responses
- Request logging for debugging and audit trails

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: `@neondatabase/serverless` for optimized database connections

### UI and Component Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Modern icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel components

### Development and Build Tools
- **Vite**: Next-generation frontend build tool with HMR
- **TypeScript**: Static type checking for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Data Management
- **TanStack Query**: Powerful data synchronization for React applications
- **React Hook Form**: Performant form library with minimal re-renders
- **Date-fns**: Modern JavaScript date utility library
- **Zod**: TypeScript-first schema validation

### Production Considerations
- **Environment Configuration**: Separate development and production configurations
- **Static Asset Serving**: Express middleware for serving built React application
- **Error Monitoring**: Structured error handling with development overlays
- **Performance**: Optimized bundle splitting and lazy loading capabilities