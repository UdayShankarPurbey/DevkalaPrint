import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns"; 
import Order from "./models/Order.js";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; 
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";
import Razorpay from "razorpay";
import puppeteer from "puppeteer";
import * as QRCode from "qrcode";
import path from "path";
import trackOrderRoutes from "./routes/trackOrder.js"; 
import nodemailer from "nodemailer";



//Change DNS
dns.setServers(["1.1.1.1","8.8.8.8"])

dotenv.config();

const app = express();


// MIDDLEWARE
app.use(cors());
app.use(express.json()); 

app.use(
  "/api/orders/track",
  trackOrderRoutes
);

app.use(
  "/uploads",
  express.static("uploads")
);


//MAIL TRANSPORTER
const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,

    },

});


// CLOUDINARY CONFIG
cloudinary.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

});  


const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "orders",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],

    public_id: (req, file) => {
      return Date.now() + "-" + file.originalname;
    },
  },
});

console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);

//Create Razorpay Instance 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});




app.post("/api/payment/create-order", async (req, res) => {

  try {

    const { amount } = req.body;

    const options = {
      // Razorpay needs an integer paise value; round to avoid
      // floating-point amounts (e.g. 100.98 * 100 = 10097.999...).
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Payment Order Failed",
    });

  }

});


const upload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

});

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
})
.catch((error) => {
  console.log("❌ MongoDB Connection Failed");
  console.log(error);
});


// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running");
});


// SIGNUP API
app.post("/api/signup", async (req, res) => {

  try {

     console.log(req.body);
    const {
      name,
      email,
      mobile,
      password,
    } = req.body;

    // CHECK USER
    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {

      return res.status(400).json({
        message:
          "Email already exists",
      });

    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE USER
    const newUser = new User({

      name,
      email,
      mobile,

      password:
        hashedPassword,

    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message:
        "Signup Successful",
    });

  } catch (error) {

    console.log(error);

    console.log("FULL ERROR:");
console.log(error);

res.status(500).json({
  success: false,
  message: error.message,
});

  }

});

// LOGIN API
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } =
      req.body;

    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const user =
      await User.findOne({ email });

    console.log("USER FROM DB:", user);

    if(user){
      console.log(
        "DB PASSWORD:",
        user.password
      );
    }

    if (!user) {

      return res.status(400).json({
        message: "User not found",
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      isMatch
    );

    if (!isMatch) {

      return res.status(400).json({
        message:
          "Invalid Email or Password",
      });

    }

    res.json({
  success: true,
  message: "Login Success",

  user: {
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  },
});

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

});

// SAVE ORDER ROUTE
app.post(

  "/api/orders",

  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),

  async (req, res) => {

    try {

      console.log("BODY:");
      console.log(req.body);

      console.log("FILES:");
      console.log(req.files);

      const frontImage =
        req.files?.frontImage?.[0]?.path;

      const backImage =
        req.files?.backImage?.[0]?.path;

      // FRONT IMAGE REQUIRED

        if (!frontImage) {

          return res.status(400).json({
            success: false,
            message: "Front image required",
          });

        }

        // BACK IMAGE OPTIONAL
        // FOR PASSPORT SIZE PHOTO

        if (
          req.body.service !==
          "Passport Size Photo" &&
          !backImage
        ) {

          return res.status(400).json({
            success: false,
            message: "Back image required",
          });

        }

         // AUTO GENERATE INVOICE NUMBER
        const invoiceNumber =
        "INV-" +
        Date.now();

      const newOrder = new Order({

        service: req.body.service,

        fullName: req.body.fullName,

        address: req.body.address,

        city: req.body.city,

        state: req.body.state,

        pincode: req.body.pincode,

        mobile: req.body.mobile,

        frontImage,

        backImage,

        status: "Pending", 

        invoiceNumber,
        paymentStatus: "Paid",
        // USE THE PRODUCT'S PRICE/GST FROM THE REQUEST;
        // FALL BACK TO PRICE 99 AND 12% GST IF NOT PROVIDED.
        price: req.body.price ? Number(req.body.price) : 99,
        gst: req.body.gst ? Number(req.body.gst) : 12,

      });

      const savedOrder =
        await newOrder.save();

        // SEND EMAIL
await transporter.sendMail({

  from:
    process.env.EMAIL_USER,

  to:
    req.body.email,

  subject:
    "Order Submitted Successfully",

  html: `

  <div style="font-family:Arial;padding:20px;">

    <h2 style="color:red;">
      Devkala Order Success
    </h2>

    <p>
      Hello ${req.body.fullName},
    </p>

    <p>
      Your order has been submitted successfully.
    </p>

    <h3>
      Order Details
    </h3>

    <p>
      Service:
      ${req.body.service}
    </p>

    <p>
      Invoice:
      ${invoiceNumber}
    </p>

    <p>
      Status:
      Pending
    </p>

    <br/>

    <p>
      Thank You For Using Devkala
    </p>

  </div>

  `,

});
         


      res.status(201).json({

        success: true,

        message:
          "Order Saved Successfully",

        data: savedOrder,

      }); 

       

    } catch (error) {

      console.log("ORDER ERROR:");
      console.log(error);

      res.status(500).json({

        success: false,

        message: error.message,

      });

    }

  }

);


