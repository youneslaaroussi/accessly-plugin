// This file centralizes all tool handlers for easy access.
import type { PlasmoMessaging } from "@plasmohq/messaging"

import back from "./back"
import captureHTML from "./captureHTML"
import capturePage from "./capturePage"
import clickAt from "./clickAt"
import closeTab from "./closeTab"
import deleteFact from "./deleteFact"
import forward from "./forward"
import getAllFacts from "./getAllFacts"
import getFact from "./getFact"
import goTo from "./goTo"
import highlight from "./highlight"
import listen from "./listen"
import reload from "./reload"
import scrollBy from "./scrollBy"
import scrollIntoView from "./scrollIntoView"
import scrollPage from "./scrollPage"
import scrollTo from "./scrollTo"
import storeFact from "./storeFact"
import waitForSelector from "./waitForSelector"

export const toolHandlers: { [key: string]: PlasmoMessaging.MessageHandler } = {
  back,
  captureHTML,
  capturePage,
  clickAt,
  closeTab,
  deleteFact,
  forward,
  getAllFacts,
  getFact,
  goTo,
  highlight,
  listen,
  reload,
  scrollBy,
  scrollIntoView,
  scrollPage,
  scrollTo,
  storeFact,
  waitForSelector
}

export default toolHandlers 