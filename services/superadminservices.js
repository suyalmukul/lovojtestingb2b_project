
const countPipelineService = (matchQuery) => {

    const countPipeline = [
      { $match: matchQuery },
      { $group: { _id: null, totalCount: { $sum: 1 } } },
      { $sort: { createdAt: -1 } },
  
    ]
  
    return countPipeline;
  }

const SuperadmincommonPipelineService = (matchQuery, query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 8;
    
    // Extracting search parameters from query
    const {
      search,
      storeType,
      id,
      storeNumber,
      name,
    } = query;
  
    // If search parameters are provided, construct the $or query for search
    if (search || storeType || id || storeNumber || name) {
      const orConditions = [];
  
      if (search) {
        orConditions.push(
          { storeNumber: { $regex: search, $options: "i" } },
          { storeType: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } }
        );
      }
      if (storeType) {
        orConditions.push({ storeType: { $regex: storeType, $options: "i" } });
      }
      if (id) {
        orConditions.push({ id });
      }
      if (storeNumber) {
        orConditions.push({ storeNumber });
      }
      if (name) {
        orConditions.push({ name: { $regex: name, $options: "i" } });
      }
  
      // Adding $or condition to matchQuery
      matchQuery.$or = orConditions;
    }
  
    const pipeline = [
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];
  
    const countPipeline = countPipelineService(matchQuery);
  
    return { pipeline, countPipeline };
  };
  module.exports = { SuperadmincommonPipelineService };