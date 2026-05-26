const resourceService = require('../services/resourceService');

// GET all resources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await resourceService.getAllResources();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET single resource
exports.getResourceById = async (req, res) => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// CREATE resource
exports.createResource = async (req, res) => {
  try {
    const resource = await resourceService.createResource(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE resource
exports.deleteResource = async (req, res) => {
  try {
    const deleted = await resourceService.deleteResource(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// UPVOTE resource
exports.upvoteResource = async (req, res) => {
  try {
    const updated = await resourceService.upvoteResource(req.params.id);

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};