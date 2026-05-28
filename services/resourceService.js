const Resource = require('../models/resourceModel');

// Get all resources
exports.getAllResources = async () => {
  return await Resource.find().sort({ createdAt: -1 });
};

// Get resource by ID
exports.getResourceById = async (id) => {
  return await Resource.findById(id);
};

// Create resource
exports.createResource = async (resourceData) => {
  const resource = new Resource(resourceData);

  return await resource.save();
};

// Delete resource
exports.deleteResource = async (id) => {
  return await Resource.findByIdAndDelete(id);
};

// Upvote resource
exports.upvoteResource = async (id) => {
  return await Resource.findByIdAndUpdate(
    id,
    { $inc: { upvotes: 1 } },
    { new: true }
  );
};