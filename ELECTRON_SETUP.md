# BookCraft Electron Setup

## Development

1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

2. Start development mode:
\`\`\`bash
pnpm run electron-dev
\`\`\`

## Building for Production

### Windows
\`\`\`bash
pnpm run dist-win
\`\`\`

### Linux
\`\`\`bash
pnpm run dist-linux
\`\`\`

### macOS
\`\`\`bash
pnpm run dist-mac
\`\`\`

### All Platforms
\`\`\`bash
pnpm run dist
\`\`\`

## Application Features

- **Cross-platform**: Windows, macOS, Linux support
- **File System Access**: Native file operations
- **Auto-updater**: Automatic application updates
- **Native Menus**: Platform-specific menu bars
- **Window Management**: Proper window state management

## File Structure

\`\`\`
electron/
├── main.js          # Main Electron process
├── preload.js       # Preload script for secure IPC
└── icon/            # Application icons
    ├── icon.ico     # Windows icon
    ├── icon.png     # Linux icon
    └── icon.icns    # macOS icon
\`\`\`

## Distribution

Built applications will be available in the `dist/` directory:

- **Windows**: `.exe` installer
- **Linux**: `.AppImage` portable app
- **macOS**: `.dmg` disk image

## Development Notes

- The app runs Next.js in production mode when built
- File system operations use Electron's secure IPC
- All web APIs are available through the preload script
- Auto-save works with native file system in Electron mode
