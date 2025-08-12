# StockCéramique - Inventory Management System

## Overview

StockCéramique is a comprehensive inventory management system designed for ceramic spare parts management. The application provides a complete solution for tracking stock levels, managing suppliers, processing purchase requests, handling receptions and outbound shipments, and generating reports. It features a modern web interface built with React and TypeScript, backed by a PostgreSQL database with Drizzle ORM for data persistence.

The system is specifically tailored for industrial environments where precise inventory control is critical, offering features like low stock alerts, detailed movement tracking, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

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