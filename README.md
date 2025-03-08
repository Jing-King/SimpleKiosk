# Kiosk Application

A simple Electron-based kiosk application for displaying web content in fullscreen mode. This application is perfect for information displays, digital signage, or any scenario where you need to show web content in a controlled, fullscreen environment.

## Features

- Display any web URL in kiosk mode
- Support for JSON configuration with dynamic URL updates
- Custom application icon support
- Fullscreen display mode
- Secure context isolation
- Easy-to-use settings interface
- Cross-platform support
- Keyboard shortcuts for quick access

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- npm (comes with Node.js)
- Git (optional, for cloning the repository)

### Development Setup

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application in development mode:
   ```
   npm start
   ```

## Building for Windows

### Prerequisites for Windows Build

- Windows 10 or later
- Node.js and npm installed
- Git (optional, for cloning the repository)

### Build Steps

1. Install dependencies if you haven't already:
   ```
   npm install
   ```

2. Add your application icon:
   - Place your .ico file in the `build` folder with the name `icon.ico`
   - Place your .png file in the `build` folder with the name `icon.png`
   - The icon should be at least 256x256 pixels for best results

3. Build the Windows installer:
   ```
   npm run build:win
   ```

4. The installer will be created in the `dist` folder

### Installation on Windows

1. Run the installer (.exe) file from the `dist` folder
2. Follow the installation wizard
3. The application will be installed and shortcuts will be created on the desktop and start menu

## Usage

### Basic Operation

- The application starts in kiosk mode displaying a placeholder
- Press `Ctrl+Shift+S` or `Ctrl+Shift+A` to open the settings panel
- Enter a URL and click "Save and Apply"
- Optionally, select a custom icon for the application

### URL Configuration

The application supports two types of URL configurations:

1. Direct URL:
   - Enter any valid web URL (e.g., `https://example.com`)

2. JSON Configuration:
   - You can provide a JSON object with a URL property
   - Example:
     ```json
     {"url": "https://example.com"}
     ```
   - The application will parse the JSON and load the specified URL

## Configuration

### Configuration File

The application stores its configuration in the user data directory:
- Windows: `%APPDATA%\kisok\config.json`
- macOS: `~/Library/Application Support/kisok/config.json`

The configuration file contains:
- Last used URL or JSON configuration
- Custom icon path
- Other application settings

## Troubleshooting

### Common Issues

1. **Application doesn't start**
   - Ensure you have the latest version of Node.js installed
   - Try running `npm install` again to refresh dependencies
   - Check the application logs for error messages

2. **Icon not showing**
   - Verify that your icon files are in the correct format (.ico for Windows)
   - Ensure the icon files are placed in the `build` folder
   - Check that the icon path in the configuration is correct

3. **Kiosk mode not working**
   - Try running the application as administrator on Windows
   - Ensure no other application is forcing fullscreen mode
   - Check if your display settings are compatible

### Building Issues

If you encounter issues during the build process:

1. Update electron-builder:
   ```
   npm install electron-builder@latest --save-dev
   ```

2. Clear the cache and rebuild:
   ```
   npm cache clean --force
   npm install
   npm run build:win
   ```

## Security Considerations

- The application uses context isolation for security
- IPC communication is restricted to necessary functions only
- File system access is limited to configuration and icon files

## License

ISC