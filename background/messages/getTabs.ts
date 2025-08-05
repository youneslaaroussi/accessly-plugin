import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // Get all tabs in all windows
    const tabs = await chrome.tabs.query({})
    
    // Format tab information for response
    const tabsInfo = tabs.map((tab, index) => ({
      id: tab.id,
      index: tab.index,
      title: tab.title || 'Untitled',
      url: tab.url || '',
      active: tab.active,
      windowId: tab.windowId,
      favIconUrl: tab.favIconUrl || ''
    }))

    console.log(`Found ${tabsInfo.length} open tabs`)
    res.send({ 
      result: `Found ${tabsInfo.length} open tabs`,
      tabs: tabsInfo
    })

  } catch (error) {
    console.error("Error getting tabs:", error)
    res.send({ error: error.message })
  }
}

export default handler