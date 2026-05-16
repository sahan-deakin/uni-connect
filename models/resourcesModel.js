const resourceSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      minlength: [5,   'Title must be at least 5 characters'],
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
 
    description: {
      type:      String,
      required:  [true, 'Description is required'],
      trim:      true,
      minlength: [20,  'Description must be at least 20 characters'],
      maxlength: [600, 'Description must be 600 characters or fewer'],
    },
 
    unitCode: {
      type:      String,
      required:  [true, 'Unit code is required'],
      trim:      true,
      uppercase: true,
      maxlength: [10, 'Unit code must be 10 characters or fewer'],
      index:     true,   // indexed — the most common filter on the resources page
    },
 
    resourceType: {
      type:     String,
      required: [true, 'Resource type is required'],
      enum: {
        values:  ['Notes', 'Past Exam', 'Slides', 'Video Link', 'Textbook', 'Other'],
        message: '{VALUE} is not a valid resource type',
      },
    },
 
    topicTags: {
      type:    [String],
      default: [],
      validate: {
        validator: arr => arr.length <= 8,
        message:   'You may add a maximum of 8 topic tags',
      },
      // Each tag is sanitised in the route before saving (lowercase, alphanumeric only)
    },

     uploaderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Uploader is required'],
      index:    true,   // indexed for "my uploads" queries on the profile page
    },
 

    // storageType drives which serving strategy the download route uses.
    storageType: {
      type:     String,
      required: [true, 'Storage type is required'],
      enum: {
        values:  ['local', 's3', 'url'],
        message: '{VALUE} is not a valid storage type',
      },
    },
 
    // Populated when storageType is 'local' or 's3'.
    // For local: relative path from project root e.g. 'uploads/resources/1234-notes.pdf'
    // For s3:    S3 object key e.g. 'resources/2026/05/1234-notes.pdf'
    filePath: {
      type: String,
      trim: true,
    },
 
    // The filename shown to users on download (their original filename, not the stored key)
    originalFileName: {
      type: String,
      trim: true,
    },
 
    // Populated when storageType is 'url' (Google Drive, YouTube, OneDrive, etc.)
    url: {
      type: String,
      trim: true,
    },
    
    // e.g. 'application/pdf', 'image/png'. Null when storageType is 'url'.
    mimeType: {
      type: String,
      trim: true,
    },

    // File size in bytes. Null when storageType is 'url'.
    fileSize: {
      type: Number,
      min:  0,
    },
  },
  {
    // Get time created in real-time
    timestamps: true,
  }
);


module.exports = mongoose.model('Resource', resourceSchema);