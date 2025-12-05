const countPipelineService = (matchQuery) => {

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
    { $sort: { createdAt: -1 } },

  ]

  return countPipeline;
}

const commonPipelineService = (matchQuery, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const pipeline = [
    { $match: matchQuery },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery);



  return { pipeline, countPipeline };
};

const commonLoopkupPipelineService = (lookupKeywords, matchQuery, query, projectionFields, dynamicAddFields) => {
  const lookupStages = createDynamicLookupStages(lookupKeywords);
  const addFieldsStage = {
    $addFields: dynamicAddFields
  };

  const projectStage = {
    $project: projectionFields,
  };
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  const pipeline = [
    { $match: matchQuery },
    ...lookupStages,
    addFieldsStage,
    projectStage,
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery);



  return { pipeline, countPipeline };
};
const commonLoopkupIndependentPipelineService = (lookupStages, matchQuery, query, projectionFields, dynamicAddFields) => {
  const addFieldsStage = {
    $addFields: dynamicAddFields
  };

  const projectStage = {
    $project: projectionFields,
  };
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;
  const pipeline = [
    { $match: matchQuery },
    ...lookupStages,
    addFieldsStage,
    projectStage,
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery);



  return { pipeline, countPipeline };
};

const showingResults = (query, totalCount) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;
  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  }
  return showingResults;
};

const createLookupStage = (fromCollection, localField, foreignField, as,) => {
  return {
    $lookup: {
      from: fromCollection,
      localField: localField,
      foreignField: foreignField,
      as: as,
    },
  };
}


const createDynamicLookupStagesOffline = (keywords) => {
  let lookupStages = [];
   console.log(keywords, "keywords.....................")
  for (const item of keywords) {
    if (item === 'customerproducts') {
      lookupStages.push(createLookupStage(item, 'productID', '_id', 'productData'));
    } else if (item === 'offlinecustomerb2cs') {
      lookupStages.push(createLookupStage(item, 'customerID', '_id', 'customerData'));
    } else if (item === 'customerinvoices') {
      lookupStages.push(createLookupStage(item, 'billInvoiceID', '_id', 'billingData'));
    } else if (item === 'customercontrasts') {
      lookupStages.push(createLookupStage(item, 'constrastID', '_id', 'contrastData'));
    } else if (item === 'customerspacialinstructions') {
      lookupStages.push(createLookupStage(item, 'specialIntructionID', '_id', 'specialInstructionData'));
    } else if (item === 'customermesurments') {
      lookupStages.push(createLookupStage(item, 'measurementID', '_id', 'measurementData'));
    }

    else if (item === 'customerproductalterations') {
      lookupStages.push(createLookupStage(item, 'ProductAlterationID', '_id', 'producAltreationtData'));
    } else if (item === 'customermesurmentalterations') {
      console.log(item, "item..........................................................")
      lookupStages.push(createLookupStage(item, 'measurementAlterationID', '_id', 'measuremenAltreationtData'));
    } else if (item === 'customerspacialinstructionaltreations') {
      console.log("jbwehbfhbhjbvjbgjfbdgjhbvcxjbnjkbnasjdbnjhubnulizxd")
      lookupStages.push(createLookupStage(item, 'specialIntructionAlterationID', '_id', 'specialInstructionAltreationData'));
    }


    else if (item === 'customerreadymadeproducts') {
      lookupStages.push(createLookupStage(item, 'readyMadeProductID', '_id', 'readymadeProductData'));
    } else if (item === 'customerreadymadeaccessories') {
      lookupStages.push(createLookupStage(item, 'readyMadeAccessoriesID', '_id', 'readymadeAccessoriesData'));
    }

  }

  return lookupStages;
};
const createDynamicLookupStagesOnline = (keywords) => {
  let lookupStages = [];

  for (const item of keywords) {
    if (item === 'customerproductonlines') {
      lookupStages.push(createLookupStage(item, 'productID', '_id', 'productData'));
    } else if (item === 'customerinvoiceonlines') {
      lookupStages.push(createLookupStage(item, 'billInvoiceID', '_id', 'billingData'));
    } else if (item === 'onlinecustomers') {
      lookupStages.push(createLookupStage(item, 'customerID', '_id', 'customerData'));
    } else if (item === 'customercontrastonlines') {
      lookupStages.push(createLookupStage(item, 'constrastID', '_id', 'contrastData'));
    } else if (item === 'customersplinstructiononlines') {
      lookupStages.push(createLookupStage(item, 'specialIntructionID', '_id', 'specialInstructionData'));
    } else if (item === 'customermesurmentonlines') {
      lookupStages.push(createLookupStage(item, 'measurementID', '_id', 'measurementData'));
    } else if (item === 'customerreadymadeproductonlines') {
      lookupStages.push(createLookupStage(item, 'readyMadeProductID', '_id', 'readymadeProductData'));
    } else if (item === 'customerreadymadeaccessoriesonlines') {
      lookupStages.push(createLookupStage(item, 'readyMadeAccessoriesID', '_id', 'readymadeAccessoriesData'));
    }

  }

  return lookupStages;
};

