const CustomerAddress = require("../models/CustomerAddress");

exports.saveAddresses = async (customer_id, data) => {
    const {
      full_name,
      mobile_number,
      email,
      address_1,
      address_2,
      address_3,
      landmark,
      pincode,
      city_name,
      state,
      country,
      default_address
    } = data
  
  
    // Validate required fields
    if (!customer_id || !full_name || !mobile_number || !address_1 || !state || !country) {
      return new Error("something went wrong")
    }
  
  
    // Create a new customer address
    const newAddress = new CustomerAddress({
      customer_id,
      full_name,
      mobile_number,
      email,
      address_1,
      address_2,
      address_3,
      landmark,
      pincode,
      city_name,
      state,
      country,
      default_address
    });
  
  
    // Save the address to the database
    const savedAddress = await newAddress.save();
    return savedAddress._id
  }
