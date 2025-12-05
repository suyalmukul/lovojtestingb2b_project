const Fabrics = require("../models/fabric");
const fabricInventory = require("../models/fabricInventory");
const fabricInventoryService = require("../services/fabricInventory.service");
const FabricsForSuperadmin = require("../models/FabricForSuperadmin");
const FabricForUSerMakingCharges = require("../models/fabricForUser");
const QRCode = require('qrcode');
const Store = require("../models/stores");
const uploadToS3 = require("../utils/s3Upload");
const Cart = require("../models/cart");
const fabricService = require("../services/fabric.service");
//FabricPipeline
const deleteFromS3 = require("../utils/deleteFroms3");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const AppError = require("../utils/errorHandler");
const findCombinations = require("../utils/combination"); // Import the findCombinations function
const { generateQRCode } = require("../utils/others");
const { getIO } = require("../utils/setupSocket");
const xlsx = require("xlsx");
const path = require('path');
const unzipper = require("unzipper");
const extractFolder = 'uploads/extracted/'; // Ensure this is the correct extraction folder
const AdmZip = require("adm-zip");
const fs = require("fs-extra");
const OthersService = require("../services/others.service");
const FabricForSuperadmin = require("../models/FabricForSuperadmin");
  

exports.addFabricData = catchAsyncError(async (req, res, next) => {
    const io = await getIO();
    const user = req.user;
    const { storeId } = user;
    let data = req.body;

    // Insert the fabric
    const fabric = await fabricInventoryService.insertFabric(storeId, data);

    // Generate QR code 
    const getFabricAPIUrl = `https://admin.lovoj.com/${fabric._id}`;
    const base64String = await generateQRCode(getFabricAPIUrl);
    const qr_code = base64String.replace(/^data:image\/png;base64,/, '');

    fabric.qr_code = qr_code;
    await fabric.save();

    // Emit socket event
    if (io) {
        await io.emit('newFabric', fabric);
    }

    return res.status(200).json({
        success: true,
        message: "Fabric added successfully to the database.",
        fabric,
        qr_code
    });
});


exports.getFabricData = catchAsyncError(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;

    let { pipeline, countPipeline } = await fabricInventoryService.FabricPipeline(req.query, page, limit);

    if (!pipeline.length) {
        return res.status(400).json({ success: false, message: " search data not found.." });
    }
    const fabrics = await fabricInventory.aggregate(pipeline);

    const countResult = await fabricInventory.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    // Calculate showing results range
    const showingResults = {
        from: totalCount > 0 ? (page - 1) * limit + 1 : 0,
        to: Math.min(page * limit, totalCount),
    };

    res.status(200).json({
        success: true,
        message: "Your Fabric lists..",
        totalCount,
        page,
        showingResults,
        fabrics,
    });
});


exports.updateFabricData = catchAsyncError(async (req, res, next) => {
    const fabricId = req.params.id;
    const { user } = req;
    const data = req.body;
  
    // Find the fabric by ID
    let fabric = await fabricInventory.findById(fabricId);
  
    if (!fabric) {
      return res.status(404).json({
        success: false,
        message: "Fabric not found..",
      });
    }
  
    // Update the fabric fields
    fabric = await fabricInventoryService.updateFabric(fabric, data);
  
    return res.status(200).json({
      success: true,
      message: "Fabric updated successfully.",
      fabric,
    });
});


exports.deleteFabricData = catchAsyncError(async (req, res, next) => {
    const fabricId = req.params.id;
    const deletedFabric = await fabricInventory.findByIdAndDelete(fabricId);
    // await deleteFromS3(deletedFabric.fabImage);
  
    if (!deletedFabric) {
      return next(new AppError("Fabric not found", 404));
    }
  
    return res.status(200).json({
      success: true,
      message: "Fabric deleted successfully",
      deletedFabric: deletedFabric,
    });
});



/********************** */

// Helper function to build rollInfo array from separate columns
function parseRollInfoFromColumns(row) {
    // Define the keys that are expected
    const keys = ["rollLength", "unit", "rollIdentity", "rackNumber", "stockLocation"];
    const arrays = {};
    let numRolls = 0;
    keys.forEach(key => {
      if (row[key]) {
        // Split by comma and trim each value
        arrays[key] = row[key].toString().split(",").map(x => x.trim());
        if (arrays[key].length > numRolls) {
          numRolls = arrays[key].length;
        }
      }
    });
    // Build an array of roll objects
    const result = [];
    for (let i = 0; i < numRolls; i++) {
      const rollObj = {};
      keys.forEach(key => {
        // If a value is missing for a given key, default to an empty string.
        rollObj[key] = arrays[key] ? (arrays[key][i] || "") : "";
        // Optionally convert rollLength to a number if required by your schema:
        if (key === "rollLength") {
          rollObj[key] = Number(rollObj[key]) || 0;
        }
      });
      result.push(rollObj);
    }
    return result;
}
  
