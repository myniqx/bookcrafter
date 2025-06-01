# BookCraft - Book Writing & World Building Tool

BookCraft is a comprehensive tool for writers to create, organize, and manage their book projects, characters, locations, and other world-building elements. It provides a structured environment for writing chapters, managing entities, and tracking relationships between different elements of your story.

## ✨ Features

### 📚 Project Management
- Create and manage multiple book projects
- Organize books into chapters
- Track project statistics and progress

### 👤 Entity Management
- Create and organize characters, locations, items, and events
- Add custom properties to entities
- Link entities to chapters where they appear
- Track entity usage across your book

### 📝 Writing Tools
- Markdown editor with live preview
- Entity reference system (@character or @character.property)
- Chapter statistics (word count, paragraph count, entity usage)
- Autosave functionality

### 🤖 AI Assistance
- AI-powered writing suggestions
- Grammar and style improvements
- Creative expansion of scenes
- Translation support
- Custom prompts for specific needs

### 🖼️ Image Management
- Add cover images to projects and books
- Include reference images for entities
- Organize images within your project

### 📤 Export Options
- Export to various formats (PDF, DOCX, EPUB)
- Customizable export settings
- Include/exclude images, cover pages, etc.

### 💾 Storage Options
- Browser local storage
- JSON file export/import
- Compressed file format (.bookcraft)
- Directory synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/bookcraft.git
cd bookcraft
\`\`\`

2. Install dependencies using pnpm:
\`\`\`bash
pnpm install
\`\`\`

3. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## 📁 Project Structure

\`\`\`
bookcraft/
├── app/                  # Next.js app directory
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── project/          # Project routes
├── components/           # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # App-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and types
│   ├── adapters/         # Storage adapters
│   ├── ai/               # AI integration
│   ├── export/           # Export functionality
│   └── types.ts          # TypeScript types
├── public/               # Static assets
└── ...                   # Config files
\`\`\`

## 🔧 Configuration

BookCraft can be configured through environment variables:

\`\`\`
# .env.local
NEXT_PUBLIC_DEFAULT_ADAPTER=localStorage
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [OpenAI](https://openai.com/)
- [Google Gemini](https://gemini.google.com/)
- [Ollama](https://ollama.ai/)
