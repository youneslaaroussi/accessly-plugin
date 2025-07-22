import type { PlasmoMessaging } from "@plasmohq/messaging"
import { electronComm } from "~lib/electronComm"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronConnect handler called")
    
    // Check if Electron app is connected
    const isConnected = await electronComm.isConnected()
    
    if (isConnected) {
      console.log("✅ Successfully connected to Electron app")
      res.send({ 
        result: "Connected to Electron app",
        connected: true 
      })
    } else {
      console.log("❌ Cannot connect to Electron app")
      res.send({ 
        result: "Electron app not responding",
        connected: false 
      })
    }
  } catch (error) {
    console.error("Error connecting to Electron app:", error)
    res.send({ 
      error: error.message,
      connected: false 
    })
  }
}

export default handler 