// exports.uploadBulkFabricsData = async (req, res) => {
//     try {
//         const { files, user } = req;
//         if (!files || !files.excel || !files.zip) {
//             return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
//         }
//         if (!user || !user.storeId || !user.storeNumber) {
//             return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
//         }
//         const { storeId, storeNumber } = user;

//         // Parse Excel data
//         const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = xlsx.utils.sheet_to_json(sheet);
//         if (!jsonData.length) {
//             return res.status(400).json({ success: false, message: "Excel file is empty" });
//         }

//         // Generate F-DASH numbers sequentially
//         const dashFabrics = await fabricInventory.find({}, { dashnumber: 1 });
//         const maxNumber = dashFabrics.reduce((max, { dashnumber }) => Math.max(max, dashnumber || 99), 99);
//         let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
//         const dashNumbers = [];
//         for (let i = 0; i < jsonData.length; i++) {
//             const newDash = await OthersService.createFabricDashNumber(last);
//             dashNumbers.push(newDash);
//             last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
//         }

//         // Check for duplicate fabDashNumbers
//         const dup = await fabricInventory.find({ dashnumber: { $in: dashNumbers } });
//         if (dup.length) {
//             return res.status(400).json({ success: false, message: "Duplicate fabDashNumbers", duplicatedashnumbers: dup.map(f => f.dashnumber) });
//         }

//         // Process ZIP images
//         const zip = new AdmZip(files.zip[0].buffer);
//         const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//         await fs.ensureDir(extractPath);
//         zip.extractAllTo(extractPath, true);
//         let zipFiles = await fs.readdir(extractPath);
//         zipFiles = zipFiles.filter(f => [".jpg", ".jpeg", ".png"].includes(path.extname(f).toLowerCase()));
//         if (zipFiles.length !== jsonData.length) {
//             await fs.remove(extractPath);
//             return res.status(400).json({ success: false, message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.` });
//         }

//         const uploadedUrls = await Promise.all(zipFiles.map(async (f) => {
//             const filePath = path.join(extractPath, f);
//             const buffer = await fs.readFile(filePath);
//             return uploadToS3({ originalname: f, buffer, mimetype: "image/jpeg" });
//         }));
//         await fs.remove(extractPath);

//         // Build data objects for insertion
//         const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
//         const data = jsonData.map((item, i) => ({
//             storeId,
//             name: item.name || "",
//             type: item.type || "",
//             construction: item.construction || "",
//             composition: item.composition || "",
//             construction_type: item.construction_type || "",
//             pattern: item.pattern || "",
//             fabric_image: uploadedUrls[i] || "",
//             images: [uploadedUrls[i]] || [],
//             tile_x: item.tile_x || 0,
//             tile_y: item.tile_y || 0,
//             season: item.season || "all season",
//             glossy: item.glossy || false,
//             glossy_intensity: item.glossy_intensity || "",
//             dashnumber: dashNumbers[i],
//             gsm: item.gsm || 0,
//             width: item.width || "",
//             count: item.count || "",
//             unit: item.unit || "mtr",
//             color: item.color || "",
//             color_code: item.color_code || "",
//             sku: item.sku || "",
//             brand: item.brand || "",
//             // description: item.description || "",
//             best_for: item.best_for || "",
//             base_price: item.base_price || 0,
//             discount_percentage: item.discount_percentage || 0,
//             cost_gst_percentage: item.cost_gst_percentage || 0,
//             extra_charges: item.extra_charges || 0,
//             profit_percentage: item.profit_percentage || 0,
//             selling_percentage: item.selling_percentage || 0,
//             sell_gst_percentage: item.sell_gst_percentage || 0,
//             offer_price: item.offer_price || 0,
//             mrp: item.mrp || 0,
//             expiry_date: item.expiry_date || null,
//             alert_quantity: item.alert_quantity || 0,
//             moq: item.moq || 0,
//             selling_moq: item.selling_moq || 0,
//             number: item.number || 0,
//             rotation: item.rotation || 0,
//             rollInfo: parseRollInfoFromColumns(item),
//         }));

//         // Insert into MongoDB and generate QR codes
//         const inserted = await fabricInventory.insertMany(data);
//         await Promise.all(inserted.map(async fabric => {
//             const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
//             fabric.qr_code = qr.replace(/^data:image\/png;base64,/, '');
//             await fabric.save();
//         }));

//         return res.status(200).json({ success: true, message: "Fabrics uploaded successfully", insertedCount: inserted.length });
//     } catch (err) {
//         console.error("Error processing bulk upload:", err);
//         return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
//     }
// };

 

