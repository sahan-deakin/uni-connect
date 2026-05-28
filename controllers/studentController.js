const Resource = require('../models/resourceModel');
const ForumPost = require('../models/forumPostModel');
const Event = require('../models/eventModel');

// DELETE /api/student/resources/:id
exports.deleteResource = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const resource = await Resource.findOneAndDelete({ _id: req.params.id, uploadedBy: studentId });
    if (!resource) return res.status(404).json({ error: 'Resource not found or not authorized' });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/student/forum-posts/:id
exports.deleteForumPost = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const post = await ForumPost.findOneAndDelete({ _id: req.params.id, author: studentId });
    if (!post) return res.status(404).json({ error: 'Post not found or not authorized' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/student/events/:id
// Deletes the event if student is the creator; otherwise unregisters them
exports.deleteOrUnregisterEvent = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isCreator = event.createdBy && event.createdBy.toString() === studentId.toString();
    if (isCreator) {
      await Event.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Event deleted', action: 'deleted' });
    }

    const isRegistered = event.registeredStudents.some(id => id.toString() === studentId.toString());
    if (!isRegistered) return res.status(403).json({ error: 'Not authorized' });

    await Event.findByIdAndUpdate(req.params.id, { $pull: { registeredStudents: studentId } });
    return res.json({ message: 'Unregistered from event', action: 'unregistered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/student/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) return res.status(403).json({ error: 'Student profile not found' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.createdBy || event.createdBy.toString() !== studentId.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this event' });
    }

    const { title, description, date, location, type, isOnline, tags, unitCodes } = req.body;
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, location, type, isOnline, tags, unitCodes, status: 'pending' },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
