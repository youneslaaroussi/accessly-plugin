import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.id) {
      await chrome.tabs.goBack(tab.id)
      console.log(`Navigated back in tab: ${tab.id}`)
      res.send({ result: "Navigated back" })
    } else {
      throw new Error("No active tab found.")
    }
  } catch (error) {
    console.error("Error navigating back:", error)
    res.send({ error: error.message })
  }
}

export default handler 