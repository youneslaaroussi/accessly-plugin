import type { PlasmoMessaging } from "@plasmohq/messaging"
import { storeFact as storeFactInDB } from "~lib/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { key, value } = req.body

    if (!key) {
      throw new Error("Key is required.")
    }

    if (value === undefined) {
      throw new Error("Value is required.")
    }

    await storeFactInDB(key, value)

    console.log(`Stored fact with key: ${key}`)
    res.send({ result: `Stored fact with key: ${key}` })
  } catch (error) {
    console.error("Error storing fact:", error)
    res.send({ error: error.message })
  }
}

export default handler 