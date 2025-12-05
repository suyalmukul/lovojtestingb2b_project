const Joi = require("joi");

// const stylistAddProductJoiSchema = {
//   body: Joi.object().keys({
//     product: Joi.object().keys({
//       fabric_id: Joi.string().required(),
//       price: Joi.number().required(),
//       category: Joi.string().required(),
//       gender: Joi.string().valid('men', 'women', 'unisex').required(),
//       type: Joi.string().valid('customize', 'ready-made').required(),
//       category_id: Joi.string().required(),
//       fabric_quantity:Joi.string().required() ,
//       unit:Joi.string().required(),
//       product_image_url: Joi.array()
//       .items(
//           Joi.object().keys({
//               name: Joi.string().required(),
//               url: Joi.string().required()
//           }
//           ))
//     }).required(),

//     styles: Joi.array().items(Joi.object().keys({
//       type: Joi.string().required(),
//       name: Joi.string().required(),
//       image: Joi.string().uri().required()
//     })).required(),

//     quantity: Joi.number().integer(),
//     stylist_id: Joi.string().required(),
//     customer_id : Joi.string().required(),
//     type: Joi.string().required(),
//     is_selected: Joi.boolean(),
//     created_by:Joi.string()
//   })
// };

////add
const stylistAddProductJoiSchema = {
  body: Joi.object().keys({
    products: Joi.array().items(
      Joi.object().keys({
        product: Joi.object().keys({
          fabric_id: Joi.string().required(),
          price: Joi.number().required(),
          category: Joi.string().required(),
          gender: Joi.string().valid("men", "women", "unisex").required(),
          type: Joi.string().valid("customize", "ready-made").required(),
          category_id: Joi.string().required(),
          fabric_quantity: Joi.string().required(),
          unit: Joi.string().required(),
          product_image_url: Joi.array().items(
            Joi.object().keys({
              name: Joi.string().required(),
              url: Joi.string().uri().required(),
            })
          ).required(),
        }).required(),

        styles: Joi.array().items(
          Joi.object().keys({
            type: Joi.string().required(),
            name: Joi.string().required(),
            image: Joi.string().uri().required(),
          })
        ).optional(),

        quantity: Joi.number().integer().optional(),
      })
    ).min(1).required(), // Ensure at least one product is provided

    // stylist_id: Joi.string().required(),
    customer_id: Joi.string().required(),
    // type: Joi.string().required(),
    is_selected: Joi.boolean().optional(),
    created_by: Joi.string().optional(),
    appointment_id: Joi.string().required()
  }),
};

////update
const stylistUpdateProductJoiSchema = {
  body: Joi.object().keys({
    products: Joi.array().items(
      Joi.object().keys({
        product: Joi.object().keys({
          _id: Joi.string().required(),
          fabric_id: Joi.string().required(),
          price: Joi.number().required(),
          category: Joi.string().required(),
          gender: Joi.string().valid("men", "women", "unisex").required(),
          type: Joi.string().valid("customize", "ready-made").required(),
          category_id: Joi.string().required(),
          fabric_quantity: Joi.string().required(),
          unit: Joi.string().required(),
          product_image_url: Joi.array().items(
            Joi.object().keys({
              name: Joi.string().required(),
              url: Joi.string().uri().required(),
            })
          ).required(),
        }).required(),

        styles: Joi.array().items(
          Joi.object().keys({
            type: Joi.string().required(),
            name: Joi.string().required(),
            image: Joi.string().uri().required(),
          })
        ).optional(),

        quantity: Joi.number().integer().optional(),
      })
    ).min(1).required(), // Ensure at least one product is provided

    // stylist_id: Joi.string().required(),
    customer_id: Joi.string().required(),
    // type: Joi.string().required(),
    is_selected: Joi.boolean().optional(),
    created_by: Joi.string().optional(),
    appointment_id: Joi.string().required()

  }),
};


/***************************************************************************/
const stylistAddProductContrastAndMeasurment = {
  params: Joi.object().keys({
    product_id: Joi.string().required().messages({
      "string.base": "Product ID must be a string.",
      "string.empty": "Product ID cannot be empty.",
      "any.required": "Product ID is required."
    }),
  }),
  body: Joi.object().keys({
    productContrast: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string(),
          type: Joi.string().valid().required(),
          price: Joi.number().required(),
          currency: Joi.string().required(),
          image_url: Joi.string().uri(),
          fabric_image_url: Joi.string().uri(),
          fabric_id: Joi.string(),
          color_code: Joi.string()
        })
      )
      .optional(),

    measurement: Joi.array()
      .items(
        Joi.object().keys({
          type: Joi.string().required(),
          value: Joi.string().allow('').optional(),
          unit: Joi.string().valid('cm', 'inch').required(),
          image_url: Joi.string().uri().required(),
          alt1: Joi.string().allow('').optional(),
          alt2: Joi.string().allow('').optional(),
          context: Joi.string().required(),
          ready_made: Joi.string(),
          voice_notes:Joi.array().items(Joi.string())
        })
      )
      .optional(),

    specialInstruction: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          photo: Joi.array().items(Joi.string().uri()),
          notes: Joi.array().items(Joi.string()),
          voice: Joi.array().items(Joi.string().uri()),
          hand_notes: Joi.array().items(Joi.string()),
        })
      ),
  })
    .optional(),
};





module.exports = {
  stylistAddProductJoiSchema,
  stylistUpdateProductJoiSchema,
  stylistAddProductContrastAndMeasurment
};





/***********************************************************************/
