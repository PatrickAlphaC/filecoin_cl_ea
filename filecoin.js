const { createPow, powTypes } = require("@textile/powergate-client")
const fs = require("fs")

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want
const pow = createPow({ host })
// Set the admin auth token if required.
// pow.setAdminToken("password")

// run this when you want to get a token
async function createToken() {
    const { user } = await pow.admin.users.create() // save this token for later use!
    console.log(user)
    return user
}

async function newAddress() {
    const { address } = await pow.wallet.newAddress("PatrickAlphaC")
    return address
}

// createToken()
// {
//  id: '1abdf611-d8f3-49a7-b609-1ec8ca6ff14c',
//  token: '8a8bad22-b5fe-42ab-913f-6a1b78fd60eb'
//}
const token = '8a8bad22-b5fe-42ab-913f-6a1b78fd60eb'
pow.setToken(token)

async function getData(cid) {
    // get information about the latest applied storage configuration,
    // current storage state, and all related Powegate storage jobs
    const { cidInfo } = await pow.data.cidInfo(cid)
    console.log(cid)

    // retrieve data stored in the user by cid
    const bytes = await pow.data.get(cid)
    console.log(bytes)
    return bytes
}

async function makeDeal() {
    // get wallet addresses associated with the user
    const { addressesList } = await pow.wallet.addresses()

    // create a new address associated with the user
    // const { address } = await pow.wallet.newAddress("PatrickAlphaC")

    // get build information about the powergate server
    const res = await pow.buildInfo()

    // cache data in IPFS in preparation to store it
    const buffer = fs.readFileSync(`./test.json`)
    console.log(buffer)
    const { cid } = await pow.data.stage(buffer)

    // store the data using the default storage configuration
    const { jobId } = await pow.storageConfig.apply(cid)

    // watch the job status to see the storage process progressing
    const jobsCancel = pow.storageJobs.watch((job) => {
        if (job.status === powTypes.JobStatus.JOB_STATUS_CANCELED) {
            console.log("job canceled")
        } else if (job.status === powTypes.JobStatus.JOB_STATUS_FAILED) {
            console.log("job failed")
        } else if (job.status === powTypes.JobStatus.JOB_STATUS_SUCCESS) {
            console.log("job success!")
        }
    }, jobId)

    // watch all log events for a cid
    const logsCancel = pow.data.watchLogs((logEvent) => {
        console.log(`received event for cid ${logEvent.cid}`)
    }, cid)

    getData(cid)
    console.log(cid)

    // send FIL from an address managed by the user to any other address
    await pow.wallet.sendFil(addressesList[0].address, "<some other address>", BigInt(1000))
}
makeDeal()
// getData()
