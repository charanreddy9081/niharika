/**
 * CMS public routes — no auth required
 * Mounted at /api/cms
 */
const express = require('express');
const router = express.Router();
const cms = require('../controllers/cmsController');

router.get('/faqs',             cms.getFaqs);
router.get('/testimonials',     cms.getTestimonials);
router.get('/settings',         cms.getSettings);
router.get('/social-links',     cms.getSocialLinks);
router.get('/seo',              cms.getSeoSettings);
router.get('/seo/:slug',        cms.getSeoSettings);

module.exports = router;
