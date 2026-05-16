const resourceService = require('../services/resourceService');
const { getDownloadUrl } = require('../services/storageService');

//Get resources
async function index(req, res) {
  try {
    const { unit, type, tag, q, sort = 'score', page = 1 } = req.query;
 
    const { resources, total, pages } = await resourceService.getResources({
      filters: { unitCode: unit, resourceType: type, topicTag: tag, q },
      sort,
      page:  parseInt(page, 10) || 1,
      limit: 6,
    });
 
    res.render('resources/index', {
      user:      req.user || null,
      pageTitle: 'Resource Library',
      resources,
      total,
      pages,
      currentPage: parseInt(page, 10) || 1,
      filters: { unit, type, tag, q, sort },
    });
  } catch (err) {
    console.error('[resourceController.index]', err);
    res.status(500).render('error', {
      user:    req.user || null,
      message: 'Could not load resources. Please try again.',
    });
  }
}