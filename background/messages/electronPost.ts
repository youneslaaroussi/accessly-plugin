import type { PlasmoMessaging } from "@plasmohq/messaging"
import { electronComm } from "~lib/electronComm"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronPost handler called with:", req.body)
    
    const { endpoint, data } = req.body
    
    if (!endpoint) {
      throw new Error("Endpoint is required")
    }
    
    // Post data to Electron app
    const response = await electronComm.postData(endpoint, data)
    
    if (response.success) {
      console.log("✅ Data posted to Electron app successfully")
      res.send({ 
        result: "Data posted successfully",
        response: response.data
      })
    } else {
      console.log("❌ Failed to post data to Electron app:", response.error)
      res.send({ 
        error: response.error || "Failed to post data"
      })
    }
  } catch (error) {
    console.error("Error posting data to Electron app:", error)
    res.send({ error: error.message })
  }
}

export default handler 