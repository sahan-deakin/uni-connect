const Resource = require('../models/Resource');

async function createResource(fields, file, uploaderId) {
  const { title, unitCode, resourceType, description, tags, uploadMethod, resourceUrl } = fields;
 
  const data = {
    title:        title.trim(),
    description:  description.trim(),
    unitCode:     unitCode.trim().toUpperCase(),
    resourceType,
    topicTags:    parseTags(tags),
    uploaderId,
    storageType:  uploadMethod === 'url' ? 'url' : null, // set below for file
  };
}