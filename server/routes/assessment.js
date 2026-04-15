const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const {
  QUESTION_BANK,
  getAssessmentDate,
  getDailyQuestionSet,
  scoreAssessment
} = require('../assessment-data');

router.get('/today', authenticateToken, (req, res) => {
  try {
    const assessmentDate = getAssessmentDate();
    const existing = db.prepare(
      'SELECT summary_json FROM daily_assessments WHERE user_id = ? AND assessment_date = ?'
    ).get(req.user.id, assessmentDate);

    res.json({
      assessmentDate,
      completed: !!existing,
      questions: getDailyQuestionSet(req.user.id, assessmentDate),
      summary: existing ? JSON.parse(existing.summary_json) : null
    });
  } catch (err) {
    console.error('Assessment today error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/submit', authenticateToken, (req, res) => {
  try {
    const assessmentDate = getAssessmentDate();
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

    if (answers.length !== 15) {
      return res.status(400).json({ error: 'Please answer all 15 daily questions.' });
    }

    const existing = db.prepare(
      'SELECT summary_json FROM daily_assessments WHERE user_id = ? AND assessment_date = ?'
    ).get(req.user.id, assessmentDate);

    if (existing) {
      return res.json({
        message: 'Today\'s reflection was already submitted.',
        summary: JSON.parse(existing.summary_json)
      });
    }

    const todayQuestionIds = new Set(getDailyQuestionSet(req.user.id, assessmentDate).map(item => item.id));
    const normalizedAnswers = answers.map(answer => ({
      question_id: answer.question_id,
      option_key: String(answer.option_key || '').toUpperCase()
    }));

    for (const answer of normalizedAnswers) {
      const question = QUESTION_BANK.find(item => item.id === answer.question_id);
      if (!todayQuestionIds.has(answer.question_id) || !question?.options?.[answer.option_key]) {
        return res.status(400).json({ error: 'Invalid daily answer set submitted.' });
      }
    }

    const summary = scoreAssessment(normalizedAnswers);
    const insertAssessment = db.prepare(
      'INSERT INTO daily_assessments (user_id, assessment_date, question_count, summary_json, completed_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    );
    const insertAnswer = db.prepare(
      'INSERT INTO daily_assessment_answers (assessment_id, question_id, question_text, option_key, option_text, category) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      const result = insertAssessment.run(req.user.id, assessmentDate, normalizedAnswers.length, JSON.stringify(summary));
      for (const answer of normalizedAnswers) {
        const question = QUESTION_BANK.find(item => item.id === answer.question_id);
        insertAnswer.run(
          result.lastInsertRowid,
          answer.question_id,
          question.question,
          answer.option_key,
          question.options[answer.option_key].text,
          question.category
        );
      }
    });
    transaction();

    db.prepare('UPDATE user_progress SET xp = xp + 20 WHERE user_id = ?').run(req.user.id);
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user.id,
      'daily_assessment',
      `Mind scan complete: ${summary.summaryLabel}`
    );

    res.status(201).json({
      message: 'Daily reflection saved. +20 XP',
      summary
    });
  } catch (err) {
    console.error('Assessment submit error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/history', authenticateToken, (req, res) => {
  try {
    const entries = db.prepare(
      'SELECT id, assessment_date, summary_json, created_at FROM daily_assessments WHERE user_id = ? ORDER BY assessment_date DESC LIMIT 10'
    ).all(req.user.id)
      .map(item => ({
        id: item.id,
        assessment_date: item.assessment_date,
        created_at: item.created_at,
        summary: JSON.parse(item.summary_json)
      }));

    res.json({ entries });
  } catch (err) {
    console.error('Assessment history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/latest', authenticateToken, (req, res) => {
  try {
    const latest = db.prepare(
      'SELECT assessment_date, summary_json, created_at FROM daily_assessments WHERE user_id = ? ORDER BY assessment_date DESC LIMIT 1'
    ).get(req.user.id);

    res.json({
      entry: latest ? {
        assessment_date: latest.assessment_date,
        created_at: latest.created_at,
        summary: JSON.parse(latest.summary_json)
      } : null
    });
  } catch (err) {
    console.error('Assessment latest error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
