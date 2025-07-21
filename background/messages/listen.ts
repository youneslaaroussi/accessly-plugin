import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("listen handler called with params:", req.body)
    
    const { seconds } = req.body
    const duration = parseInt(seconds) || 5 // Default to 5 seconds
    
    if (duration <= 0 || duration > 300) { // Max 5 minutes
      throw new Error("Duration must be between 1 and 300 seconds")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    // Capture tab audio
    const stream = await new Promise<MediaStream>((resolve, reject) => {
      chrome.tabCapture.capture({ audio: true }, (capturedStream) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else if (capturedStream) {
          resolve(capturedStream)
        } else {
          reject(new Error("Failed to capture audio"))
        }
      })
    })
    
    // Create MediaRecorder to record the stream
    const mediaRecorder = new MediaRecorder(stream)
    const audioChunks: Blob[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }
    
    // Start recording
    mediaRecorder.start()
    console.log(`Started recording audio for ${duration} seconds`)
    
    // Stop recording after specified duration
    setTimeout(() => {
      mediaRecorder.stop()
      stream.getTracks().forEach(track => track.stop()) // Clean up
    }, duration * 1000)
    
    // Wait for recording to complete
    const audioBlob = await new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' })
        resolve(blob)
      }
    })
    
    // Convert blob to data URL for playback
    const reader = new FileReader()
    const audioDataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(audioBlob)
    })
    
    console.log(`Audio recording completed: ${audioBlob.size} bytes`)
    
    res.send({ 
      result: audioDataUrl,
      duration: duration,
      size: audioBlob.size 
    })
  } catch (error) {
    console.error("Error capturing audio:", error)
    res.send({ error: error.message })
  }
}

export default handler 