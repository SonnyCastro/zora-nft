import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { Wallet } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import { Form } from "react-bootstrap";
import axios from "axios";

// import { pinTrackToIPFS } from "../lib/uploadFile";
// require("dotenv").config();
import {
  constructMediaData,
  sha256FromBuffer,
  generateMetadata,
  isMediaDataVerified,
  Zora,
  constructBidShares,
} from "@zoralabs/zdk";
import { ethers } from "ethers";
// import { addresses } from "@zoralabs/sdk";

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;
// const rinkebyMedia = addresses["rinkeby"].media;
// const rinkebyMarket = addresses["rinkeby"].market;

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [minted, setMinted] = useState(0);
  const [currentNetwork, setCurrentNetwork] = useState(0);
  const [zoraInstance, setZoraInstance] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("");
  const [track, setTrack] = useState("");

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      let wallet = new ethers.Wallet(privatekey, provider);
      setCurrentAccount(wallet.address);
      const zora = new Zora(wallet, 4);
      setZoraInstance(zora);
      console.log(zora);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      // setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const mintZNFT = async () => {
    console.log(zoraInstance);

    const metadataJSON = generateMetadata("zora-20210604", {
      description: "Testing metaData",
      mimeType: "image/jpeg",
      name: ".eth",
      version: "zora-20210604",
      image:
        "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
      animation_url:
        "https://ipfs.io/ipfs/QmfTM8uEN9xbkC7uutU64EXG9gQLBLkeF6cwC47bqhgsfv",
      // attributes: [
      //   { trait_type: "Base", value: "Starfish" },
      //   { trait_type: "Eyes", value: "Big" },
      // ],
    });

    console.log(metadataJSON);

    const contentHash = sha256FromBuffer(
      Buffer.from(
        "https://ipfs.io/ipfs/QmfTM8uEN9xbkC7uutU64EXG9gQLBLkeF6cwC47bqhgsfv"
      )
    );
    const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));
    const contentURI =
      "https://ipfs.io/ipfs/QmfTM8uEN9xbkC7uutU64EXG9gQLBLkeF6cwC47bqhgsfv";
    const metaDataURI =
      "https://ipfs.io/ipfs/QmQYAo6xSABjVuHp5MoR6vzJ9J5yZGLDWhFePKTNZp4xHU";

    const mediaData = constructMediaData(
      contentURI,
      metaDataURI,
      contentHash,
      metadataHash
    );

    console.log(mediaData);

    // Verifies hashes of content to ensure the hashes match
    // const verified = await isMediaDataVerified(mediaData);
    // if (!verified) {
    //   throw new Error("MediaData not valid, do not mint");
    // }

    // BidShares should sum up to 100%
    const bidShares = constructBidShares(
      10, // creator share percentage
      90, // owner share percentage
      0 // prevOwner share percentage
    );
    const tx = await zoraInstance.mint(mediaData, bidShares);
    console.log(mediaData);
    console.log(tx);
    console.log(tx.hash);
    return new Promise((resolve) => {
      // This listens for the nft transfer event
      zoraInstance.media.on("Transfer", (from, to, tokenId) => {
        if (
          from === "0x0000000000000000000000000000000000000000" &&
          to === tx.from.address
        ) {
          promise.resolve(tokenId);
        }
      });
    });
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  );

  const renderMintUI = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button onClick={mintZNFT}>mint</button>
    </div>
  );

  // function handleSubmit(track) {
  //   try {
  //     axios.post("/api/upload", track);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const handleSubmit = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3000/api/upload", {
  //       method: "POST",
  //       body: JSON.stringify({ track }),
  //       headers: {
  //         // "Content-Type": "application/json",
  //         // pinata_api_key: pinataApiKey,/
  //         // pinata_secret_api_key: pinataSecretApiKey,
  //       },
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <p>Wallet connected to: {currentAccount}</p>
        {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}

        <form method="post" action="/api/upload">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="name"
              className="form-control"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              className="form-control"
              id="desc"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="description"
            />
          </div>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Insert File</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                // console.log(e.target.value);
                // setType(e.target.files[0].type);
                setTrack(e.target.files[0]);
              }}
            />
          </Form.Group>
          <button
            type="submit"
            // onClick={handleSubmit()}
            className="btn btn-primary"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
