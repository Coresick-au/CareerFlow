---
trigger: always_on
---

STRICT UI RULE: DARK MODE & THEME SEMANTICS

No Hardcoded Colors: Never use bg-white, text-black, or specific hex codes.

Use CSS Variables Only: All components MUST use Tailwind's semantic classes: bg-background, text-foreground, border-border, bg-card, and text-muted-foreground.

Dark Mode Testing: Every new component must be verified in both light and dark states. If a component looks "broken" in dark mode, it is because it's missing a semantic class or has a hardcoded white background.

Radix/Shadcn Standard: Follow the established pattern in src/index.css where colors are defined as HSL variables.

Project-Specific Safeguards
Prevent Runtime Panics (Tauri Handlers): You must always verify the src-tauri/src/main.rs file when adding or modifying commands. Ensure that no duplicate command names are registered within the tauri::generate_handler! macro, as this causes an immediate runtime panic upon application startup.

Strict Error Handling (Database): Prohibit the use of .unwrap() or .expect() within src-tauri/src/database.rs. You must always return a SqlResult or Result and handle potential errors gracefully to prevent the application from crashing to the desktop.

Cross-Platform Path Resolution: Do not use relative file paths for database storage (e.g., careerflow.db). Instead, use Tauri’s PathResolver to ensure the database is stored in the correct application data directory for the user's operating system.

Contextual Analysis Requirements
Configuration Awareness: Always cross-reference backend Rust code with the project configuration in src-tauri/tauri.conf.json. Pay specific attention to the allowlist and bundle settings to ensure required features and icons are correctly defined.

Holistic Debugging: When debugging "crash to desktop" issues, switch to "Agent" or "Composer" mode to analyze the interactions between models.rs, database.rs, and the main.rs entry point. Do not rely on single-file analysis for runtime errors.

Panic Log Prioritization: If a "Panic" message or terminal log is provided from cargo tauri dev, prioritize the specific error string (e.g., "internal error: entered unreachable code") over general code logic to identify the exact cause of the crash.

Code Quality Patterns
Explicit State Management: Ensure the AppState struct in main.rs is the single source of truth for shared resources like the database connection.

Safe Data Conversions: Use proper error mapping when converting database rows into Rust models to avoid crashes caused by schema mismatches.