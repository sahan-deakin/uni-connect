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

    const resourceData = {

      title: req.body.title,

  desc: req.body.desc,

  type: req.body.type,

  unit: req.body.unit,

  institution: req.body.institution,

  uploader: req.body.uploader,

  upvotes: Number(req.body.upvotes || 0),

  score: Number(req.body.score || 70),

  downloadCount: Number(req.body.downloadCount || 0),

  tags: req.body.tags
    ? JSON.parse(req.body.tags)
    : [],

  fileUrl: req.file
    ? `/uploads/${req.file.filename}`
    : null,

  originalFileName: req.file
    ? req.file.originalname
    : null,

      fileUrl: req.file
        ? `/uploads/${req.file.filename}`
        : null,

      originalFileName: req.file
        ? req.file.originalname
        : null
    };

    const resource =
      await resourceService.createResource(resourceData);

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
/* exports.deleteResource = async (req, res) => {
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
}; */

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

const Resource = require('../models/resourceModel');

// GET /api/resources/reported
// Returns all resources that have an unresolved report — for admin panel
exports.getReportedResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({
      'report': { $ne: null },
      'report.isResolved': false
    })
      .populate('uploadedBy', 'name email')
      .sort({ 'report.reportedAt': -1 })
      .lean();
    res.json(resources);
  } catch (err) {
    next(err);
  }
};

// POST /api/resources/:id/report
// Body: { reason: string }
// Submits a report against a resource
exports.reportResource = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A reason is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Only allow one active report at a time
    if (resource.report && !resource.report.isResolved) {
      return res.status(409).json({ error: 'This resource has already been reported and is pending review' });
    }

    resource.report = {
      reason: reason.trim(),
      reportedAt: new Date(),
      isResolved: false
    };
    await resource.save();

    res.json({ message: 'Report submitted successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/resources/:id/resolve-report
// Marks the report on a resource as resolved (admin action)
exports.resolveResourceReport = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { 'report.isResolved': true, 'report.resolvedAt': new Date() },
      { new: true }
    );
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Report resolved', resource });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resources/:id
// Removes a resource entirely (admin action — content takedown)
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
};
