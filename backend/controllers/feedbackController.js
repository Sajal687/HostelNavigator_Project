const Feedback = require('../models/feedback');


async function createFeedback(req, res) {
  try {
    const { hostel, user, rating, comment } = req.body;
    const feedback = new Feedback({
      hostel,
      user,
      rating,
      comment,
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the feedback.' });
  }
}


async function getAllFeedbacks(req, res) {
  try {
    const feedbacks = await Feedback.find().populate('hostel').populate('user');
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the feedbacks.' });
  }
}

module.exports = {
  createFeedback,
  getAllFeedbacks,
};
