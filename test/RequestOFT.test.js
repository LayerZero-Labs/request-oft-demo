const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils, constants } = require("ethers")

describe("Request OFT", function () {
    const ethereumChainId = 1
    const polygonChainId = 2
    const amount = utils.parseEther("10")
    const name = "TEST"
    const symbol = "TEST"

    let owner, user, userAddressBytes32
    let tokenRequester, tokenSender
    let ethereumOft, polygonOft

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners()
        userAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [user.address])

        const endpointFactory = await ethers.getContractFactory("LZEndpointMock")
        const ethereumEndpoint = await endpointFactory.deploy(ethereumChainId)
        const polygonEndpoint = await endpointFactory.deploy(polygonChainId)

        const oftFactory = await ethers.getContractFactory("OFT")
        ethereumOft = await oftFactory.deploy(name, symbol, ethereumEndpoint.address)

        const mintableOftFactory = await ethers.getContractFactory("MintableOFT")
        polygonOft = await mintableOftFactory.deploy(name, symbol, polygonEndpoint.address)

        const tokenRequesterFactory = await ethers.getContractFactory("TokenRequester")
        tokenRequester = await tokenRequesterFactory.deploy(ethereumEndpoint.address)

        const tokenSenderFactory = await ethers.getContractFactory("TokenSender")
        tokenSender = await tokenSenderFactory.deploy(polygonEndpoint.address, polygonOft.address)

        // internal bookkeeping for endpoints (not part of a real deploy, just for this test)
        await ethereumEndpoint.setDestLzEndpoint(polygonOft.address, polygonEndpoint.address)
        await polygonEndpoint.setDestLzEndpoint(ethereumOft.address, ethereumEndpoint.address)
        await ethereumEndpoint.setDestLzEndpoint(tokenSender.address, polygonEndpoint.address)
        await polygonEndpoint.setDestLzEndpoint(tokenRequester.address, ethereumEndpoint.address)

        await ethereumOft.setTrustedRemoteAddress(polygonChainId, polygonOft.address)
        await polygonOft.setTrustedRemoteAddress(ethereumChainId, ethereumOft.address)
        await tokenSender.setTrustedRemoteAddress(ethereumChainId, tokenRequester.address)
        await tokenRequester.setTrustedRemoteAddress(polygonChainId, tokenSender.address)

        await polygonOft.transfer(tokenSender.address, amount)
    })

    it("sends message to Polygon and bridges OFT to Ethereum", async () => {
        // use default 200000 gas
        const callbackAdapterParams = "0x"

        // estimate fees for bridging OFT from Polygon to Ethereum
        const oftSendFee = (await polygonOft.estimateSendFee(ethereumChainId, userAddressBytes32, amount, false, callbackAdapterParams)).nativeFee

        // use adapter parameters V2 passing nativeFee as airdrop on destination
        const adapterParams = ethers.utils.solidityPack(["uint16", "uint", "uint", "address"], [2, 250000, oftSendFee, tokenSender.address])

        const requestOftFee = (await tokenRequester.estimateFees(polygonChainId, adapterParams, callbackAdapterParams)).nativeFee

        expect(await ethereumOft.balanceOf(user.address)).to.be.eq(0)
        expect(await polygonOft.balanceOf(tokenSender.address)).to.be.eq(amount)

        await tokenRequester.requestTokens(user.address, amount, polygonChainId, owner.address, adapterParams, callbackAdapterParams, { value: requestOftFee })

        expect(await ethereumOft.balanceOf(user.address)).to.be.eq(amount)
        expect(await polygonOft.balanceOf(tokenSender.address)).to.be.eq(0)
    })
})
