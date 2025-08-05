# Accessly Chrome Plugin - Complete Documentation

## Overview

Accessly is a Chrome extension that provides browser automation tools via multiple communication backends. It enables external applications to control browser interactions through WebSocket, HTTP, or Bluetooth Low Energy (BLE) connections.

## Communication Architecture

**Chrome Extension = CLIENT** | **External Electron App = SERVER**

### 🔵 WebSocket Communication (Primary)
- **Extension connects TO:** `ws://localhost:8080` (as WebSocket CLIENT)
- **Electron app runs:** WebSocket SERVER on port 8080
- **Protocol:** Real-time JSON messaging
- **Timeout:** 30 seconds per request
- **Auto-reconnection:** Yes (extension retries connection)
- **Keep-alive:** Service worker alarm every 15 seconds

### 🟢 HTTP Communication (Fallback)
- **Extension connects TO:** `http://localhost:3001` (as HTTP CLIENT)
- **Electron app runs:** HTTP SERVER on port 3001
- **Protocol:** RESTful JSON API
- **Timeout:** 5 seconds per request
- **Required Endpoints for Electron server:**
  - `GET /ping` - Health check
  - `GET /health` - Connection status
  - `POST /execute-tool` - Execute any tool
  - `GET /extension/tools` - Get available tools list
  - `POST /extension/run-tool` - Run specific tool
  - `POST /message` - Send custom message

### 📱 Bluetooth Low Energy (BLE)
- **Service UUID:** `12345678-1234-5678-9012-123456789abc`
- **Device Pattern:** `ACCESSLY_{PIN}`
- **Characteristics:**
  - **Tool Calls:** `87654321-4321-8765-2109-876543210abc` (Write)
  - **Tool Results:** `abcdef12-3456-789a-bcde-f123456789ab` (Notify)
- **Connection:** PIN-based pairing
- **Timeout:** 30 seconds per request

### 🔧 Direct Extension
- **Protocol:** Chrome extension messaging
- **Target:** Background script
- **Scope:** Local tab operations only

## Message Formats

### Tool Execution Request
```typescript
{
  toolName: string,
  parameters?: Record<string, any>,
  executionId?: string
}
```

### Tool Execution Response
```typescript
{
  success: boolean,
  executionId: string,
  toolName: string,
  result?: any,
  error?: string,
  timestamp: number,
  duration?: number
}
```

## Complete Tool Reference

### 🎨 Visual Tools

#### `capturePage`
**Description:** Full-page screenshot for vision model or audit  
**Parameters:** None  
**Returns:** Base64 encoded image data

#### `captureViewport`
**Description:** Current viewport screenshot only  
**Parameters:** None  
**Returns:** Base64 encoded image data

#### `captureRegion`
**Description:** Crop screenshot by absolute/relative coordinates  
**Parameters:**
- `x` (number) - X coordinate
- `y` (number) - Y coordinate  
- `w` (number) - Width
- `h` (number) - Height

#### `getBoundingClientRect`
**Description:** Get position + size of any element for visual click alignment  
**Parameters:**
- `selector` (string) - CSS selector

#### `getDOMSnapshot`
**Description:** Full DOM tree dump for reasoning  
**Parameters:** None  
**Returns:** Complete DOM structure

#### `describeRegion`
**Description:** Run vision model on cropped region  
**Parameters:**
- `x` (number) - X coordinate
- `y` (number) - Y coordinate
- `w` (number) - Width  
- `h` (number) - Height

#### `highlight`
**Description:** Temporarily visually outline element for debugging UX  
**Parameters:**
- `selector` (string) - CSS selector  
**Example:** `{ selector: ".button" }`

### ⚡ Action Tools

#### `clickSelector`
**Description:** Click an element via CSS selector  
**Parameters:**
- `selector` (string) - CSS selector

#### `clickAt`
**Description:** Click at absolute screen coordinate  
**Parameters:**
- `x` (number) - X coordinate
- `y` (number) - Y coordinate  
**Example:** `{ x: 100, y: 200 }`

#### `doubleClick`
**Description:** Double click element  
**Parameters:**
- `selector` (string) - CSS selector

#### `type`
**Description:** Type text into input with focus event  
**Parameters:**
- `selector` (string) - CSS selector
- `text` (string) - Text to type

