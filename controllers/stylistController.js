const SuperadminProduct = require('../models/QuickorderNew_pro_sub');
const SuperadminMesurment = require('../models/QuickorderNew_Measurment');
const Product = require('../models/Product');
const Style = require('../models/Style');
const Contrast = require('../models/Contrast');
const Measurement = require('../models/Measurement');
const SpecialInstruction = require('../models/special_instruction');
const Cart = require('../models/cart')
const Order = require('../models/order')
const Fabrics = require("../models/fabric");
const fabricService = require("../services/fabric.service");
const Store = require("../models/stores");
const authService = require("../services/auth.services");
const FabricsForSuperadmin = require('../models/FabricForSuperadmin')
const WorkerStatus = require('../models/worker_status');

const mongoose = require('mongoose');
const StylistAppointment = require('../models/StylistAppointments.model');
const { sendSMS } = require("../utils/sns.service");
// const { getIO } = require("../utils/setupSocket");
const { sendEmailViaOneSignal } = require("../services/email.services");
const Otp = require("../models/otp");
const bcrypt = require("bcryptjs");
const { saveAddresses } = require('../utils/stylist');
const { sendPushNotification } = require('../utils/pushNotifcation');


//search superadmin product

const searchSuperadminProducts = async (req, res) => {
  try {
    const { gender, categoryName, id, search } = req.query;

    let query = {};

    // If `id` is provided, prioritize it for finding a specific product.
    if (id) {
      query["_id"] = id;
    } else {
      if (gender) {
        query["gender.name"] = gender;
      }

      if (categoryName) {
        query["gender.categories.name"] = categoryName;
      }

      // Add exact match functionality for category names, ensuring an exact match
      if (search) {
        query["gender.categories.name"] = {
          $regex: `^${search}$`,
          $options: 'i' // Case-insensitive match
        };
      }
    }

    const allProducts = await SuperadminProduct.find(query);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      allProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//search superadmin mesurment

const searchSuperadminMeasurements = async (req, res) => {
  try {
    const { gender, categoriename, id, search } = req.query;

    let query = {};

    // If `id` is provided, prioritize it for finding a specific product.
    if (id) {
      query["_id"] = id;
    } else {
      if (gender) {
        query["gender"] = gender;
      }

      if (categoriename) {
        query["categoriename"] = categoriename;
      }

      // Add exact match functionality for category names, ensuring an exact match
      if (search) {
        query["categoriename"] = {
          $regex: `^${search}$`,
          $options: 'i' // Case-insensitive match
        };
      }
    }

    const allMesurments = await SuperadminMesurment.find(query);

    res.status(200).json({
      success: true,
      message: 'Mesurment retrieved successfully',
      allMesurments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// search fabric

const searchSuperadminFabrics = (async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;
  let { pipeline, countPipeline, totalCount } =
    await fabricService.getFabricPipeline(req.query, page, limit);

  const fabrics = await FabricsForSuperadmin.aggregate(pipeline);

  const countResult = await FabricsForSuperadmin.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };

  res.status(200).json({
    success: true,
    message: "Your Fabric lists",
    totalCount,
    page,
    showingResults,
    fabrics,
  });
});

// 

const searchDesignerCreation = (async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;

  let { pipeline, countPipeline, totalCount } =
    await fabricService.getStoreFabricPipeline(req.query, page, limit);

  let stores = [];

  stores = await Store.aggregate(pipeline);

  const countResult = await Store.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };
  // stores = await fabricService.getFabricImagesOfStores(stores);
  return res.status(200).json({
    success: true,
    message: "Store with fabricImages",
    totalCount,
    page,
    showingResults,
    stores,
  });
});


/************************************* Add Data *******************************/

// const addData = async (req, res) => {
//   const {
//     product = {},
//     styles = [],
//     stylist_id,
//     customer_id,
//     type,
//     is_selected,
//     created_by = "stylist",
//     quantity
//   } = req.body;

//   try {
//     const productId = product._id || ((await new Product(product).save())._id);

//     const saveStyles = async (styles, productId) => {
//       if (styles.length) {
//         const result = await Style.insertMany(styles.map(item => ({ ...item, product_id: productId })));
//         return { styles: result };
//       }
//     };

//     const results = {
//       ...(styles.length && await saveStyles(styles, productId))
//     };

//     if (stylist_id && customer_id && created_by) {
//       if (quantity) {
//         await new Cart({ product_id: productId, stylist_id, customer_id, type, quantity, is_selected, created_by }).save();
//       } else {
//         await new Cart({ product_id: productId, stylist_id, customer_id, created_by }).save();
//       }
//     }

//     res.status(201).json({ message: 'Data added successfully', data: results });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const addProduct = async (req, res) => {
  const stylist_id = req.user._id;
  const {
    products = [], // Accept an array of products
    // stylist_id,
    customer_id,
    is_selected,
    created_by = "stylist",
    appointment_id
  } = req.body;
  try {
    // Loop through each product in the array
    const results = await Promise.all(
      products.map(async (productData) => {
        const { product = {}, styles = [], quantity } = productData;

        // Save the product if it doesn't have an _id
        const productId = product._id || ((await new Product(product).save())._id);

        // Save associated styles if any
        const saveStyles = async (styles, productId) => {
          if (styles.length) {
            const result = await Style.insertMany(styles.map((item) => ({ ...item, product_id: productId })));
            return { styles: result };
          }
        };

        const productResults = {
          ...(styles.length && (await saveStyles(styles, productId))),
        };

        // Save the product in the cart
        if (stylist_id && customer_id && created_by) {
          if (quantity) {
            await new Cart({ product_id: productId, stylist_id, customer_id, quantity, is_selected, created_by, appointment_id }).save();
          } else {
            await new Cart({ product_id: productId, stylist_id, customer_id, created_by, appointment_id }).save();
          }
        }

        return { productId, ...productResults };
      })
    );

    res.status(201).json({ message: "Data added successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/********************************* Update Data ******************************/

const updateProduct = async (req, res) => {
  const stylist_id = req.user._id;
  const {
    products = [],
    customer_id,
    is_selected,
    created_by = "stylist",
  } = req.body;

  try {
    const results = await Promise.all(
      products.map(async (productData) => {
        const { product = {}, styles = [], quantity } = productData;
        let productId = product._id;

        if (productId) {
          // Update existing product
          await Product.findByIdAndUpdate(productId, { $set: product }, { new: true });
        } else {
          return { error: "Product ID is required for updating an existing product" };
        }

        // Update existing styles (Find and update styles instead of deleting and inserting new ones)
        await Promise.all(
          styles.map(async (style) => {
            await Style.findOneAndUpdate(
              { product_id: productId, name: style.name, type: style.type },
              { $set: { image: style.image } },
              { upsert: true, new: true }
            );
          })
        );

        // Update existing cart entry if it exists
        const cartQuery = { product_id: productId, stylist_id, customer_id, created_by };
        const cartUpdate = { quantity, is_selected };
        const existingCart = await Cart.findOne(cartQuery);

        if (existingCart) {
          await Cart.updateOne(cartQuery, { $set: cartUpdate });
        } else {
          return { error: "Cart entry does not exist for this product" };
        }

        return { productId };
      })
    );

    res.status(200).json({ message: "Data updated successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/********************************** Update Data *****************************/

// const addProductContrastAndMeasurment = async (req, res) => {
//   const { product_id } = req.params;
//   const { productContrast = [], measurement = [] } = req.body;

//   const saveData = async (data, Model, key) => {
//     if (data.length) {
//       await Model.deleteMany({ product_id });
//       return { [key]: await Model.insertMany(data.map((item) => ({ ...item, product_id }))) };
//     }
//     return {};
//   };

//   try {
//     const results = {
//       ...(await saveData(productContrast, Contrast, "Contrast")),
//       ...(await saveData(measurement, Measurement, "measurement")),
//     };

//     res.status(200).json({ message: "Data updated successfully", data: results });
//   } catch (error) {
//     console.error("Error updating data:", error);
//     res.status(500).json({ error: error.message });
//   }
// };




// const addProductContrastAndMeasurment = async (req, res) => {
//   const {
//     productContrast = [],
//     measurement = [],
//     quantity,
//     stylist_id,
//     customer_id,
//     created_by = "stylist",
//     productData = {}, // New: Product data to update
//     styleData = [] // New: Style data to update
//   } = req.body;

//   const { product_id } = req.params;

//   const saveData = async (data, Model, key) => {
//     if (data.length) {
//       await Model.deleteMany({ product_id });
//       return { [key]: await Model.insertMany(data.map((item) => ({ ...item, product_id }))) };
//     }
//     return {};
//   };

//   const updateCart = async () => {
//     if (quantity) {
//       const cartItem = await Cart.findOne({ product_id, stylist_id, customer_id, created_by });
//       if (cartItem) {
//         cartItem.quantity = quantity;
//         await cartItem.save();
//       } else {
//         await new Cart({ product_id, stylist_id, customer_id, created_by, quantity }).save();
//       }
//     }
//   };

//   const updateProductData = async () => {
//     if (Object.keys(productData).length) {
//       const product = await Product.findById(product_id);
//       if (product) {
//         Object.assign(product, productData);
//         await product.save();
//       } else {
//         throw new Error(`Product with ID ${product_id} not found`);
//       }
//     }
//   };

//   const updateStyleData = async () => {
//     if (styleData.length) {
//       await Style.deleteMany({ product_id }); // Remove existing styles for the product
//       const newStyles = styleData.map((style) => ({ ...style, product_id }));
//       await Style.insertMany(newStyles); // Insert updated style data
//     }
//   };

//   try {
//     const results = {
//       ...(await saveData(productContrast, Contrast, 'Contrast')),
//       ...(await saveData(measurement, Measurement, 'measurement')),
//     };

//     await updateCart();
//     await updateProductData(); // Update Product data in Product collection
//     await updateStyleData();   // Update Style data in Style collection

//     res.status(200).json({ message: 'Data updated successfully', data: results });
//   } catch (error) {
//     console.error('Error updating data:', error);
//     res.status(500).json({ error: error.message });
//   }
// };


const addProductContrastAndMeasurment = async (req, res) => {
  const { product_id } = req.params;
  const { productContrast = [], measurement = [], specialInstruction = [] } = req.body; // Added specialInstruction

  // Utility function to delete old data and insert new data
  const saveData = async (data, Model, key) => {
    if (data.length) {
      await Model.deleteMany({ product_id });
      return { [key]: await Model.insertMany(data.map((item) => ({ ...item, product_id }))) };
    }
    return {};
  };

  try {
    const results = {
      ...(await saveData(productContrast, Contrast, "Contrast")),
      ...(await saveData(measurement, Measurement, "Measurement")),
      ...(await saveData(specialInstruction, SpecialInstruction, "SpecialInstruction")), // Added SpecialInstruction
    };

    res.status(200).json({ message: "Data updated successfully", data: results });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: error.message });
  }
};



/************************************ Get Cart Data ****************************/

// const cartdata = async (req, res) => {
//   const { customer_id } = req.query;
//   const stylist_id = req.user._id;

//   try {
//     if (!customer_id) {
//       return res.status(400).json({ message: 'User ID is required.' });
//     }

//     const cartItems = await Cart.find({ customer_id, stylist_id })
//       .populate({
//         path: 'product_id',
//         populate: [
//           { path: 'fabric_id', },  // Populate fabric details
//           { path: 'store_id', },            // Populate store details
//           { path: 'category_id' },                         // Populate category details
//         ]
//       })
//       .lean(); // Convert Mongoose documents to plain objects

//     const enrichedCartItems = await Promise.all(
//       cartItems.map(async (cartItem) => {
//         const productId = cartItem.product_id._id;

//         // Find and populate fabric_id inside Contrast
//         const contrasts = await Contrast.find({ product_id: productId })
//           .populate('fabric_id', 'name image_url') // Populating fabric details inside Contrast
//           .lean();

//         const styles = await Style.find({ product_id: productId }).lean();

//         const contrastsPrice = contrasts.reduce((accumulator, currentValue) =>
//           accumulator + currentValue.price, 0);

//         const total_amount = cartItem.product_id.amount + contrastsPrice;

//         return {
//           product: cartItem.product_id,
//           styles,
//           contrasts,
//           total_amount
//         };
//       })
//     );

//     res.status(200).json({
//       message: 'Cart retrieved successfully.',
//       cart: enrichedCartItems,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

/******* */
const cartdata = async (req, res) => {
  const { appointment_id } = req.params
  const stylist_id = req.user._id;

  try {
    const appointmentData = await StylistAppointment.findById(appointment_id)
    if (!appointmentData) {
      return res.status(404).send("Invalid Appointment Id Or Not Pending Appointment")
    }
    const customer_id = appointmentData.customer_id
    const cartItems = await Cart.find({ customer_id, stylist_id, appointment_id })
      .populate({
        path: 'product_id',
        populate: [
          { path: 'fabric_id' }, // Populate fabric details
          { path: 'store_id' }, // Populate store details
          { path: 'category_id' } // Populate category details
        ]
      })
      .lean(); // Convert Mongoose documents to plain objects

    const enrichedCartItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        const productId = cartItem.product_id._id;
        // Transform `fabric_id` and `store_id` into `fabric_data` and `store_data`
        const product = { ...cartItem.product_id };
        const fabric_data = product.fabric_id;
        const store_data = product.store_id;
        delete product.fabric_id;
        delete product.store_id;

        // Find and populate fabric_id inside Contrast
        const contrasts = await Contrast.find({ product_id: productId })
          .populate('fabric_id', 'name image_url') // Populate fabric details inside Contrast
          .lean();

        const styles = await Style.find({ product_id: productId }).lean();
        const special_instruction = await SpecialInstruction.find({ product_id: productId }).lean()
        const measurement = await Measurement.find({product_id:productId})

        // const contrastsPrice = contrasts.reduce((accumulator, currentValue) =>
        //   accumulator + currentValue.price, 0);

        // const total_amount = product.amount + contrastsPrice;

        return {
          product: { ...product, fabric_data, store_data },
          styles,
          contrasts,
          special_instruction,
          measurement
        };
      })
    );

    res.status(200).json({
      message: 'Cart retrieved successfully.',
      cart: enrichedCartItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/********************************* Delete Cart Data ***************************/

const deleteCartData = async (req, res) => {
  try {
    const { product_id } = req.query;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required" });
    }

    const productObjectId = mongoose.Types.ObjectId(product_id);

    const deletionResults = {
      cart: await Cart.deleteMany({ product_id: productObjectId }),
      // styles: await Style.deleteMany({ product_id: productObjectId }),
      // measurements: await Measurement.deleteMany({ product_id: productObjectId }),
      // contrasts: await Contrast.deleteMany({ product_id: productObjectId }),
      // product: await Product.deleteMany({ _id: productObjectId }),
    };

    console.log("Deletion results:", deletionResults);
    res.status(200).json({ success: true, message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ success: false, message: "Failed to delete data", error: error.message });
  }
};

/********************************** Order Api ************************************/

const createOrder = async (req, res) => {
  try {
    const stylist_id = req.user._id
    const { address, tax, expected_delivery, advance_payment, transaction_id, appointment_id, payment_id } = req.body;
    let customer_id = null
    let appointment_data = null
    let appointment_order_id = null
    if (appointment_id) {
      appointment_data = await StylistAppointment.findById(appointment_id)
      customer_id = appointment_data.customer_id
      appointment_order_id = appointment_data.order_id
    }
    const address_id = await saveAddresses(customer_id, address)
    const cart = await Cart.find({ customer_id: mongoose.Types.ObjectId(customer_id), stylist_id: mongoose.Types.ObjectId(stylist_id), created_by: "stylist", appointment_id }).populate('product_id')
    if (!cart.length) return res.status(404).json({ success: false, message: "No items found in the cart." });
    const cartItems = cart.map(item => ({
      product_id: item.product_id._id,
      name: item.product_id.name,
      price: item.product_id.price,
      quantity: item.quantity
    }));
    const productIds = cart.map(item => item.product_id)
    let totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let pricetWithoutTax = totalPrice
    if (tax) {
      totalPrice += tax
    }
    if (advance_payment) {
      totalPrice -= advance_payment
    }
    const orderData = {
      customer_id: mongoose.Types.ObjectId(customer_id),
      stylist_id: mongoose.Types.ObjectId(stylist_id),
      products: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
      type: "product", address_id,
      expected_delivery,
      tax: tax,
      payment_status: 'unpaid',
      payment_id: payment_id ? payment_id : null,
      total_amount: pricetWithoutTax,
      amount_due: totalPrice,
      address_id,
      amount_paid: advance_payment,
      advance_payment,
      advance_payment_transaction_id: transaction_id,
      payment_status: totalPrice == 0 ? 'paid' : 'unpaid'
    };
    const savedOrder = await new Order(orderData).save();
    await StylistAppointment.updateOne({ _id: appointment_id }, { $set: { status: "completed" } })
    await Order.updateOne(
      { _id: appointment_data.order_id },
      {
        $set: { status: "completed" },
        $push: { associated_order_ids: savedOrder._id }
      }
    );
    await Cart.deleteMany({ customer_id: mongoose.Types.ObjectId(customer_id), stylist_id: mongoose.Types.ObjectId(stylist_id), created_by: "stylist", appointment_id });
    await WorkerStatus.updateMany({ role: "cutter", product_id: { $in: productIds } }, { $set: { status: "pending" } })
    
    try{
      sendPushNotification(customer_id,"New Order Added","We have created new order for you")
    }catch(ex){

    }

    res.status(201).json({ success: true, message: "Order created successfully.", data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create order.", error: error.message });
  }
};

const getStylistAppointmentList = async (req, res) => {
  try {
    const status = 'pending'
    const stylist_id = req.user._id
    // Get current date in India with time set to 00:00:00
    const indiaTimeZone = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const currentDate = new Date(indiaTimeZone);
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(indiaTimeZone);
    nextDate.setHours(0, 0, 0, 0);
    nextDate.setDate(nextDate.getDate() + 1)

    // Build the query object dynamically based on provided filters
    const query = { start_time: { $gte: currentDate, $lte: nextDate }, stylist_id, status: { $in: ["pending", 'started', 'reached', 'cancelled'] } }// Default to current date

    // Fetch and populate related fields
    let appointments = await StylistAppointment.find(query).lean()
      .populate('stylist_id', 'name email') // Adjust fields to match User schema
      .populate('address_id')
      .populate('customer_id').exec() // Adjust fields to match Address schema;
    const query1 = { start_time: { $gte: nextDate }, stylist_id }
    if (status) {
      query1.status = status
    }
    appointments = appointments.map(m => {
      return { ...m, stylist_data: m.stylist_id, type: m.type ? m.type : "measurement", stylist_id: undefined, customer_data: m.customer_id, address_data: m.address_id, address_id: undefined, customer_id: undefined }
    })
    let futureAppointments = await StylistAppointment.find(query1).lean()
      .populate('stylist_id', 'name email') // Adjust fields to match User schema
      .populate('address_id')
      .populate('customer_id') // Adjust fields to match Address schema
      // Adjust fields to match Address schema
      .exec();
    futureAppointments = futureAppointments.map(m => {
      return { ...m, stylist_data: m.stylist_id, type: m.type ? m.type : "measurement", stylist_id: undefined, customer_data: m.customer_id, address_data: m.address_id, address_id: undefined, customer_id: undefined }
    })

    const query2 = { status: 'completed', stylist_id }
    let pastAppointments = await StylistAppointment.find(query2).lean()
      .populate('stylist_id', 'name email') // Adjust fields to match User schema
      .populate('address_id')
      .populate('customer_id') // Adjust fields to match Address schema
      // Adjust fields to match Address schema
      .exec();
    pastAppointments = pastAppointments.map(m => {
      return { ...m, stylist_data: m.stylist_id, type: m.type ? m.type : "measurement", stylist_id: undefined, customer_data: m.customer_id, address_data: m.address_id, address_id: undefined, customer_id: undefined }
    })


    res.status(200).json({ success: true, current_appointments: appointments, future_appointments: futureAppointments, completed_appointments: pastAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

const putStylistAppointment = async (req, res) => {
  try {
    const { appointment_id, status } = req.body;

    if (!appointment_id || !status) {
      return res.status(400).json({ success: false, message: 'stylist_id and status are required' });
    }

    const updatedAppointment = await StylistAppointment.findOneAndUpdate(
      { _id: appointment_id },
      { status },
      { new: true }
    ).populate('stylist_id', 'name email')
      .populate('address', 'street city state zip');

    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
}


/************************************************************************/

const updatePendingAppointments = async (req, res) => {
  try {
    const { appointment_id } = req.query;
    // const stylist_id = "65e1c5e5864ecba0892d2f2f";
    const stylist_id = req.user._id;
    let gender = req.user.gender == 'male' ? 'men' : "women"


    if (!stylist_id) return res.status(400).json({ message: "Stylist ID is required." });
    if (!appointment_id) return res.status(400).json({ message: "Appointment ID is required." });

    // Find the specific appointment
    const appointment = await StylistAppointment.findOne({ _id: appointment_id, stylist_id, status: 'pending' });
    if (!appointment) return res.status(404).json({ message: "Appointment not found or not pending." });

    const { order_id } = appointment;
    if (!order_id) return res.status(400).json({ message: "No order_id associated with this appointment." });

    const order = await Order.findById(order_id).populate('products.product_id').lean();
    if (!order) return res.status(404).json({ message: "Order not found." });
    // Add products to the Cart collection
    const products = order.products.filter(m => m.product_id.gender == gender)
    const cartPromises = products.map(({ product_id, quantity }) => {
      return new Cart({
        product_id,
        quantity,
        stylist_id,
        customer_id: order.customer_id,
        appointment_id,
        created_by: "stylist",
        appointment_id: appointment_id
      }).save();
    });

    await Promise.all(cartPromises);
    await StylistAppointment.updateOne({ _id: appointment_id }, { status: 'started' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const existingOtp = await Otp.findOne({ order_id });
    if (!existingOtp) {
      await new Otp({ otp_key: otp, order_id }).save();
    }
    res.status(200).json({ message: "Appointment processed successfully, products saved to Cart, and status updated to 'accepted'." });
  } catch (error) {
    res.status(500).json({ message: "Error processing appointment.", error: error.message });
  }
};




/************************************* Stylish Done Order *****************/

const updateProductsPricing = async (req, res) => {
  try {
    const { products, expected_delivery, order_id } = req.body;

    // ✅ Update order's expected delivery if provided
    if (order_id && expected_delivery) {
      await Order.updateOne({ _id: order_id }, { expected_delivery });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products must be a non-empty array.",
      });
    }

    const productIds = products.map((p) => p._id);
    const productMap = new Map(products.map((p) => [p._id, p]));

    // ✅ Fetch all products in a single query
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    if (existingProducts.length !== products.length) {
      const missingIds = productIds.filter(
        (id) => !existingProducts.some((p) => p._id.toString() === id)
      );
      return res.status(404).json({
        success: false,
        message: `Products not found: ${missingIds.join(", ")}`,
      });
    }

    // ✅ Optimize updates using `bulkWrite`
    const productUpdates = [];
    const workerStatusEntries = [];

    existingProducts.forEach((product) => {
      const updateData = productMap.get(product._id.toString());

      const updateFields = {};
      if (updateData.price) updateFields.price = updateData.price;
      if (updateData.store_id) updateFields.store_id = updateData.store_id;

      if (Object.keys(updateFields).length) {
        productUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: updateFields },
          },
        });
      }

      // ✅ Create WorkerStatus entry
      if (updateData.fabric_store_id)
        workerStatusEntries.push({
          store_id: updateData.fabric_store_id || null, // Use store_id if available
          product_id: product._id,
          combination: updateData.combination || [],
          worker_id: null, // Modify if worker_id is needed
          status: "initiated",
          timer_start: null,
          timer_end: null,
          role: "cutter",
        });
    });

    // ✅ Execute bulk operations
    const bulkOps = [];
    if (productUpdates.length) bulkOps.push(Product.bulkWrite(productUpdates));
    if (workerStatusEntries.length) bulkOps.push(WorkerStatus.insertMany(workerStatusEntries));

    await Promise.all(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Products updated and worker status initiated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating products and creating worker status.",
      error: error.message,
    });
  }
};





/********************************* Update Statusssssss *******************/

// const updateStatus = async (req, res) => {
//   try {
//     const { id } = req.params; // StylistAppointment ID
//     const { status, otp, order_id } = req.body;

//     // Validate the status value
//     if (
//       !status ||
//       !['unassigned', 'pending', 'accepted', 'started', 'reached', 'cancelled', 'completed'].includes(status)
//     ) {
//       return res.status(400).json({ success: false, message: "Invalid status value." });
//     }

//     // Handle OTP verification if status is 'reached'
//     if (status === "reached") {
//       if (!otp || !order_id) {
//         return res.status(400).json({ success: false, message: "OTP and order_id are required for 'reached' status." });
//       }

//       // Validate `order_id` format
//       if (!mongoose.Types.ObjectId.isValid(order_id)) {
//         return res.status(400).json({ success: false, message: "Invalid order ID format." });
//       }

//       // Find the OTP entry in the database for the given order_id
//       const otpEntry = await Otp.findOne({ order_id, used: false });

//       if (!otpEntry) {
//         return res.status(400).json({ success: false, message: "Invalid or expired OTP for the given order ID." });
//       }

//       // Compare the provided OTP with the stored plain OTP
//       const isOtpValid = otp === otpEntry.otp_key;

//       if (!isOtpValid) {
//         return res.status(400).json({ success: false, message: "Invalid OTP." });
//       }

//       // Mark the OTP as used
//       otpEntry.used = true;
//       await otpEntry.save();
//     }

//     // Update the status in the StylistAppointment collection
//     const updatedAppointment = await StylistAppointment.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedAppointment) {
//       return res.status(404).json({ success: false, message: "Appointment not found." });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Status updated successfully.",
//       data: updatedAppointment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating status.",
//       error: error.message,
//     });
//   }
// };


const updateStatus = async (req, res) => {
  try {
    const { id } = req.params; // StylistAppointment ID
    const { status, otp } = req.body;
    const appointment = await StylistAppointment.findById(id)
    if (!appointment) {
      return res.status(404).send("AppointmentId is invalid")
    }
    const order_id = appointment.order_id;
    // Validate status
    const validStatuses = ['unassigned', 'pending', 'started', 'reached', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    // Handle OTP verification for 'reached' status
    if (status === "reached") {
      if (!otp || !mongoose.Types.ObjectId.isValid(order_id)) {
        return res.status(400).json({ success: false, message: "Valid OTP and order_id are required for 'reached' status." });
      }

      const otpEntry = await Otp.findOne({ order_id });
      if (!otpEntry || otp !== otpEntry.otp_key) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
      }

      otpEntry.used = true;
      await otpEntry.save();
    }

    // Update status
    const updatedAppointment = await StylistAppointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status.", error: error.message });
  }
};



/******************************** Otp Sent For Stylist ********************/

// const sendOtp = async (req, res) => {
//   try {
//     const { email, mobileNumber, order_id } = req.body;

//     // Validate `order_id` format
//     if (!mongoose.Types.ObjectId.isValid(order_id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid order ID format." });
//     }

//     // Check if at least one of email or mobileNumber is provided
//     if (!email && !mobileNumber) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Either email or mobile number must be provided." });
//     }

//     const now = new Date();
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Save the OTP data to the database with `order_id`
//     const otpData = new Otp({
//       mobileNumber,
//       email,
//       otp_key: otp.toString(),
//       order_id, // Pass ObjectId for order_id
//       created: now,
//     });

//     await otpData.save();

//     // Updated message
//     const message = `Your OTP for resetting your password is: ${otp}. For more assistance, visit https://www.lovoj.com/.`;

//     // Send SMS if mobileNumber is provided
//     if (mobileNumber) {
//       await sendSMS(
//         message,
//         `91${mobileNumber}`,
//         "Lovoj",
//         process.env.AWS_ENTITY_ID,
//         process.env.FORGOT_PASS_SMS_AWS_TEMPLATE_ID
//       );
//     }

//     // Send email if email is provided
//     if (email) {
//       const emailData = {
//         email,
//         template_id: process.env.FORGOT_PASSWORD_OTP_TEMPLATE_ID,
//         custom_data: {
//           otpValue: otp,
//         },
//       };
//       sendEmailViaOneSignal(emailData);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully and saved in the database.",
//     });
//   } catch (error) {
//     console.error("Error in sending OTP:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while sending OTP. Please try again.",
//     });
//   }
// };



const sendOtp = async (req, res) => {
  try {
    const { email, mobileNumber, order_id } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format." });
    }
    if (!email && !mobileNumber) {
      return res.status(400).json({ success: false, message: "Provide either email or mobile number." });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await new Otp({ mobileNumber, email, otp_key: otp, order_id, created: new Date() }).save();

    // Prepare notification details
    const message = `Your OTP for resetting your password is: ${otp}. For more assistance, visit https://www.lovoj.com/.`;
    const emailData = {
      email,
      template_id: process.env.FORGOT_PASSWORD_OTP_TEMPLATE_ID,
      custom_data: { otpValue: otp },
    };

    // Send SMS or email notifications
    if (mobileNumber) await sendSMS(message, `91${mobileNumber}`, "Lovoj", process.env.AWS_ENTITY_ID, process.env.FORGOT_PASS_SMS_AWS_TEMPLATE_ID);
    if (email) sendEmailViaOneSignal(emailData);

    res.status(200).json({ success: true, message: "OTP sent successfully and saved in the database." });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ success: false, message: "Error sending OTP. Please try again." });
  }
};
const stylistAppointmentStatuses = async (req, res) => {
  try {
    // Assuming the middleware "authenticate" sets the req.user._id
    const stylistId = req.user._id;
    const status = req.params.status

    // Fetch appointments with status = "reached" for the given stylist_id
    let appointments = await StylistAppointment.find({
      stylist_id: stylistId,
      status: status,
    }).lean().populate('stylist_id', 'name email')
      .populate('address_id')
      .populate('customer_id')
      .exec();

    appointments = appointments.map(m => {
      return { ...m, stylist_data: m.stylist_id, stylist_id: undefined, customer_data: m.customer_id, address_data: m.address_id, address_id: undefined, customer_id: undefined }
    })

    // Return the fetched appointments
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}

/******************************* Stylist my order data **********************/

const stylistmyorder = async (req, res) => {
  try {
    const stylist_id = req.user._id;
    const { order_status } = req.query; // Get order_status from query

    if (!stylist_id) {
      return res.status(400).json({ message: 'Stylist ID is required.' });
    }

    // Build the query object dynamically
    const query = { stylist_id };
    if (order_status) {
      query.order_status = order_status;
    }

    // Fetch orders and populate customerData and addressData
    const stylistorders = await Order.find(query)
      .populate({
        path: 'customer_id',
        select: 'name email mobileNumber address', // Select the fields to include from the customer
      })
      .populate({
        path: 'address_id',
        select: 'full_name mobile_number address_1 address_2 address_3 landmark pincode city_name state country default_address', // Select fields from customer_addresses
      })
      .lean();

    if (!stylistorders.length) {
      return res.status(404).json({ message: 'No orders found for the stylist with the specified criteria.' });
    }

    const productIds = stylistorders.flatMap(order => order.products.map(product => product.product_id));

    // Fetch related data in parallel
    const [products, styles, contrasts, measurements] = await Promise.all([
      Product.find({ _id: { $in: productIds } })
        .select('fabric_id amount category gender type category_id')
        .populate('fabric_id')
        .lean(),
      Style.find({ product_id: { $in: productIds } })
        .select('type name image product_id')
        .lean(),
      Contrast.find({ product_id: { $in: productIds } })
        .select('name type price currency product_id image_url fabric_image_url')
        .populate('fabric_id')
        .lean(),
      Measurement.find({ product_id: { $in: productIds } })
        .select('type value unit image_url alt1 alt2 context product_id')
        .lean(),
    ]);

    // Prepare response data
    res.status(200).json({
      message: 'My order data retrieved successfully!',
      stylistorders: stylistorders.map(({ customer_id, address_id, ...order }) => ({
        ...order,
        customer_data: customer_id,
        address_data: address_id,
      })),
      orderData: {
        products: products.map(({ fabric_id, ...rest }) => ({ ...rest, fabric_data: fabric_id })),
        styles,
        contrasts: contrasts.map(({ fabric_id, ...rest }) => ({ ...rest, fabric_data: fabric_id })),
        measurements,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my order data', error: error.message });
  }
};

/******************************* admin my order data **********************/



// // API to fetch products by store_id
// const adminmyorder = async (req, res) => {
//   try {
//     // Extract store_id from req.user
//     const store_id = req.user.storeId;
//     // const store_id = "65757603ff441f05d8196168";
//     console.log("store_id",store_id)

//     if (!store_id) {
//       return res.status(400).json({ message: "Store ID not found in user." });
//     }

//     // Find products with the provided store_id
//     const products = await Product.find({ store_id: store_id });

//     if (products.length === 0) {
//       return res.status(404).json({ message: "No products found for this store." });
//     }

//     // Send back the products found
//     res.status(200).json({ products });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

/**************** */

const adminmyorder = async (req, res) => {
  try {
    // Extract store_id from req.user
    // const storeId = req.user.storeId;
    const store_id = "65757603ff441f05d8196168";

    if (!store_id) {
      return res.status(400).json({ message: "Store ID not found in user." });
    }

    const productId = req.query.product_id;

    // Fetch products for the given store_id
    const products = await Product.find({ store_id: store_id });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this store." });
    }

    // Filter products by product_id if provided
    let filteredProducts = products;
    if (productId) {
      filteredProducts = products.filter(product => product._id.toString() === productId);
    }

    // Gather all productIds from filteredProducts
    const productIds = filteredProducts.map(product => product._id);

    // Fetch data from Style, Contrast, Measurement, and WorkerStatus collections
    const [styles, contrasts, measurements, workerStatuses] = await Promise.all([
      Style.find({ product_id: { $in: productIds } })
        .select('type name image product_id')
        .lean(),
      Contrast.find({ product_id: { $in: productIds } })
        .select('name type price currency product_id image_url fabric_image_url')
        .populate('fabric_id')
        .lean(),
      Measurement.find({ product_id: { $in: productIds } })
        .select('type value unit image_url alt1 alt2 context product_id')
        .lean(),
      WorkerStatus.find({ product_id: { $in: productIds }, store_id: store_id })
    ]);

    // Attach the additional data to the response
    const response = filteredProducts.map(product => {
      const productId = product._id.toString();
      return {
        ...product.toObject(),
        styles: styles.filter(style => style.product_id.toString() === productId),
        contrasts: contrasts.filter(contrast => contrast.product_id.toString() === productId),
        measurements: measurements.filter(measurement => measurement.product_id.toString() === productId),
        workers: workerStatuses.filter(worker => worker.product_id.toString() === productId),
      };
    });

    // Send the final response
    res.status(200).json({ products: response });
  } catch (error) {
    console.error("Error fetching products and associated data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


/********************************** Customer Profile Data **********************/

const getCustomerDataByAppointmentId = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the stylist appointment by ID and populate the customer data
    const appointment = await StylistAppointment.findById(id).populate({
      path: 'customer_id',
      model: 'OnlineCustomers'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Stylist appointment not found',
      });
    }

    const customerData = appointment.customer_id;

    return res.status(200).json({
      success: true,
      message: 'Customer data fetched successfully',
      appointmentId: id,
      customer: customerData,
    });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
const deleteProductContrast = async (req, res) => {
  try {
    const contrast_id = req.body.product_contrast_id;

    if (!contrast_id) {
      return res.status(400).json({ success: false, message: "Product contrast ID is required" });
    }

    const result = await Contrast.deleteOne({ _id: contrast_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product contrast not found" });
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting product contrast:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



module.exports = {
  addProduct,
  updateProduct,
  addProductContrastAndMeasurment,
  cartdata,
  deleteCartData,
  createOrder,
  getStylistAppointmentList,
  putStylistAppointment,
  updatePendingAppointments,
  updateProductsPricing,
  updateStatus,
  sendOtp,
  stylistAppointmentStatuses,
  stylistmyorder,
  adminmyorder,
  getCustomerDataByAppointmentId,
  searchSuperadminProducts,
  searchSuperadminMeasurements,
  searchSuperadminFabrics,
  searchDesignerCreation,
  deleteProductContrast

}

