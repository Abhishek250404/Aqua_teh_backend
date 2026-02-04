const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// ✅ Mail transporter (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Optional: verify mail config on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail config error:", error);
  } else {
    console.log("✅ Mail server ready");
  }
});

// =======================
// CREATE CONTACT
// =======================
// exports.createContact = async (req, res) => {
//   try {
//     const { name, phone, message } = req.body;

//     if (!name || !phone || !message) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const contact = new Contact({ name, phone, message });
//     const savedContact = await contact.save();

//     await transporter.sendMail({
//       from: `"Aqua Tech RO System" <${process.env.EMAIL_USER}>`,
//       to: process.env.EMAIL_USER,
//       subject: `🔔 New RO Enquiry - ${name}`,
//       html: `
// <div style="
//     font-family: 'Arial', sans-serif;
//     max-width: 600px;
//     margin: auto;
//     padding: 25px;
//     border-radius: 15px;
//     background-color: #f0f4f8;
//     color: #333;
//     box-shadow: 0 4px 10px rgba(0,0,0,0.05);
// ">
//   <!-- Header -->
//   <div style="
//       text-align: center;
//       background: linear-gradient(90deg, #00c6ff, #0072ff);
//       color: #fff;
//       padding: 15px 0;
//       border-radius: 12px 12px 0 0;
//       font-size: 22px;
//       font-weight: bold;
//   ">
//     💧 New RO Enquiry
//   </div>

//   <!-- Content -->
//   <div style="padding: 20px;">
//     <p style="margin: 10px 0; font-size: 16px;"><strong>Name:</strong> <span style="color: #0072ff;">${name}</span></p>
//     <p style="margin: 10px 0; font-size: 16px;"><strong>Phone:</strong> <span style="color: #0072ff;">${phone}</span></p>
//     <p style="margin: 10px 0; font-size: 16px;"><strong>Message:</strong><br/>
//       <span style="background-color: #e0f0ff; padding: 8px 12px; border-radius: 8px; display: inline-block;">
//         ${message}
//       </span>
//     </p>
//   </div>

//   <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />

//   <!-- Footer -->
//   <div style="text-align: center; font-size: 14px; color: #555;">
//     📅 <strong>Date/Time:</strong> <span style="color: #0072ff;">${new Date().toLocaleString()}</span>
//   </div>

//   <div style="text-align: center; font-size: 12px; color: #888; margin-top: 10px;">
//     🌐 Aqua Tech RO System
//   </div>
// </div>
// `,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Contact saved & email sent successfully",
//       data: savedContact,
//     });
//   } catch (err) {
//     console.error("❌ Mail Error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
exports.createContact = async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = new Contact({ name, phone, message });
    const savedContact = await contact.save();

    // ====== send email safely ======
    const mailPromise = transporter.sendMail({
      from: `"Aqua Tech RO System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🔔 New RO Enquiry - ${name}`,
      html: `<p>Name: ${name}</p><p>Phone: ${phone}</p><p>Message: ${message}</p>`,
    });

    // set a timeout (e.g., 5 seconds) to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Mail timeout")), 5000)
    );

    // race between mail send and timeout
    await Promise.race([mailPromise, timeoutPromise])
      .then(() => console.log("✅ Mail sent"))
      .catch(err => console.warn("⚠️ Mail failed or timed out:", err.message));

    return res.status(201).json({
      success: true,
      message: "Contact saved & email attempted (check logs)",
      data: savedContact,
    });
  } catch (err) {
    console.error("❌ Error in createContact:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// =======================
// READ ALL
// =======================
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// READ ONE
// =======================
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Not found" });
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// UPDATE
// =======================
exports.updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedContact) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// DELETE
// =======================
exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
