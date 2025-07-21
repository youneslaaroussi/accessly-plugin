import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { index } = req.body
    let tabToClose: chrome.tabs.Tab | undefined;

    if (index !== undefined) {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      // Sort by index to be safe, although query usually returns them in order.
      tabs.sort((a, b) => a.index - b.index)
      tabToClose = tabs[parseInt(index, 10)]
      if (!tabToClose) {
        throw new Error(`Tab with index ${index} not found.`)
      }
    } else {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      tabToClose = activeTab
      if (!tabToClose) {
        throw new Error("No active tab found to close.")
      }
    }

    if (!tabToClose?.id) {
       throw new Error("Could not find a tab to close.")
    }
    
    const closingTabId = tabToClose.id;
    await chrome.tabs.remove(closingTabId);
    
    console.log(`Closed tab with ID: ${closingTabId}`)
    res.send({ result: `Closed tab with ID: ${closingTabId}` })

  } catch (error) {
    console.error("Error closing tab:", error)
    res.send({ error: error.message })
  }
}

export default handler 