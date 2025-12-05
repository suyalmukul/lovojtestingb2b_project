const dbServices = {
  createDocument: async (model, data) => {
    return await model.create(data);
  },

  updateDocumentById: async (model, id, data) => {
    if (id) {
      return await model.findByIdAndUpdate(id, data, { new: true });
    }
    return null;
  },

  updateDocument: async (model, query, data) => {
    return await model.updateMany(query, { $set: data }, { new: true });
  },

  updateOneDocument: async (model, query, data) => {
    return await model.updateOne(query, { $set: data }, { new: true });
  },

  findById: async (model, id) => {
    if (id) {
      return await model.findById(id);
    }
    return null;
  },

  findOneAndUpdate: async (model, query, data) => {
    return await model.findOneAndUpdate(query, data,  { new: true });
  },

  findOneAndRemove: async (model, query) => {
    return await model.findOneAndRemove(query);
  },
  
  findByIdAndRemove: async (model, id) => {
    if (id) {
      return await model.findByIdAndRemove(id);
    }
    return null;
  },

  findDocuments: async (model, query = {}) => {
    return await model.find(query);
  },

  findOneDocument: async (model, query = {}) => {
    return await model.findOne(query);
  },

  countDocuments: async (model, query = {}) => {
    return await model.countDocuments(query);
  },

  removeDocumentById: async (model, id) => {
    if (id) {
      return await model.findByIdAndRemove(id);
    }
    return null;
  },

  deleteDocumentById: async (model, id) => {
    if (id) {
      return await model.deleteOne({ _id: id });
    }
    return null;
  },

  deleteDocuments: async (model, query = {}) => {
    return await model.deleteMany(query);
  },
};

module.exports = dbServices;
