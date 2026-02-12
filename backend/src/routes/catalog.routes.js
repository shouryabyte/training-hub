const { Router } = require("express");

const { publicCatalog } = require("../controllers/catalog.controller");
const { listCourses } = require("../controllers/courses.controller");

const r = Router();

r.get("/public/catalog", publicCatalog);
r.get("/public/courses", listCourses);

module.exports = r;
