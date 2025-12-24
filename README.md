# CareerFlow

A local-first, high-performance desktop application for career earnings analysis built for the Australian market.

## Features

- **Two-Tier Compensation Entry**: Quick fuzzy estimation and precise payslip-level tracking
- **Overtime-Aware Calculations**: Accurate effective hourly rates including overtime
- **Australian Market Logic**: Tax brackets, superannuation rates, and local benchmarks
- **Loyalty Tax Analysis**: Identify missed opportunities from long tenure
- **ChatGPT Resume Export**: Structured JSON exports for AI-powered resume generation
- **Professional Desktop UI**: Clean, fast interface optimized for Windows

## Tech Stack

- **Backend**: Rust with Tauri framework
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Local SQLite with rusqlite
- **Charts**: Recharts for data visualization
- **UI Components**: shadcn/ui with Radix UI primitives

## Prerequisites

- Node.js 18+ 
- Rust 1.70+
- Windows 10+ (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CareerFlow
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Rust dependencies (if not already installed):
```bash
cd src-tauri
cargo fetch
cd ..
```

## Development

Start the development server:
```bash
npm run tauri dev
```

This will launch:
- Vite dev server on http://localhost:1420
- Tauri desktop application window
- Hot reload for both frontend and backend changes

## Building for Production

Create a distributable installer:
```bash
npm run tauri build
```

The installer will be available in `src-tauri/target/release/bundle/`

## Project Structure

```
CareerFlow/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Tauri entry point
│   │   ├── models.rs    # Data models
│   │   ├── database.rs  # SQLite operations
│   │   └── calculations.rs # Financial calculations
│   └── Cargo.toml       # Rust dependencies
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   └── lib/            # Utilities
└── package.json        # Node dependencies
```

## Data Storage

CareerFlow stores all data locally in SQLite:
- User profile and preferences
- Career timeline with positions
- Compensation records (fuzzy and exact)
- Calculated earnings and loyalty tax

No cloud services or external APIs are required.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check the troubleshooting section
- Review the documentation
- Submit an issue on GitHub

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors about missing modules:
```bash
npm install
```

### Build Issues
If the build fails:
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Clear Tauri cache: `npm run tauri clean`
4. Rebuild: `npm run tauri build`

### Database Issues
If data isn't persisting:
1. Check app permissions
2. Verify SQLite is installed
3. Reset database: Delete app data folder

### Performance Issues
For slow performance:
1. Check for large compensation datasets
2. Consider database indexing
3. Review calculation complexity
