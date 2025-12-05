const numberToWords = require('number-to-words');
const fs = require("fs");
const moment = require("moment");
// const html_to_pdf = require("html-pdf-node");
const Handlebars = require("handlebars");

// Read HTML Template
const html = fs.readFileSync("assets/templates/newInvoice.hbs", "utf8");
const template = Handlebars.compile(html);

exports.createBillPDF = async (invoiceData, storeInfo) => {
    console.log("......whole  invoiceData.....", invoiceData)
    console.log("......whole  storeInfo.....", storeInfo)
    const customerData = invoiceData.customerData[0];
    const billInvoiceData = invoiceData.billInvoiceData[0];
    const productData = invoiceData.productData[0];


    const data = {
        // storeName: storeInfo.name || "Lovoj Technology PVT LTD.",
        storeName: storeInfo.shopName || "ShopName",
        storeGst: "GSTIN123",
        // shopName: storeInfo.shopName || "StoreName",
        // storeAddress: storeInfo.shopName ? storeInfo.shopName.split(",") : "",
        storeAddress: storeInfo.storeAddress ? storeInfo.storeAddress.split(",") : "",
        // storelogo: "https://lovoj.s3.amazonaws.com/uploads/QuickOrderImages/1706787696536.png",
        signature: storeInfo.storeSignature || "https://p2.hiclipart.com/preview/260/355/759/book-drawing-signature-autograph-artist-singer-actor-celebrity-songwriter-png-clipart.jpg",
        invoiceNo: billInvoiceData.CustomersSection[0].InvoiceNumber,
        invoiceDate: moment(billInvoiceData.createdAt).format("MM/DD/YYYY"),
        deliveryDate: moment(billInvoiceData.CoastSection[0].DeliveryDate).format("MM/DD/YYYY"),
        alterationDate: moment(billInvoiceData.CoastSection[0].AlternationDate).format("MM/DD/YYYY"),
        customerName: customerData.name,
        placeOfSupply: billInvoiceData.CustomersSection[0].placeOfSupply || "Delhi(07)",
        billAddress: billInvoiceData.CustomersSection[0].BillingAddress.split(","),
        shipAddress: billInvoiceData.CustomersSection[0].ShippingAddress.split(","),
        billgst: billInvoiceData.CoastSection[0].Cgst,
        shipgst: billInvoiceData.CoastSection[0].Sgst,
        products: productData.product.map((product, index) => ({
            no: (index + 1).toString(),
            image: product.fabricImage,
            name: product.name,
            hsnsac: "998822",
            qty: product.fabricQuantity.toString(),
            rate: "1400.0",
            discount: "0.00",
            cgs: "9%",
            cgst: "126",
            sgs: "9%",
            sgst: "126",
            isgst: "0",
            amount: "1647",
        })),

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
    const filePath = await createPdf(data);
    return filePath;
};

const createPdf = async (data) => {
    return new Promise((resolve, reject) => {
        const templateContent = template(data);
        const filePath = `assets/bill_${moment().format("DDMMYYYY_HHmmss")}.pdf`;

        const options = {
            format: "A4",
            path: filePath,
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
        //     .generatePdf(document, options)
        //     .then((pdfBuffer) => {
        //         // console.log("content", pdfBuffer);
        //         // const pdfBuffer = fs.readFileSync(
        //         //   `assets/pdfs/membership_certificate${data.policyNumber}.pdf`
        //         // );
        //         const base64FileMembershipCertificate = pdfBuffer.toString("base64");
        //         console.log("===== pdf generated =====")
        //         // resolve(base64FileMembershipCertificate);
        //         resolve(filePath)
        //     })
        //     .catch((error) => {
        //         console.log("=====error in pdf generation=====", error)
        //         reject(error);
        //     });
    });
};







// const products = [
//   {
//     no: "1",
//     image: "path/to/image1.jpg",
//     name: "Product 1",
//     hsnsac: "998822",
//     qty: "2",
//     rate: "1400.0",
//     discount: "0.00",
//     cgs: "9%",
//     cgst: "126",
//     sgs: "9%",
//     sgst: "126",
//     isgst: "0",
//     amount: "1647",
//   },
//   {
//     no: "2",
//     image: "path/to/image2.jpg",
//     name: "Product 2",
//     hsnsac: "998822",
//     qty: "3",
//     rate: "1200.0",
//     discount: "0.00",
//     cgs: "9%",
//     cgst: "108",
//     sgs: "9%",
//     sgst: "108",
//     isgst: "0",
//     amount: "1440",
//   },
// ];

