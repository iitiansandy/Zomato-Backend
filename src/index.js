const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { port } = require("./config/config");
const { connectToDB } = require("./config/db.config");
const { errorHandler } = require("./uitls/errorHandler");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(fileUpload());
app.use(cors());

const adminRoutes = require("./routes/v1/adminRoutes");
const categoryRoutes = require('./routes/v1/categoryRoutes');
const restaurantRoutes = require("./routes/v1/restaurantRoutes");
const productRoutes = require("./routes/v1/productRoutes");
const riderRoutes = require("./routes/v1/riderRoutes");
const dashboardRoutes = require("./routes/v1/dashboardRoutes");

app.use("/customerImages", express.static(__dirname + "/customerImages"));
app.use("/restaurantImages", express.static(__dirname + "/restaurantImages"));
app.use("/riderImages", express.static(__dirname + "/riderImages"));
app.use("/productImages", express.static(__dirname + "/productImages"));
app.use("/banners", express.static(__dirname + "/banners"));
app.use("/userImages", express.static(__dirname + "/userImages"));
app.use("/categoryImages", express.static(__dirname + "/categoryImages"));

app.use("/", adminRoutes);
app.use("/", categoryRoutes);
app.use("/", restaurantRoutes);
app.use("/", riderRoutes);
app.use("/", productRoutes);
app.use("/", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Delivery App is Up and Running</h1>");
});

// Last middleware if any error comes
app.use(errorHandler);

app.listen(port, async () => {
  console.log("Server is running at port", port);

  await connectToDB();
  console.log("Database connected");
});