#### `pressKey`
**Description:** Simulate keypress (Enter, Tab, ArrowDown)  
**Parameters:**
- `key` (string) - Key name

#### `scrollTo`
**Description:** Scroll to absolute position  
**Parameters:**
- `x` (number) - X position
- `y` (number) - Y position

#### `scrollBy`
**Description:** Scroll relative to current position  
**Parameters:**
- `dx` (number) - Horizontal delta
- `dy` (number) - Vertical delta

#### `scrollIntoView`
**Description:** Scroll element into view  
**Parameters:**
- `selector` (string) - CSS selector

#### `scrollPage`
**Description:** Continuous page scroll for feed consumption  
**Parameters:**
- `direction` ("up" | "down") - Scroll direction
- `speed` ("slow" | "medium" | "fast") - Scroll speed  
**Example:** `{ direction: "down", speed: "medium" }`

### 🧭 Navigation & Structure

#### `goTo`
**Description:** Navigate tab to a new URL  
**Parameters:**
- `url` (string) - Target URL  
**Example:** `{ url: "https://example.com" }`

#### `back`
**Description:** Browser history back  
**Parameters:** None

#### `forward`
**Description:** Browser history forward  
**Parameters:** None

#### `reload`
**Description:** Force page reload  
**Parameters:** None

#### `getTabs`
**Description:** Enumerate all open tabs (title, URL)  
**Parameters:** None

#### `switchTab`
**Description:** Switch to a different tab  
**Parameters:**
- `index` (number) - Tab index
- `title` (string) - Tab title

#### `closeTab`
**Description:** Close current tab  
**Parameters:**
- `index` (number) - Tab index

#### `openLink`
**Description:** Click link and open in new tab  
**Parameters:**
- `selector` (string) - CSS selector

### 👂 Sensory & Environment Tools

#### `listen`
**Description:** Capture page audio for STT if voice/video embedded  
**Parameters:**
- `seconds` (number) - Recording duration  
**Example:** `{ seconds: 5 }`

#### `watchDOM`
**Description:** React to DOM changes in real-time  
**Parameters:**
- `mutationCallback` (Function) - Callback function

#### `waitForSelector`
**Description:** Wait for element to appear  
**Parameters:**
- `selector` (string) - CSS selector
- `timeout` (number) - Timeout in milliseconds  
**Example:** `{ selector: ".loading", timeout: 10000 }`

#### `wait`
**Description:** Sleep/pause execution  
**Parameters:**
- `seconds` (number) - Sleep duration

#### `getCurrentURL`
**Description:** URL awareness  
**Parameters:** None

#### `getMetaTags`
**Description:** Get title, description, OpenGraph, etc.  
**Parameters:** None

#### `getLang`
**Description:** Get page language  
**Parameters:** None

#### `getFocusedElement`
**Description:** Get where the cursor/focus is now  
**Parameters:** None

### 💾 Memory & File System

#### `captureHTML`
**Description:** Get snapshot of current page's HTML with optional depth and root selector  
**Parameters:**
- `depth` (number) - Traversal depth
- `selector` (string) - Root selector  
**Example:** `{ selector: "body", depth: 2 }`

#### `storeFact`
**Description:** Let LLM cache info mid-session  
**Parameters:**
- `key` (string) - Storage key
- `value` (any) - Value to store  
**Example:** `{ key: "user_preference", value: "dark_theme" }`

#### `getFact`
**Description:** Retrieve a fact from the cache  
**Parameters:**
- `key` (string) - Storage key

#### `getAllFacts`
**Description:** Retrieve all facts from the cache  
**Parameters:** None

#### `deleteFact`
**Description:** Delete a fact from the cache  
**Parameters:**
- `key` (string) - Storage key

## Tool Categories Summary

| Category | Count | Tools |
|----------|-------|-------|
| **Visual** | 7 | capturePage, captureViewport, captureRegion, getBoundingClientRect, getDOMSnapshot, describeRegion, highlight |
| **Action** | 9 | clickSelector, clickAt, doubleClick, type, pressKey, scrollTo, scrollBy, scrollIntoView, scrollPage |
| **Navigation** | 7 | goTo, back, forward, reload, getTabs, switchTab, closeTab, openLink |
| **Sensory** | 8 | listen, watchDOM, waitForSelector, wait, getCurrentURL, getMetaTags, getLang, getFocusedElement |
| **Memory** | 4 | captureHTML, storeFact, getFact, getAllFacts, deleteFact |
| **Total** | **35** | - |

