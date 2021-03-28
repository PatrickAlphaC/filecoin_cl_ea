// docker run --name texlocalnet -e TEXLOTUSDEVNET_SPEED=1500 -e TEXLOTUSDEVNET_BIGSECTORS=true -p 1234:7777 -v /tmp/import:/tmp/import textile/lotus-devnet
// make localnet
const { createPow, powTypes } = require("@textile/powergate-client")
const fs = require("fs")
require('dotenv').config()

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want
const pow = createPow({ host })
let addressName = process.env.FILECOIN_ADDRESS_NAME
let token = process.env.FILECOIN_TOKEN



async function setPow() {
    if (token == null) {
        const { user } = await pow.admin.users.create()
        token = user.token
        console.log("New Token! ", token)
        pow.setToken(token)
    }
    if (addressName == null) {
        const { address } = await pow.wallet.newAddress('SampleAddress')
        console.log("New user!", address)
    }
    pow.setToken(token)
}

const getData = async (cid) => {
    await setPow()
    let bytes
    const res = await pow.buildInfo()
    try {
        bytes = await pow.data.get(cid)
    } catch (err) {
        return null
    }
    return bytes
}


async function alreadyStored(cid) {
    let data = await getData(cid)
    if (data != null) {
        return true
    }
    return false
}

// watch all log events for a cid
const logsCancel = (cid) => {
    pow.data.watchLogs((logEvent) => {
        console.log(`received event for cid ${logEvent.cid}`)
    }, cid)
}

const storeData = async () => {
    await setPow()
    const buffer = fs.readFileSync(`data.json`)
    const { cid } = await pow.data.stage(buffer)
    dataAlreadyStored = await alreadyStored(cid)
    if (dataAlreadyStored) {
        console.log('Already stored!')
        return cid
    } else {
        console.log("Storing data!")
        const { jobId } = await pow.storageConfig.apply(cid)
        await pow.storageJobs.watch(async (job) => {
            console.log(job)
            if (job.status === powTypes.JobStatus.JOB_STATUS_CANCELED) {
                console.log("job canceled")
                return null
            } else if (job.status === powTypes.JobStatus.JOB_STATUS_FAILED) {
                console.log("job failed")
                return null
            } else if (job.status === powTypes.JobStatus.JOB_STATUS_SUCCESS) {
                console.log("job success!")
                return cid
            }
        }, jobId)
    }
    return null
}

module.exports = {
    getData,
    storeData,
    setPow
}
