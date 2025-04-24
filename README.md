# MindMap Collaboration Tool

A real-time collaborative mind mapping application with a clean, modern visual design.

## Features

- **Real-time Collaboration**: Multiple users can edit the mind map together via WebSockets
- **Hierarchical Node Structure**: Create deep trees of thought with parent-child relationships
- **Intuitive Node Management**: Create, edit, delete, and navigate nodes efficiently
- **User Authentication**: Secure login and registration system
- **Sharing Functionality**: Share mind maps with customizable view/edit permissions
- **Demo Mode**: Try the app quickly without login
- **Keyboard Shortcuts**: Power-user navigation for efficient mind mapping
  - Tab: Add child node
  - Enter: Add sibling node
  - Arrow keys: Navigate nodes
  - Delete: Remove node
- **Dark Mode**: Minimal, distraction-free interface
- **Mobile Responsive**: Optimized for both desktop and touch devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js with WebSocket support
- **Database**: SQL with Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn UI components

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- SQL database (MySQL/PostgreSQL)

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd todomindmap
   ```

2. Install dependencies

   ```bash
   npm run install:all
   ```

3. Configure environment variables

   - Copy `.env.example` to `.env` in both client and server folders
   - Update the values as needed

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Production Deployment

```bash
npm run build
npm run start
```

## License

MIT
