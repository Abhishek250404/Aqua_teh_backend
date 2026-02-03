const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// CREATE
router.post("/", contactController.createContact);

// READ all
router.get("/", contactController.getContacts);

// READ single
router.get("/:id", contactController.getContact);

// UPDATE
router.put("/:id", contactController.updateContact);

// DELETE
router.delete("/:id", contactController.deleteContact);

module.exports = router;
