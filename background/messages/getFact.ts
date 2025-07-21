import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getFact as getFactFromDB } from "~lib/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { key } = req.body

    if (!key) {
      throw new Error("Key is required.")
    }

    const value = await getFactFromDB(key)

    if (value !== null) {
      console.log(`Retrieved fact with key: ${key}`)
      res.send({ result: value })
    } else {
      res.send({ result: `No fact found for key: ${key}` })
    }
  } catch (error) {
    console.error("Error retrieving fact:", error)
    res.send({ error: error.message })
  }
}

export default handler 