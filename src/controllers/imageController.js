let { getCurrentIPAddress } = require("../uitls/utils");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port } = require("../config/config");

const { badRequest, internalServerError } = require('../uitls/statusCodes');

async function uploadImage(req, res, relPath, saveDir) {
    try {
      const imageFile = req.files?.imageFile;
      if (!imageFile) {
        return res.status(badRequest).send({ status: false, message: "No image uploaded" });
      }
  
      // Create the directory if it doesn't exist
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }
  
      // Generate a unique name for the image
      let fileName = uuid.v4() + "." + imageFile.name.split(".").pop();
  
      // Build the file URL and saving path
      let currentIpAddress = getCurrentIPAddress();
      let filePath = `http://${currentIpAddress}:${port}${relPath}`;
      let imgSavingPath = path.join(saveDir, fileName);
  
      // Move the file to the designated path
      await imageFile.mv(imgSavingPath);
      let imgObj = { fileName, filePath };
      // Return the file details
      return imgObj;
    } catch (error) {
      return res.status(internalServerError).send({ status: false, message: error.message });
    }
};


module.exports = { uploadImage };