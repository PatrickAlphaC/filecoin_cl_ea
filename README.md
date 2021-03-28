# Chainlink NodeJS Filecoin EA Proof-of-concept

Send and get data from your Filecoin node from/into your smart contracts.

## TODO

- Write tests
- Make parameters easier

Prerequisites:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Golang](https://golang.org/)


### Before you get started...

After you tear down docker containers, remember to run `docker system prune` so that it doesn't take up a ton of space and you won't hit naming conflicts. 
## Getting started

1. Install Powergate

[Powergate](https://docs.textile.io/powergate/) is an API wrapped around a [Filecoin](https://docs.filecoin.io/) node (also known as Lotus nodes), and it makes it easier to get/send data. Filecoin doesn't have APIs built-in to create deals, so Powergate makes APIs availible so we can call the Filecoin node to get or store data. 

You need to [follow the Powergate docs](https://docs.textile.io/powergate/localnet/) to install powergate, and we need to start up a `localnet`. A `localnet` is filecoin's syntax for a local filecoin blockchain. 

An easy way to do this is with: 
```
git clone git@github.com:textileio/powergate.git
cd powergate/docker
```

2. Start the localnetwork

Run `make localnet` in the `/docker` folder of `git@github.com:textileio/powergate.git`.
Then wait for a few minutes. 

When complete, you'll have a fully functional Powergate (powd), a Lotus localnet, and an IPFS node wired together to start using.

3. Add the lotus API

Our example needs to use the Lotus API to work with. So we need to spin up a container for that. You can follow the [powergate documentation](https://docs.textile.io/powergate/localnet/#localnet-with-lotus-client) or run:

```
docker run --name texlocalnet -e TEXLOTUSDEVNET_SPEED=1500 -e TEXLOTUSDEVNET_BIGSECTORS=true -p 1234:7777 -v /tmp/import:/tmp/import textile/lotus-devnet
```

Now you're ready to start making requests. 

4. Install this package, and start the external adapter

```
git clone https://github.com/PatrickAlphaC/filecoin_cl_ea
cd filecoin_cl_ea
yarn
```

5. Set token ID and address

In the `filecoinFunctions.js` there is a method called `setPow`. We need to set the powergate address and token ID. Run:

```
node setPow.js
```
And add the token that is outputted to the `.env` file. So your `.env` will look something like this:

```
FILECOIN_TOKEN=c8d9948c-daed-48ce-9850-a01e7b65062c
FILECOIN_ADDRESS_NAME=SampleAddress
```

Then start the server with:

``` 
yarn start
```

6. Get data or storedata

Now you can make curls to store data or data data from this instance. You can store whatever is in `data.json` keep in mind these have to be large files.

```
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"store":"true"}}'
```
When storing data, we have to wait some time before the data is "sealed". This is much faster when working with a localnet, and can takes days on filecoin mainnet. 

Or get data stored on a filecoin node based on its CID:

```
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"cid":"QmbNCVEkrFXHZyX23NtXx36pKXKeb4qwWFmMPv6JMDDBBF"}}'
```
