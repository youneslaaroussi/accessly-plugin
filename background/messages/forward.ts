import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.id) {
      await chrome.tabs.goForward(tab.id)
      console.log(`Navigated forward in tab: ${tab.id}`)
      res.send({ result: "Navigated forward" })
    } else {
      throw new Error("No active tab found.")
    }
  } catch (error) {
    console.error("Error navigating forward:", error)
    res.send({ error: error.message })
  }
}

export default handler 