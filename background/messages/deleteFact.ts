import type { PlasmoMessaging } from "@plasmohq/messaging"
import { deleteFact as deleteFactFromDB } from "~lib/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { key } = req.body

    if (!key) {
      throw new Error("Key is required.")
    }

    await deleteFactFromDB(key)

    console.log(`Deleted fact with key: ${key}`)
    res.send({ result: `Deleted fact with key: ${key}` })
  } catch (error) {
    console.error("Error deleting fact:", error)
    res.send({ error: error.message })
  }
}

export default handler 