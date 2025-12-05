

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
    storelogo: "https://lovoj.s3.amazonaws.com/uploads/QuickOrderImages/1706787696536.png",
    storeAddress: ["12, TODERMAL ROAD, New Delhi G. P. O.", "Central Delhi", "New Delhi, Delhi 110001", "India"],
    placeOfSupply: "Delhi(07)",
    invoiceNo: "INV-001", // Example invoice number
    invoiceDate: "01/01/2024", // Example invoice date
    deliveryDate: "01/05/2024", // Example delivery date
    alterationDate: "01/03/2024", // Example alteration date
    storeGst: "GSTIN123", // Replace with actual store GST
    customerName: "John Doe", // Example customer name
    billAddress: ["123 Street Name", "City", "State", "Country"], // Example billing address
    shipAddress: ["456 Street Name", "City", "State", "Country"], // Example shipping address
    billgst: "07AABCB22115P1ZR", // Example billing GST
    shipgst: "07AABCB22115P1ZR", // Example shipping GST
    products: products, // Assuming 'products' is defined elsewhere
    subTotal: "1000", // Example subtotal
    delivery: "50", // Example delivery charges
    coupon: "0", // Example coupon amount
    cgst: "90", // Example CGST amount
    sgst: "90", // Example SGST amount
    total: "1280", // Example total amount
    advance: "500", // Example advance payment
    pending: "780", // Example pending amount
    totalinWords: "One Thousand Two Hundred Eighty", // Example total in words
  };



  /* eslint-disable no-param-reassign */
const fs = require("fs");
const moment = require("moment");
// eslint-disable-next-line camelcase
// const html_to_pdf = require("html-pdf-node");
const Handlebars = require("handlebars");

// Read HTML Template
const html = fs.readFileSync("newInvoice.hbs", "utf8");
const template = Handlebars.compile(html);
const createPdf = async (data) => {
  return new Promise((resolve, reject) => {
    const templateContent = template(data);
    const options = {
      format: "A4",
      path: `bill.pdf`,
      headless:false,
    args: ["--no-sandbox"],
      landscape: false,
      border: "10mm",
      timeout: "10000000",
      headerTemplate: `<img src="https://lovoj.s3.amazonaws.com/uploads/QuickOrderImages/1706787696536.png" style="max-width: 100px; margin-left: auto; display: block;" />`,
      footerTemplate:
        '<span style="color: #444;font-size: 10px;margin-top:6px">This Certificate is only valid if it bears the signature of the Coverholder, on behalf of Novus Underwriting Limited.</span>', // fallback value
    };
    const document = {
      content: templateContent,
    };

    // html_to_pdf
    //   .generatePdf(document, options)
    //   .then((pdfBuffer) => {
    //     // console.log("content", pdfBuffer);
    //     // const pdfBuffer = fs.readFileSync(
    //     //   `assets/pdfs/membership_certificate${data.policyNumber}.pdf`
    //     // );
    //     const base64FileMembershipCertificate = pdfBuffer.toString("base64");
    //     console.log("===== pdf generated =====")
    //     resolve(base64FileMembershipCertificate);
    //   })
    //   .catch((error) => {
    //     console.log("=====error in pdf generation=====", error)
    //     reject(error);
    //   });
  });
};

createPdf(data)

