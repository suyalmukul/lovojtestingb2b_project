// const fs = require("fs");
// const PuppeteerHTMLPDF = require("puppeteer-html-pdf");
// const Mustache = require("mustache");

// const generatePDF = async (data) => {
//   try {
//     const htmlTemplate = fs.readFileSync('./pdfBill/invoice.html', 'utf8');
//     const htmlContent = Mustache.render(htmlTemplate, data);

//     // Initialize htmlPdf
//     const htmlPDF = new PuppeteerHTMLPDF();

//     const pdfFilePath = `./pdfBill/bill_invoice${Date.now()}.pdf`;
    
//     // Options for PDF creation
//     const options = {
//       format: "Letter",
//       orientation: "portrait",
//       path: pdfFilePath,
//     };
    
//     htmlPDF.setOptions(options);
    
//     // Generate PDF
//     await htmlPDF.create(htmlContent);
    
//     console.log(`PDF generated successfully at ${pdfFilePath}`);

//     return pdfFilePath;
//   } catch (error) {
//     console.log("PuppeteerHTMLPDF error", error);
//   }
// };

// module.exports = generatePDF

const fs = require("fs");
const pdf = require("html-pdf");
const Mustache = require("mustache");


const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const htmlTemplate = fs.readFileSync('./pdfBill/invoice.html', 'utf8');
      const htmlContent = Mustache.render(htmlTemplate, data);


     const pdfFilePath = `./pdfBill/bill_invoice${Date.now()}.pdf`;


     const options = {
        format: "Letter",
        orientation: "portrait",
      };


     pdf.create(htmlContent, options).toFile(pdfFilePath, (err, res) => {
        if (err) {
          console.error("Error generating PDF", err);
          reject(err);
        } else {
          console.log(`PDF generated successfully at ${res.filename}`);
          resolve(pdfFilePath);
        }
      });
    } catch (error) {
      console.error("Error generating PDF", error);
      reject(error);
    }
  });
};


module.exports = generatePDF;