// GET ALL ORDERS
app.get("/api/orders", async (req, res) => {

  try {

    const orders = await Order.find();

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

// Order Update Panding/Delivered

app.put("/api/orders/:id", async (req, res) => {

  try {

    const updatedOrder =
      await Order.findByIdAndUpdate(
        req.params.id,

        {
          status: req.body.status,
        },

        { new: true }
      );

    res.json(updatedOrder);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Update Failed",
    });

  }

});  

//Total Orders API

app.get("/api/admin/total-orders", async (req, res) => {

  try {

    const totalOrders =
      await Order.countDocuments();

    res.json({
      totalOrders,
    });

  } catch (error) {

    console.log(error);
  }

}); 


// Total Users API
app.get("/api/admin/total-users", async (req, res) => {

  try {

    const totalUsers =
      await User.countDocuments();

    res.json({
      totalUsers,
    });

  } catch (error) {

    console.log(error);
  }

}); 

//Delete Order API  

app.delete("/api/orders/:id", async (req, res) => {

  try {

    await Order.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Order Deleted",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Delete Failed",
    });

  }

}); 


// DOWNLOAD INVOICE PDF

app.get(
  "/api/invoice/:id",

  async (req, res) => {

    try {

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {

        return res.status(404).send(
          "Order not found"
        );

      }

      // GST CALCULATION

      const gstAmount =
        (order.price * order.gst) / 100;

      const total =
        order.price + gstAmount;

      // QR CODE

      const qrCode =
        await QRCode.toDataURL(
          `Invoice: ${order.invoiceNumber}`
        );

      // HTML TEMPLATE

      const html = `

      <html>

      <head>

      <style>

      body{
        font-family: Arial;
        padding:40px;
        color:#222;
      }

      .top{
        display:flex;
        justify-content:space-between;
        align-items:center;
      }

      .logo{
        font-size:32px;
        font-weight:bold;
        color:#D40000;
      }

      .invoice{
        text-align:right;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:30px;
      }

      th{
        background:#D40000;
        color:white;
        padding:12px;
      }

      td{
        border:1px solid #ddd;
        padding:12px;
      }

      .total{
        margin-top:30px;
        text-align:right;
      }

      .status{
        padding:8px 14px;
        background:green;
        color:white;
        border-radius:6px;
        display:inline-block;
      }

      </style>

      </head>

      <body>

      <div class="top">

        <div>

          <div class="logo">
            <img
              src="https://devkalaprint.onrender.com/uploads/Logo_3.png"
              alt="Logo"
              class="logo" 
            />
          </div>

          <p>
            Dhanchhar,Fango,Khagaria,Bihar (851214)
          </p>

          <p>
            GST: 10IVOPK4173D1ZN
          </p>

        </div>

        <div class="invoice">

          <h1>
            INVOICE
          </h1>

          <h3>
            ${order.invoiceNumber}
          </h3>

          <p>
            ${new Date().toLocaleString()}
          </p>

        </div>

      </div>

      <hr/>

      <h2>
        Customer Details
      </h2>

      <p>
        Name:
        ${order.fullName}
      </p>

      <p>
        Mobile:
        ${order.mobile}
      </p>

      <p>
        Address:
        ${order.address}
      </p>

      <p>
        Status:
        <span class="status">
          ${order.status}
        </span>
      </p>

      <table>

        <tr>

          <th>Service</th>

          <th>Price</th>

          <th>GST</th>

          <th>Total</th>

        </tr>

        <tr>

          <td>
            ${order.service}
          </td>

          <td>
            ₹${order.price}
          </td>

          <td>
            ${order.gst}%
          </td>

          <td>
            ₹${total}
          </td>

        </tr>

      </table>

      <div class="total">

        <h2>
          Grand Total:
          ₹${total}
        </h2>

      </div>

      <br/><br/>

      <img
        src="${qrCode}"
        width="140"
      />

      <p>
        Scan QR For Verification
      </p>

      </body>

      </html>
      `;

      // LAUNCH BROWSER

      const browser =
        await puppeteer.launch({
          headless: true,
        });

      const page =
        await browser.newPage();

      await page.setContent(html);

      const pdf =
        await page.pdf({

          format: "A4",

          printBackground: true,

        });

      await browser.close();

      res.contentType(
        "application/pdf"
      );

      res.send(pdf);

    } catch (error) {

      console.log(error);

      res.status(500).send(
        "Invoice Error"
      );

    }

  }
);

// ERROR MIDDLEWARE
app.use((err, req, res, next) => {

  console.log("MIDDLEWARE ERROR:");
  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });

});



// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
