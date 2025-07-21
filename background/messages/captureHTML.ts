import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { selector, depth } = req.body

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const captureHtmlContent = (selector?: string, depth?: number) => {
      const getElementTree = (element: Element, currentDepth: number): any => {
        if (depth && currentDepth > depth) {
          return null;
        }

        const children = Array.from(element.children)
          .map(child => getElementTree(child, currentDepth + 1))
          .filter(child => child !== null);

        return {
          tagName: element.tagName.toLowerCase(),
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {} as Record<string, string>),
          children: children.length > 0 ? children : undefined,
          textContent: children.length === 0 ? element.textContent?.trim() : undefined
        };
      };

      const rootElement = selector ? document.querySelector(selector) : document.documentElement;
      
      if (!rootElement) {
        throw new Error(selector ? `Element not found for selector: ${selector}` : "Root element not found.");
      }
      
      return getElementTree(rootElement, 1);
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: captureHtmlContent,
      args: [selector, depth ? parseInt(depth, 10) : undefined]
    });

    const capturedHtml = results[0]?.result || "Could not capture HTML.";
    console.log("Captured HTML structure:", capturedHtml);
    res.send({ result: capturedHtml });

  } catch (error) {
    console.error("Error capturing HTML:", error)
    res.send({ error: error.message })
  }
}

export default handler 