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


// getData('QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4')

// // Set the admin auth token if required.
// // pow.setAdminToken("password")
// async function newAddress() {
//     const { address } = await pow.wallet.newAddress("PatrickAlphaC")
//     return address
// }



// async function createToken() {
//     newAddress().then(async () => {
//         const { user } = await pow.admin.users.create() // save this token for later use!
//         // console.log(user)
//         return user
//     })
// }

// let token = process.env.FILECOIN_TOKEN
// console.log(token)
// // run this when you want to get a token
// if (typeof token === 'undefined') {
//     createToken().then((_token) => {
//         token = _token.token
//         console.log(token)
//     })
// }
async function alreadyStored(cid) {
    let data = await getData(cid)
    if (data != null) {
        return true
    }
    return false
}

const storeData = async () => {
    await setPow()
    const buffer = fs.readFileSync(`data.json`)
    const { cid } = await pow.data.stage(buffer)
    dataAlreadyStored = await alreadyStored(cid)
    if (dataAlreadyStored) {
        console.log('Already stored!')
    } else {
        console.log("Storing data!")
        const { jobId } = await pow.storageConfig.apply(cid)
        const jobsCancel = pow.storageJobs.watch((job) => {
            console.log(job)
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
        logsCancel()
    }
}

// const main = async () => {
//     let data = await getData('QmbNCVEkrFXHZyX23NtXx36pKXKeb4qwWFmMPv6JMDDBBF')
//     console.log(data)
//     // formattedData = JSON.parse(JSON.stringify(data))
//     // await storeData()
//     // console.log(formattedData)
//     return
// }

// main()



// // // async function info() {
// // //     console.log(await pow.data.cidInfo('QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4'))
// // // }
// // //info()

// // // QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4
// async function getData(cid) {
//     // get information about the latest applied storage configuration,
//     // current storage state, and all related Powegate storage jobs
//     const { cidInfo } = await pow.data.cidInfo(cid)
//     // log(cid)
//     // retrieve data stored in the user by cid
//     const bytes = await pow.data.get(cid)
//     //console.log(bytes)
//     return bytes
// }

// async function checkCID() {
//     let cid = 'QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4'
//     // const { cidInfo } = await pow.data.cidInfo(cid)
//     console.log(cid)
// }

// checkCID()

// async function makeDeal() {
//     // get wallet addresses associated with the user
//     const { addressesList } = await pow.wallet.addresses()

//     // create a new address associated with the user
//     // const { address } = await pow.wallet.newAddress("PatrickAlphaC")

//     // get build information about the powergate server
//     const res = await pow.buildInfo()

//     // cache data in IPFS in preparation to store it
//     const buffer = fs.readFileSync(`./test.json`)
//     // console.log(buffer)
//     const { cid } = await pow.data.stage(buffer)

//     // store the data using the default storage configuration
//     const { jobId } = await pow.storageConfig.apply(cid)
//     // console.log('JOOOOOBBBIIIIDDDDDD')
//     // console.log(jobId)

//     // watch the job status to see the storage process progressing
//     const jobsCancel = pow.storageJobs.watch((job) => {
//         console.log(job)
//         if (job.status === powTypes.JobStatus.JOB_STATUS_CANCELED) {
//             console.log("job canceled")
//         } else if (job.status === powTypes.JobStatus.JOB_STATUS_FAILED) {
//             console.log("job failed")
//         } else if (job.status === powTypes.JobStatus.JOB_STATUS_SUCCESS) {
//             console.log("job success!")
//         }
//     }, jobId)

//     // watch all log events for a cid
//     const logsCancel = pow.data.watchLogs((logEvent) => {
//         console.log(`received event for cid ${logEvent.cid}`)
//     }, cid)

//     //getData(cid)
//     //console.log(cid)

//     // send FIL from an address managed by the user to any other address
//     await pow.wallet.sendFil(addressesList[0].address, "<some other address>", BigInt(1000))
//     return
// }

// getData('QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4').then((data) => {
//     console.log(JSON.parse(JSON.stringify(data)))
//     console.log(JSON.parse(JSON.stringify(data)))
//     console.log(data)
// })

// makeDeal()
// // getData('QmbPtv1C6QeoAS83neVE8SHfrsVPUnA79zm8kfPfFC2Un4')
// // pow data log Qme4BtB94mrLQ5zxwL7aXhkHFMGwBonSTKHgAeP7ETnk9L -t 8a8bad22-b5fe-42ab-913f-6a1b78fd60eb 
// // gets the logs on a deal


// // buckets is to push data to remote IPFS peers
// // hub buck archive default-config
