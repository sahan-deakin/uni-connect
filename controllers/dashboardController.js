const Student = require('../models/studentModel');
const Resource = require('../models/resourceModel');
const Event = require('../models/eventModel');
const ForumPost = require('../models/forumPostModel');
const Notification = require('../models/notificationModel');

async function resolveStudent(req, res) {
  const { studentId } = req.user;
  if (!studentId) {
    res.status(404).json({ error: 'Student profile not found for your account' });
    return null;
  }
  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
    return null;
  }
  return student;
}

// Feature 1: Personalized Academic Feed
const getPersonalizedFeed = async (req, res) => {
  try {
    const student = await getDemoStudent();
    if (!student) {
      return res.status(404).json({ error: 'Demo student not found. Run: npm run seed:dashboard' });
    }

    const { unitCodes, interests, skills } = student;
    const relevantTags = [...interests, ...skills];

    const [resources, events, forums] = await Promise.all([
      Resource.find({ unitCode: { $in: unitCodes } })
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(6),

      Event.find({
        date: { $gte: new Date() },
        $or: [
          { unitCodes: { $in: unitCodes } },
          { tags: { $in: relevantTags } }
        ]
      }).sort({ date: 1 }).limit(6),

      ForumPost.find({
        $or: [
          { unitCode: { $in: unitCodes } },
          { tags: { $in: relevantTags } }
        ]
      })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    res.json({
      student: {
        name: student.name,
        university: student.university,
        course: student.course,
        unitCodes: student.unitCodes
      },
      feed: { resources, events, forums }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feature 3: Real-Time Notifications
const getNotifications = async (req, res) => {
  try {
    const student = await resolveStudent(req, res);
    if (!student) return;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(20),
      Notification.countDocuments({ studentId: student._id, read: false })
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const student = await resolveStudent(req, res);
    if (!student) return res.json({ count: 0 });

    const count = await Notification.countDocuments({ studentId: student._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const student = await resolveStudent(req, res);
    if (!student) return;

    await Notification.updateMany({ studentId: student._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feature 4: Integrated Study & Event Tracker
const getTrackerData = async (req, res) => {
  try {
    const student = await resolveStudent(req, res);
    if (!student) return;

    const [myResources, myEvents, myPosts] = await Promise.all([
      Resource.find({ uploadedBy: student._id }).sort({ createdAt: -1 }),
      Event.find({ registeredStudents: student._id }).sort({ date: 1 }),
      ForumPost.find({ author: student._id }).sort({ createdAt: -1 })
    ]);

    const totalDownloads = myResources.reduce((sum, r) => sum + r.downloadCount, 0);

    res.json({
      stats: {
        resourcesUploaded: myResources.length,
        eventsRegistered: myEvents.length,
        forumPosts: myPosts.length,
        totalDownloads
      },
      myResources,
      myEvents,
      myPosts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPersonalizedFeed,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  getTrackerData
};
