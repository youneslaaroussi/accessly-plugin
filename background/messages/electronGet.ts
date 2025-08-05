import type { PlasmoMessaging } from "@plasmohq/messaging"
import { electronComm } from "~lib/electronComm"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronGet handler called with:", req.body)
    
    const { endpoint } = req.body
    
    if (!endpoint) {
      throw new Error("Endpoint is required")
    }
    
    // Get data from Electron app
    const response = await electronComm.getData(endpoint)
    
    if (response.success) {
      console.log("✅ Data retrieved from Electron app successfully")
      res.send({ 
        result: "Data retrieved successfully",
        data: response.data
      })
    } else {
      console.log("❌ Failed to get data from Electron app:", response.error)
      res.send({ 
        error: response.error || "Failed to get data"
      })
    }
  } catch (error) {
    console.error("Error getting data from Electron app:", error)
    res.send({ error: error.message })
  }
}

export default handler 