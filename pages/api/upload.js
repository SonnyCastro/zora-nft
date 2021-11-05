require("dotenv").config();
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

export default function handler(req, res) {
  debugger
  console.log("this is req.body", req.body.track);
  if (req.method === "GET") {
    res.status(200).json({ name: "Son" });
  } else if (req.method === "POST") {
    console.log("post success", req.body.track); // equals to track path
    pinTrackToIPFS(req.body.track);
    // pinTrackToIPFS('./africa.mp3');
  }
  res.status(201).json(req);
}

const pinTrackToIPFS = async (track) => {
  console.log("this is the track on the server", track)
  let data = new FormData();
  data.append("file", fs.createReadStream(track));

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  axios
    .post(url, data, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then((res) => console.log(res));

  // res.status(200).json({ track res });
};

// const pinMetadataToIPFS = async (metadata) => {
//   const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
//   const res = await axios.post(url, data, {
//     maxContentLength: "Infinity",
//     headers: {
//       "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
//       pinata_api_key: pinataApiKey,
//       pinata_secret_api_key: pinataSecretApiKey,
//     },
//   });
//   console.log(res.data);
//   return res.data;
// };
