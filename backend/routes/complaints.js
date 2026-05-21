const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Complaint = require('../models/Complaint');
const router = express.Router();

router.post('/', auth, roleCheck('student'), async (req, res) => {
  try {
    const { subject, category, description, priority } = req.body;
    const complaint = new Complaint({
      subject,
      category,
      description,
      priority,
      userId: req.user.id
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let complaints;
    if (req.user.role === 'admin') {
      complaints = await Complaint.find().populate('userId', 'name email');
    } else {
      complaints = await Complaint.find({ userId: req.user.id });
    }
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.put('/:id/status', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'review', 'resolved'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
    complaint.status = status;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;