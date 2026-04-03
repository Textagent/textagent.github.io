# Connector UX Improvements — Auto-Connect & Coming Soon

- Free connectors (Hacker News, Weather) now auto-connect on first-ever visit
- Users get live data injected into AI context immediately without any manual setup
- `autoConnectFreeConnectors()` runs during init, checks for keyless `authType: 'none'` connectors with no existing localStorage state
- Notion and Google Drive show purple "Coming Soon" badge instead of "Connect" button
- Prevents user confusion from clicking Connect on CORS-blocked integrations
- `comingSoon: true` flag added to Notion and Google Drive registry entries
- New `.connector-coming-soon-badge` CSS class with purple glassmorphic styling