## Implementation Status

### ✅ Implemented Tools (19)
- `capturePage`, `captureHTML`, `highlight`, `clickAt`, `scrollPage`, `scrollBy`, `scrollTo`
- `scrollIntoView`, `goTo`, `back`, `forward`, `reload`, `closeTab`, `listen`, `waitForSelector`
- `storeFact`, `getFact`, `getAllFacts`, `deleteFact`

### 🚧 Documented Only (16)
- `captureViewport`, `captureRegion`, `getBoundingClientRect`, `getDOMSnapshot`, `describeRegion`
- `clickSelector`, `doubleClick`, `type`, `pressKey`, `getTabs`, `switchTab`, `openLink`
- `watchDOM`, `wait`, `getCurrentURL`, `getMetaTags`, `getLang`, `getFocusedElement`

## Usage Examples

### Extension as WebSocket Client

```javascript
// Extension automatically connects to WebSocket server at startup
// The extension code handles this internally:

import { commManager } from './lib/communication';

// Extension connects as client to external WebSocket server
await commManager.connectWebSocket('ws://localhost:8080');

// Extension sends tool execution requests
const result = await commManager.executeTool('clickAt', { x: 100, y: 200 });
```

### Extension as HTTP Client

```javascript
// Extension automatically makes HTTP requests to external server
import { electronComm } from './lib/electronComm';

// Extension connects as client to external HTTP server
const isConnected = await electronComm.isConnected(); // Pings localhost:3001

// Extension makes HTTP POST requests to execute tools
const result = await electronComm.executeTool('scrollPage', {
  direction: 'down', 
  speed: 'medium'
});
```

### Unified Communication Manager

```javascript
import { commManager } from './lib/communication';

// Auto-connect (tries WebSocket → HTTP → BLE)
await commManager.autoConnect();

// Execute tool (works with any backend)
const result = await commManager.executeTool('highlight', {
  selector: '.target-element'
});

console.log('Tool result:', result);
```

### ElectronComm Convenience Methods

```javascript
import { electronComm } from './lib/electronComm';

// High-level tool execution
await electronComm.clickAt(100, 200);
await electronComm.scrollPage('down', 'medium');
await electronComm.navigateToUrl('https://example.com');
await electronComm.highlightElement('.button');
await electronComm.captureHTML('body', 2);
await electronComm.storeFact('session_id', '12345');
```

## Electron App Server Requirements

**Your Electron app must run BOTH servers to communicate with the extension:**

### Required: WebSocket Server (Port 8080)
The extension connects as a WebSocket CLIENT to your Electron app's WebSocket SERVER.

### Required: HTTP Server (Port 3001) 
The extension connects as an HTTP CLIENT to your Electron app's HTTP SERVER.

See the complete Electron server implementation script below.

## Connection Priority & Fallback

1. **BLE** (if PIN provided and available)
2. **WebSocket** (ws://localhost:8080)
3. **HTTP** (http://localhost:3001)
4. **Direct Extension** (local execution only)

## Configuration

### Default Ports
- **WebSocket:** 8080
- **HTTP:** 3001
- **BLE:** PIN-based discovery

### Timeouts
- **WebSocket requests:** 30 seconds
- **HTTP requests:** 5 seconds
- **BLE requests:** 30 seconds

### Keep-alive
- **Service Worker alarm:** Every 15 seconds
- **WebSocket ping:** Automatic reconnection

## Security Considerations

- Extension operates with `activeTab` permission
- WebSocket/HTTP connections are localhost-only by default
- BLE requires explicit PIN-based pairing
- All tool executions are logged and tracked
- No remote code execution - only predefined tools

## Development Setup

1. **Start your Electron app servers** (WebSocket on 8080 + HTTP on 3001)
2. **Load extension in Chrome Developer Mode**
3. **Extension auto-connects** to your servers on startup
4. **Monitor connections** via extension sidepanel
5. **View execution logs** in real-time

**Critical:** Your Electron app must be running BEFORE the extension attempts connection!

---

*Generated from Accessly Chrome Plugin codebase analysis*