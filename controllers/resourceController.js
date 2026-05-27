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