const createDynamicLookupStages = (keywords) => {
  let lookupStages = [];
console.log(keywords, "keywoprds......................")
  for (const item of keywords) {
    if (item === 'customerproducts') {
      lookupStages.push(createLookupStage(item, 'productID', '_id', 'productData'));
    } else if (item === 'offlinecustomerb2cs') {
      lookupStages.push(createLookupStage(item, 'customerID', '_id', 'customerData'));
    } else if (item === 'customerinvoices') {
      lookupStages.push(createLookupStage(item, 'billInvoiceID', '_id', 'billingData'));
    } else if (item === 'customercontrasts') {
      lookupStages.push(createLookupStage(item, 'constrastID', '_id', 'contrastData'));
    } else if (item === 'customerspacialinstructions') {
      lookupStages.push(createLookupStage(item, 'specialIntructionID', '_id', 'specialInstructionData'));
    } else if (item === 'customermesurments') {
      lookupStages.push(createLookupStage(item, 'measurementID', '_id', 'measurementData'));
    } else if (item === 'customerproductalterations') {
      lookupStages.push(createLookupStage(item, 'ProductAlterationID', '_id', 'altreationProductData'));
    }

    else if (item === 'customermesurmentalterations') {
      lookupStages.push(createLookupStage(item, 'measurementAlterationID', '_id', 'measurementAlterationData'));
    } else if (item === 'customerspacialinstructionaltreations') {
      lookupStages.push(createLookupStage(item, 'specialIntructionAlterationID', '_id', 'specialAlterationInstructionData'));
    }


    //
    // altreationMeasurementData: '$altreationMeasurementData',
    // altreationSpecialInstructionData: '$altreationSpecialInstructionData'
    // Online 
    else if (item === 'customerproductonlines') {
      lookupStages.push(createLookupStage(item, 'productID', '_id', 'productData'));
    }
    else if (item === 'customerinvoiceonlines') {
      lookupStages.push(createLookupStage(item, 'billInvoiceID', '_id', 'billingData'));
    } else if (item === 'onlinecustomers') {
      lookupStages.push(createLookupStage(item, 'customerID', '_id', 'customerData'));
    } else if (item === 'customercontrastonlines') {
      lookupStages.push(createLookupStage(item, 'constrastID', '_id', 'contrastData'));
    } else if (item === 'customersplinstructiononlines') {
      lookupStages.push(createLookupStage(item, 'specialIntructionID', '_id', 'specialInstructionData'));
    } else if (item === 'customermesurmentonlines') {
      lookupStages.push(createLookupStage(item, 'measurementID', '_id', 'measurementData'));
    } else if (item === 'customerreadymadeproducts') {
      lookupStages.push(createLookupStage(item, 'readyMadeProductID', '_id', 'readymadeProductData'));
    } else if (item === 'customerreadymadeaccessories') {
      lookupStages.push(createLookupStage(item, 'readyMadeAccessoriesID', '_id', 'readymadeAccessoriesData'));
    } else if (item === 'customerreadymadeproductonlines') {
      lookupStages.push(createLookupStage(item, 'readyMadeProductID', '_id', 'readymadeProductData'));
    } else if (item === 'customerreadymadeaccessoriesonlines') {
      lookupStages.push(createLookupStage(item, 'readyMadeAccessoriesID', '_id', 'readymadeAccessoriesData'));
    } else if (item === 'quickorderstatuses') {
      lookupStages.push(createLookupStage(item, 'orderId', '_id', 'quickOrderStatus'));
    } else if (item === 'quickorderstatusonlines') {
      lookupStages.push(createLookupStage(item, 'orderId', '_id', 'quickOrderStatusonline'));
    }
  }

  return lookupStages;
};

module.exports = { commonPipelineService, showingResults, createLookupStage, createDynamicLookupStagesOffline, createDynamicLookupStagesOnline, commonLoopkupPipelineService, createDynamicLookupStages, commonLoopkupIndependentPipelineService };





