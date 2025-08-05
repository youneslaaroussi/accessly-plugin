import type { PlasmoMessaging } from "@plasmohq/messaging"
import { electronComm } from "~lib/electronComm"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronSend handler called with:", req.body)
    
    const { type, data } = req.body
    
    if (!type) {
      throw new Error("Message type is required")
    }
    
    // Send message to Electron app
    const response = await electronComm.sendMessage(type, data)
    
    if (response.success) {
      console.log("✅ Message sent to Electron app successfully")
      res.send({ 
        result: "Message sent successfully",
        response: response.data
      })
    } else {
      console.log("❌ Failed to send message to Electron app:", response.error)
      res.send({ 
        error: response.error || "Failed to send message"
      })
    }
  } catch (error) {
    console.error("Error sending message to Electron app:", error)
    res.send({ error: error.message })
  }
}

export default handler 