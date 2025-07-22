import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      throw new Error("URL is required.")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    await chrome.tabs.update(tab.id, { url })

    res.send({ result: `Navigated to ${url}` })
  } catch (error) {
    console.error("Error navigating to URL:", error)
    res.send({ error: error.message })
  }
}

export default handler 