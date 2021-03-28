const { Requester, Validator } = require('@chainlink/external-adapter')
const { createPow, powTypes } = require("@textile/powergate-client")
const { getData, storeData } = require('./filecoinFunctions.js')
const fs = require("fs")
const host = "http://0.0.0.0:6002" // or whatever powergate instance you want
const pow = createPow({ host })
require('dotenv').config()
let addressName = process.env.FILECOIN_ADDRESS_NAME
let token = process.env.FILECOIN_TOKEN

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  cid: false,
  store: false
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const cid = validator.validated.data.cid
  const store = validator.validated.data.store || false
  let success = false
  let status = 400
  console.log("Store: ", store)
  console.log("CID: ", cid)
  let response = {}

  if (store) {
    storeData().then(cid => {
      success = true
      status = 200
      response = {}
      response.data = {}
      response.result = success
      response.cid = cid
      console.log("The stored status", success)
      response.data.result = success
      response.status = status
      console.log("Response, ", response)
      callback(status, Requester.success(jobRunID, response))
    }).catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    }
    )
  } else {
    getData(cid).then((data) => {
      console.log("Data: ", data)
      if (data != null) {
        success = true
        status = 200
        response = {}
        response.data = {}
        response.data.result = success
        response.status = status
        console.log("The stored status", success)
        callback(status, Requester.success(jobRunID, response))
      } else {
        callback(400, Requester.errored(jobRunID, response))
      }
    }).catch(error => {
      callback(400, Requester.errored(jobRunID, response))
    })
  }
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
