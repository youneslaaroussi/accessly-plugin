import type { PlasmoMessaging } from "@plasmohq/messaging"
import { electronComm } from "~lib/electronComm"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronTest handler called - running communication tests")
    
    const results = []
    
    // Test 1: Check connection
    console.log("🔍 Testing connection...")
    const isConnected = await electronComm.isConnected()
    results.push({
      test: "connection",
      success: isConnected,
      message: isConnected ? "Connected successfully" : "Connection failed"
    })
    
    if (!isConnected) {
      res.send({ 
        result: "Electron app communication tests",
        tests: results,
        overall: false,
        message: "Cannot connect to Electron app. Make sure it's running on port 3001."
      })
      return
    }
    
    // Test 2: Send greeting message
    console.log("📨 Testing message sending...")
    try {
      const greetingResponse = await electronComm.sendMessage("greeting", {
        from: "chrome-extension",
        timestamp: Date.now()
      })
      results.push({
        test: "send_message",
        success: greetingResponse.success,
        message: greetingResponse.success ? "Message sent successfully" : greetingResponse.error,
        data: greetingResponse.data
      })
    } catch (error) {
      results.push({
        test: "send_message",
        success: false,
        message: error.message
      })
    }
    
    // Test 3: Get settings data
    console.log("📥 Testing data retrieval...")
    try {
      const settingsResponse = await electronComm.getData("/settings")
      results.push({
        test: "get_data",
        success: settingsResponse.success,
        message: settingsResponse.success ? "Data retrieved successfully" : settingsResponse.error,
        data: settingsResponse.data
      })
    } catch (error) {
      results.push({
        test: "get_data",
        success: false,
        message: error.message
      })
    }
    
    // Test 4: Post test data
    console.log("📤 Testing data posting...")
    try {
      const testData = {
        test: true,
        timestamp: Date.now(),
        source: "chrome-extension-test"
      }
      const postResponse = await electronComm.postData("/data", testData)
      results.push({
        test: "post_data",
        success: postResponse.success,
        message: postResponse.success ? "Data posted successfully" : postResponse.error,
        data: postResponse.data
      })
    } catch (error) {
      results.push({
        test: "post_data",
        success: false,
        message: error.message
      })
    }
    
    // Test 5: Get status
    console.log("📊 Testing status endpoint...")
    try {
      const statusResponse = await electronComm.getData("/status")
      results.push({
        test: "get_status",
        success: statusResponse.success,
        message: statusResponse.success ? "Status retrieved successfully" : statusResponse.error,
        data: statusResponse.data
      })
    } catch (error) {
      results.push({
        test: "get_status",
        success: false,
        message: error.message
      })
    }
    
    const successCount = results.filter(r => r.success).length
    const totalTests = results.length
    const allPassed = successCount === totalTests
    
    console.log(`✅ Tests completed: ${successCount}/${totalTests} passed`)
    
    res.send({
      result: "Electron app communication tests completed",
      tests: results,
      summary: {
        total: totalTests,
        passed: successCount,
        failed: totalTests - successCount,
        success_rate: `${Math.round((successCount / totalTests) * 100)}%`
      },
      overall: allPassed,
      message: allPassed 
        ? "All tests passed! Communication is working perfectly." 
        : `${successCount}/${totalTests} tests passed. Check failed tests for issues.`
    })
    
  } catch (error) {
    console.error("Error running Electron communication tests:", error)
    res.send({ 
      error: error.message,
      message: "Failed to run communication tests"
    })
  }
}

export default handler 