const categoryModel = require("../models/categoryModel");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const restaurantModel = require("../models/restaurantModel");
const { isValidObjectId } = require("mongoose");
const {
  badRequest,
  created,
  internalServerError,
  ok,
  notFound,
} = require("../uitls/statusCodes");

const { ErrorResponse, SuccessResponse } = require("../uitls/common");
const { uploadImage } = require("./imageController");

let catImgFolder = path.join(__dirname, "..", "categoryImages");

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    let { name, description } = req.body;
    let imgData = { fileName: "", filePath: "" };
    if (req.files && req.files.imageFile) {
      const relPath = "/categoryImages/"; // Relative path for the image URL
      const saveDir = catImgFolder; // Absolute path for saving the image
      imgData = await uploadImage(req, res, relPath, saveDir); // Use the updated uploadImage function
    }

    let categoryObj = {
      name,
      description,
      category_image: imgData,
    };

    let newCategory = await categoryModel.create(categoryObj);
    SuccessResponse.data = newCategory;
    return res.status(created).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// // GET CATEGORY BY SERVICE SEARCH {allProductSearchByKeywords}
const getRestaurantByKeywords = async (req, res) => {
  try {
    let { categoryId } = req.params;
    let { search_data } = req.body;

    if (categoryId) {
      let restaurants = await restaurantModel.find({ categoryId });

      return res.status(ok).send({
        status: true,
        message: "Success",
        data: restaurants,
      });
    } else {
      let filter = {
        $or: [
          { name: { $regex: search_data, $options: "i" } },
          { description: { $regex: search_data, $options: "i" } },
          { address: { $regex: search_data, $options: "i" } },
          { city: { $regex: search_data, $options: "i" } },
          { state: { $regex: search_data, $options: "i" } },
          { isOpen: { $regex: search_data, $options: "i" } },
          { meta_title: { $regex: search_data, $options: "i" } },
          { meta_description: { $regex: search_data, $options: "i" } },
        ],
      };

      let restaurants = await restaurantModel.find(filter);

      return res.status(ok).send({
        status: true,
        message: "Success",
        data: restaurants,
      });
    }
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
  try {
    let categories = await categoryModel.find({});
    SuccessResponse.data = categories;
    return res.status(ok).send({ SuccessResponse });
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(internalServerError).send({ ErrorResponse });
  }
};

// UPDATE CATEGORY BY CATEGORY ID
const updateCategory = async (req, res) => {
  try {
    let { categoryId } = req.params;
    if (!categoryId) {
      return res
        .status(badRequest)
        .send({ status: false, message: "Category Id is required" });
    }

    if (!isValidObjectId(categoryId)) {
      return res
        .status(badRequest)
        .send({ status: false, message: "Invalid Category Id" });
    }

    let category = await categoryModel.findById(categoryId);

    if (!category) {
      return res
        .status(notFound)
        .send({ status: false, message: "Category Not Found" });
    }

    let reqBody = req.body;

    if ("name" in reqBody) {
      category.name = reqBody.name;
    }

    if ("description" in reqBody) {
      category.description = reqBody.description;
    }

    if ("imageFile" in reqBody || (req.files && req.files.imageFile)) {
      let oldImgName = category.category_image.fileName;
      if (oldImgName) {
        let oldImgPath = path.join(catImgFolder, oldImgName);
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }

      let imageFile = req.files.imageFile;
      if (!imageFile) {
        return res
          .status(badRequest)
          .send({ status: false, message: "No category images uploaded" });
      }

      let imgData = { fileName: "", filePath: "" };
      const relPath = "/categoryImages/"; // Relative path for the image URL
      const saveDir = catImgFolder; // Absolute path for saving the image
      imgData = await uploadImage(req, res, relPath, saveDir); // Use the updated uploadImage function
      category.category_image = imgData;
    }

    await category.save();

    return res.status(ok).send({
      status: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    let { categoryId } = req.params;
    if (!categoryId) {
      return res
        .status(badRequest)
        .send({ status: false, message: "CategoryId is required" });
    }

    let category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(notFound).send({
        status: false,
        message: "No category found with this category Id",
      });
    }

    let oldImgName = category.category_image.fileName;
    if (oldImgName) {
      let oldImgPath = path.join(catImgFolder, oldImgName);
      if (fs.existsSync(oldImgPath)) {
        fs.unlinkSync(oldImgPath);
      }
    }

    await categoryModel.deleteOne({ _id: categoryId });

    return res.status(ok).send({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res
      .status(internalServerError)
      .send({ status: false, message: error.message });
  }
};

// DOWNLOAD CATEGORY LIST IN A PDF FILE
const downloadCategoryListPDF1 = async (req, res, next) => {
  try {
    let catList = await categoryModel.find({});

    if (!catList || catList.length === 0) {
      return res.status(404).json({ message: "No categories found." });
    }

    const catData = catList.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      image:
        category.category_image.filePath + category.category_image.fileName,
    }));

    // Create a new PDF document
    const doc = new PDFDocument();

    // Define the file path
    const filePath = path.join(__dirname, "category-list.pdf");

    // Pipe the PDF into a writable stream to the file
    doc.pipe(fs.createWriteStream(filePath));

    // Set the title for the PDF document
    doc.fontSize(18).text("Category List", { align: "center" }).moveDown();

    // Iterate over the category data and add it to the PDF
    catData.forEach((category) => {
      doc
        .fontSize(12)
        .text(`ID: ${category._id}`)
        .text(`Name: ${category.name}`)
        .text(`Description: ${category.description}`)
        .moveDown(1);
    });

    // Finalize the PDF and end the stream
    doc.end();

    // Set headers to trigger download in the browser
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="category-list.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    // Send the file to the client
    res.download(filePath, (err) => {
      if (err) {
        next(err);
      }
      // Optionally delete the file after sending it
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const testPDF = (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", 'attachment; filename="test.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.text("This is a test PDF.", 100, 100);
    doc.end();
  } catch (error) {
    console.error(error);
  }
};

const downloadCategoryListPDF = async (req, res) => {
  try {
    let catList = await categoryModel.find({});

    if (!catList || catList.length === 0) {
      return res.status(404).json({ message: "No categories found." });
    }

    const catData = catList.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      image:
        category.category_image.filePath + category.category_image.fileName,
    }));

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers to indicate a PDF file download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="category-list.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(20).text("Category List", { align: "center" }).moveDown(2);

    catData.forEach((category, index) => {
      doc
        .fontSize(12)
        .text(`ID: ${category._id}`)
        .text(`Name: ${category.name}`)
        .text(`Description: ${category.description}`)
        .text(`Image: ${category.image}`)
        .moveDown(0.5);

      // Optionally, add an image if available
    //   if (category.image) {
    //     try {
    //       // Find the position of the last '/'
    //       let lastSlashIndex = category.image.lastIndexOf("/");
    //       // Slice the string starting from the character after the last '/'
    //       let fileName = category.image.slice(lastSlashIndex + 1);
    //       // Adjust based on how images are stored
    //       const imagePath = path.resolve(catImgFolder, fileName);
    //       if (fs.existsSync(imagePath)) {
    //         doc.image(imagePath, { width: 150 }).moveDown(1);
    //       } else {
    //         doc.text("Image not found.").moveDown(1);
    //       }
    //     } catch (imgErr) {
    //       console.error(
    //         `Error adding image for category ${category._id}:`,
    //         imgErr
    //       );
    //       doc.text("Error loading image.").moveDown(1);
    //     }
    //   }

      // Add a separator line after each category, except the last one
      if (index !== catData.length - 1) {
        doc
          .moveDown(0.5)
          .strokeColor("#aaaaaa")
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(0.5);
      }
    });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.log(error);
    return res.status(internalServerError).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  addCategory,
  getRestaurantByKeywords,
  getAllCategories,
  updateCategory,
  deleteCategory,
  downloadCategoryListPDF,
  testPDF,
};