exports.uploadBulkFabricsData = async (req, res) => {
    try {
        const { files, user } = req;
        if (!files || !files.excel || !files.zip) {
            return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
        }
        if (!user || !user.storeId || !user.storeNumber) {
            return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
        }
        const { storeId, storeNumber } = user;

        // 📌 Parse Excel data
        const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        if (!jsonData.length) {
            return res.status(400).json({ success: false, message: "Excel file is empty" });
        }

        // 📌 Find the highest existing dashnumber and increment
        const lastFabric = await fabricInventory.findOne({}, { dashnumber: 1 }).sort({ dashnumber: -1 });

        let maxNumber = 99;  // Default if no fabrics exist
        if (lastFabric && lastFabric.dashnumber) {
            const lastDashNumber = parseInt(lastFabric.dashnumber.replace("F-DASH", ""), 10);
            if (!isNaN(lastDashNumber)) {
                maxNumber = lastDashNumber;
            }
        }

        // 📌 Generate unique F-DASH numbers
        let last = maxNumber; // Start from the last dash number
        const dashNumbers = [];
        for (let i = 0; i < jsonData.length; i++) {
            last += 1;  // ✅ Correctly increment by 1 each time
            dashNumbers.push(`F-DASH${last}`);
        }

        // 📌 Check for duplicate fabDashNumbers before inserting
        const existingDashNumbers = await fabricInventory.find({ dashnumber: { $in: dashNumbers } }, { dashnumber: 1 });
        if (existingDashNumbers.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate fabDashNumbers",
                duplicatedashnumbers: existingDashNumbers.map(f => f.dashnumber)
            });
        }

        // 📌 Process ZIP images
        const zip = new AdmZip(files.zip[0].buffer);
        const extractPath = path.join(__dirname, "../temp", Date.now().toString());
        await fs.ensureDir(extractPath);
        zip.extractAllTo(extractPath, true);
        let zipFiles = await fs.readdir(extractPath);
        zipFiles = zipFiles.filter(f => [".jpg", ".jpeg", ".png"].includes(path.extname(f).toLowerCase()));

        if (zipFiles.length !== jsonData.length) {
            await fs.remove(extractPath);
            return res.status(400).json({
                success: false,
                message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`,
            });
        }

        // 📌 Upload images to S3
        const uploadedUrls = await Promise.all(zipFiles.map(async (f) => {
            const filePath = path.join(extractPath, f);
            const buffer = await fs.readFile(filePath);
            return uploadToS3({ originalname: f, buffer, mimetype: "image/jpeg" });
        }));
        await fs.remove(extractPath);

        // 📌 Build data objects for insertion
        const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
        const data = jsonData.map((item, i) => ({
            storeId,
            name: item.name || "",
            type: item.type || "",
            construction: item.construction || "",
            composition: item.composition || "",
            construction_type: item.construction_type || "",
            pattern: item.pattern || "",
            fabric_image: uploadedUrls[i] || "",
            images: [uploadedUrls[i]] || [],
            tile_x: item.tile_x || 0,
            tile_y: item.tile_y || 0,
            season: item.season || "all season",
            glossy: item.glossy || false,
            glossy_intensity: item.glossy_intensity || "",
            dashnumber: dashNumbers[i],  // ✅ Correct sequential dashnumber
            gsm: item.gsm || 0,
            width: item.width || "",
            count: item.count || "",
            unit: item.unit || "mtr",
            color: item.color || "",
            color_code: item.color_code || "",
            sku: item.sku || "",
            brand: item.brand || "",
            best_for: item.best_for || "",
            base_price: item.base_price || 0,
            discount_percentage: item.discount_percentage || 0,
            cost_gst_percentage: item.cost_gst_percentage || 0,
            extra_charges: item.extra_charges || 0,
            profit_percentage: item.profit_percentage || 0,
            selling_percentage: item.selling_percentage || 0,
            sell_gst_percentage: item.sell_gst_percentage || 0,
            offer_price: item.offer_price || 0,
            mrp: item.mrp || 0,
            expiry_date: item.expiry_date || null,
            alert_quantity: item.alert_quantity || 0,
            moq: item.moq || 0,
            selling_moq: item.selling_moq || 0,
            number: item.number || 0,
            rotation: item.rotation || 0,
            rollInfo: parseRollInfoFromColumns(item),
        }));

        // 📌 Insert into MongoDB
        const inserted = await fabricInventory.insertMany(data);

        // 📌 Generate QR codes
        await Promise.all(inserted.map(async fabric => {
            const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
            fabric.qr_code = qr.replace(/^data:image\/png;base64,/, '');
            await fabric.save();
        }));

        return res.status(200).json({
            success: true,
            message: "Fabrics uploaded successfully",
            insertedCount: inserted.length
        });

    } catch (err) {
        console.error("Error processing bulk upload:", err);
        return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: err.message
        });
    }
};
