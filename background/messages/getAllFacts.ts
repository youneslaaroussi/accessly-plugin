import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getAllFacts as getAllFactsFromDB } from "~lib/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const facts = await getAllFactsFromDB()
    console.log(`Retrieved ${facts.length} facts.`)
    res.send({ result: facts })
  } catch (error) {
    console.error("Error retrieving all facts:", error)
    res.send({ error: error.message })
  }
}

export default handler 