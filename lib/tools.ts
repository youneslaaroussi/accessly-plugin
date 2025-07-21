/**
 * @file This file contains the documentation for the tool suite.
 * This is not the implementation, but rather a reference for the
 * tools that will be built.
 */

// ---------------- Visual Tools ----------------

/**
 * @tool capturePage
 * @description Full-page screenshot (for vision model or audit)
 */

/**
 * @tool captureViewport
 * @description Current viewport screenshot only
 */

/**
 * @tool captureRegion
 * @description Crop screenshot by absolute/relative coords
 * @param x number
 * @param y number
 * @param w number
 * @param h number
 */

/**
 * @tool getBoundingClientRect
 * @description Get position + size of any element (for visual click alignment)
 * @param selector string
 */

/**
 * @tool getDOMSnapshot
 * @description Full DOM tree dump for reasoning
 */

/**
 * @tool describeRegion
 * @description Run vision model on cropped region
 * @param x number
 * @param y number
 * @param w number
 * @param h number
 */

/**
 * @tool highlight
 * @description Temporarily visually outline element (for debugging UX)
 * @param selector string
 */


// ---------------- Action Tools ----------------

/**
 * @tool clickSelector
 * @description Click an element via CSS
 * @param selector string
 */

/**
 * @tool clickAt
 * @description Click at absolute screen coordinate
 * @param x number
 * @param y number
 */

/**
 * @tool doubleClick
 * @description Double click
 * @param selector string
 */

/**
 * @tool type
 * @description Type text into input (with focus event etc.)
 * @param selector string
 * @param text string
 */

/**
 * @tool pressKey
 * @description Simulate keypress (Enter, Tab, ArrowDown)
 * @param key string
 */

/**
 * @tool scrollTo
 * @description Scroll to absolute position
 * @param x number
 * @param y number
 */

/**
 * @tool scrollBy
 * @description Scroll relative to current position
 * @param dx number
 * @param dy number
 */

/**
 * @tool scrollIntoView
 * @description Scroll element into view
 * @param selector string
 */

/**
 * @tool scrollPage
 * @description Continuous page scroll (e.g. for feed consumption)
 * @param direction "up" | "down"
 * @param speed "slow" | "medium" | "fast"
 */


// ---------------- Sensory / Environment Tools ----------------

/**
 * @tool listen
 * @description Capture page audio for STT (if voice/video embedded)
 * @param seconds number
 */

/**
 * @tool watchDOM
 * @description React to DOM changes in real-time
 * @param mutationCallback Function
 */

/**
 * @tool waitForSelector
 * @description Wait for element to appear
 * @param selector string
 * @param timeout number
 */

/**
 * @tool wait
 * @description Sleep / pause execution
 * @param seconds number
 */

/**
 * @tool getCurrentURL
 * @description URL awareness
 */

/**
 * @tool getMetaTags
 * @description Title, description, OpenGraph, etc.
 */

/**
 * @tool getLang
 * @description Page language
 */

/**
 * @tool getFocusedElement
 * @description Where the cursor/focus is now
 */


// ---------------- Navigation + Structure ----------------

/**
 * @tool goTo
 * @description Navigate tab to a new URL
 * @param url string
 */

/**
 * @tool back
 * @description Browser history controls
 */

/**
 * @tool forward
 * @description Browser history controls
 */

/**
 * @tool reload
 * @description Force page reload
 */

/**
 * @tool getTabs
 * @description Enumerate all open tabs (title, URL)
 */

/**
 * @tool switchTab
 * @description Switch to a different tab
 * @param index number
 * @param title string
 */

/**
 * @tool closeTab
 * @description Close current tab
 * @param index number
 */

/**
 * @tool openLink
 * @description Click link and open in new tab
 * @param selector string
 */


// ---------------- Memory + File System (optional) ----------------

/**
 * @tool captureHTML
 * @description Get a snapshot of the current page's HTML, with an optional depth and root selector.
 * @param depth number
 * @param selector string
 */

/**
 * @tool storeFact
 * @description Let LLM cache info mid-session
 * @param key string
 * @param value any
 */

/**
 * @tool getFact
 * @description Retrieve a fact from the cache
 * @param key string
 */

/**
 * @tool getAllFacts
 * @description Retrieve all facts from the cache
 */

/**
 * @tool deleteFact
 * @description Delete a fact from the cache
 * @param key string
 */
