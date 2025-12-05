const generatePDF = require("./puppeteer")
const moment = require("moment");
const numberToWords = require('number-to-words');


exports.billData = async (invoiceData) => {
  console.log("......whole  invoiceData.....",invoiceData)
  console.log(invoiceData.productData, ".......invoiceData...........");
  const customerData = invoiceData.customerData[0];
const billInvoiceData = invoiceData.billInvoiceData[0];
// const productData = invoiceData.productData[0];



const products = [
  {
    no: "1",
    image: "path/to/image1.jpg",
    name: "Product 1",
    hsnsac: "998822",
    qty: "2",
    rate: "1400.0",
    discount: "0.00",
    cgs: "9%",
    cgst: "126",
    sgs: "9%",
    sgst: "126",
    isgst: "0",
    amount: "1647",
  },
  {
    no: "2",
    image: "path/to/image2.jpg",
    name: "Product 2",
    hsnsac: "998822",
    qty: "3",
    rate: "1200.0",
    discount: "0.00",
    cgs: "9%",
    cgst: "108",
    sgs: "9%",
    sgst: "108",
    isgst: "0",
    amount: "1440",
  },
];





const data = {
  storeName: "Lovoj Technology PVT LTD.",
  storelogo: "https://www.lovoj.com/static/media/Logo1.c250c35c0d0c7ed76047.png",
  storeAddress: ["12, TODERMAL ROAD, New Delhi G. P. O.", "Central Delhi", "New Delhi, Delhi 110001", "India"],
  placeOfSupply: "Delhi(07)",
  invoiceNo: billInvoiceData.CustomersSection[0].InvoiceNumber,
  invoiceDate: moment(billInvoiceData.createdAt).format("MM/DD/YYYY"),
  deliveryDate: moment(billInvoiceData.CoastSection[0].DeliveryDate).format("MM/DD/YYYY"),
  alterationDate: moment(billInvoiceData.CoastSection[0].AlternationDate).format("MM/DD/YYYY"),
  storeGst: "GSTIN123", // Replace with actual store GST
  customerName: customerData.name,
  billAddress: billInvoiceData.CustomersSection[0].BillingAddress.split("\n"),
  shipAddress: billInvoiceData.CustomersSection[0].ShippingAddress.split("\n"),
  billgst: "07AABCB22115P1ZR",
shipgst: "07AABCB22115P1ZR",
  // products: productData.product.map((product, index) => ({
  //   no: (index + 1).toString(),
  //   image: product.fabricImage,
  //   name: product.name,
  //   hsnsac: "998822", // Replace with actual HSN/SAC code
  //   qty: product.fabricQuantity.toString(), // Use actual quantity from the data
  //   rate: "1400.0", // Replace with actual rate
  //   discount: "0.00",
  //   cgs: "9%", // Replace with actual CGST percentage
  //   cgst: "126", // Replace with actual CGST amount
  //   sgs: "9%", // Replace with actual SGST percentage
  //   sgst: "126", // Replace with actual SGST amount
  //   isgst: "0", // Replace with actual IGST amount
  //   amount: "1647", // Replace with actual total amount
  // })),

  products: products,

  subTotal: billInvoiceData.CoastSection[0].SubTotal,
  delivery: billInvoiceData.CoastSection[0].DeliveryCharges,
  coupon: billInvoiceData.CoastSection[0].CouponAmount,
  cgst: billInvoiceData.CoastSection[0].Cgst,
  sgst: billInvoiceData.CoastSection[0].Sgst,
  total: billInvoiceData.CoastSection[0].TotalAmount,
  advance: billInvoiceData.CoastSection[0].PaymentAdvance,
  pending: billInvoiceData.CoastSection[0].PendingAmount,
  totalinWords: numberToWords.toWords(billInvoiceData.CoastSection[0].TotalAmount),
};


  // Generate PDF and return file path
  const filePath = await generatePDF(data);
  return filePath;
};




