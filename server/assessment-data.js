const QUESTION_BANK = [
  {
    id: 'cl-1',
    category: 'Cognitive Load & Mental Processing',
    question: 'When multiple tasks come at once, your first reaction is:',
    options: {
      A: { text: 'Prioritize calmly', effects: { focus: 3, calm: 2, happy: 1, stress: -1 } },
      B: { text: 'Make a quick list', effects: { focus: 2, clarity: 2, calm: 1 } },
      C: { text: 'Feel mentally scattered', effects: { stress: 3, clarity: -2, focus: -2, overload: 2 } },
      D: { text: 'Freeze briefly before acting', effects: { stress: 2, resilience: -2, overload: 3, focus: -1 } }
    }
  },
  {
    id: 'cl-2',
    category: 'Cognitive Load & Mental Processing',
    question: 'While doing a task, your mind usually:',
    options: {
      A: { text: 'Stays on track', effects: { focus: 3, clarity: 2 } },
      B: { text: 'Slightly drifts but returns', effects: { focus: 1, balance: 1 } },
      C: { text: 'Frequently jumps elsewhere', effects: { focus: -3, stress: 1, overload: 2 } },
      D: { text: 'Struggles to stay present', effects: { focus: -3, clarity: -2, overload: 3 } }
    }
  },
  {
    id: 'cl-3',
    category: 'Cognitive Load & Mental Processing',
    question: 'When reading or listening today, you:',
    options: {
      A: { text: 'Absorbed everything easily', effects: { clarity: 3, focus: 2, happy: 1 } },
      B: { text: 'Missed minor details', effects: { clarity: 1 } },
      C: { text: 'Had to re-read/rethink often', effects: { clarity: -2, focus: -1, stress: 2 } },
      D: { text: 'Could barely focus', effects: { focus: -3, clarity: -3, overload: 2 } }
    }
  },
  {
    id: 'cl-4',
    category: 'Cognitive Load & Mental Processing',
    question: 'Your internal mental speed today felt:',
    options: {
      A: { text: 'Smooth and steady', effects: { balance: 3, calm: 2, clarity: 1 } },
      B: { text: 'Slightly slow', effects: { energy: -1, clarity: 1 } },
      C: { text: 'Uneven', effects: { balance: -2, stress: 1, overload: 1 } },
      D: { text: 'Overloaded', effects: { overload: 4, stress: 2, focus: -1 } }
    }
  },
  {
    id: 'cl-5',
    category: 'Cognitive Load & Mental Processing',
    question: 'When interrupted during work, you:',
    options: {
      A: { text: 'Continue easily', effects: { resilience: 3, focus: 2 } },
      B: { text: 'Adjust with effort', effects: { resilience: 1, balance: 1 } },
      C: { text: 'Lose flow quickly', effects: { focus: -2, stress: 1, overload: 1 } },
      D: { text: 'Struggle to restart', effects: { focus: -2, resilience: -2, overload: 2 } }
    }
  },
  {
    id: 'er-1',
    category: 'Emotional Reactivity Patterns',
    question: 'When something small went wrong today, you:',
    options: {
      A: { text: 'Let it pass easily', effects: { calm: 3, resilience: 2, happy: 1 } },
      B: { text: 'Felt mildly annoyed', effects: { calm: 1 } },
      C: { text: 'Reacted emotionally', effects: { stress: 2, calm: -1, overthinking: 1 } },
      D: { text: 'Felt disproportionately affected', effects: { stress: 3, calm: -2, overload: 2 } }
    }
  },
  {
    id: 'er-2',
    category: 'Emotional Reactivity Patterns',
    question: 'If someone disagreed with you, you tended to:',
    options: {
      A: { text: 'Stay open', effects: { social: 2, resilience: 2, calm: 1 } },
      B: { text: 'Explain your view calmly', effects: { social: 2, clarity: 1 } },
      C: { text: 'Feel slightly defensive', effects: { social: -1, stress: 1 } },
      D: { text: 'Feel personally affected', effects: { stress: 2, resilience: -2, social: -1 } }
    }
  },
  {
    id: 'er-3',
    category: 'Emotional Reactivity Patterns',
    question: 'Emotional shifts today felt:',
    options: {
      A: { text: 'Smooth', effects: { balance: 3, calm: 2 } },
      B: { text: 'Gradual', effects: { balance: 2 } },
      C: { text: 'Sudden', effects: { balance: -2, stress: 1 } },
      D: { text: 'Unpredictable', effects: { balance: -3, overload: 2, stress: 2 } }
    }
  },
  {
    id: 'er-4',
    category: 'Emotional Reactivity Patterns',
    question: 'When thinking about past events today, you felt:',
    options: {
      A: { text: 'Neutral', effects: { calm: 2, resilience: 1 } },
      B: { text: 'Reflective', effects: { clarity: 1, balance: 1 } },
      C: { text: 'Slightly emotional', effects: { overthinking: 1, stress: 1 } },
      D: { text: 'Deeply affected', effects: { overthinking: 2, stress: 2, calm: -1 } }
    }
  },
  {
    id: 'er-5',
    category: 'Emotional Reactivity Patterns',
    question: 'Your emotional control today felt:',
    options: {
      A: { text: 'Strong', effects: { resilience: 3, calm: 2, balance: 1 } },
      B: { text: 'Moderate', effects: { resilience: 1 } },
      C: { text: 'Inconsistent', effects: { balance: -1, stress: 1 } },
      D: { text: 'Weak', effects: { resilience: -3, stress: 2, overload: 1 } }
    }
  },
  {
    id: 'ot-1',
    category: 'Thought Loops & Overthinking',
    question: 'When a problem appears, your thinking pattern is:',
    options: {
      A: { text: 'Solution-first', effects: { clarity: 2, resilience: 2, focus: 1 } },
      B: { text: 'Balanced analysis', effects: { clarity: 2, balance: 1 } },
      C: { text: 'Repetitive thinking', effects: { overthinking: 3, stress: 1 } },
      D: { text: 'Mental spiraling', effects: { overthinking: 4, overload: 2, stress: 2 } }
    }
  },
  {
    id: 'ot-2',
    category: 'Thought Loops & Overthinking',
    question: 'You found yourself revisiting the same thought:',
    options: {
      A: { text: 'Rarely', effects: { calm: 2, overthinking: -1 } },
      B: { text: 'Sometimes', effects: { overthinking: 1 } },
      C: { text: 'Often', effects: { overthinking: 3, stress: 1 } },
      D: { text: 'Persistently', effects: { overthinking: 4, stress: 2, overload: 1 } }
    }
  },
  {
    id: 'ot-3',
    category: 'Thought Loops & Overthinking',
    question: 'When making decisions, you:',
    options: {
      A: { text: 'Decide quickly', effects: { clarity: 2, resilience: 1 } },
      B: { text: 'Weigh briefly then decide', effects: { clarity: 2, balance: 1 } },
      C: { text: 'Overanalyze options', effects: { overthinking: 3, clarity: -1 } },
      D: { text: 'Struggle to decide at all', effects: { overthinking: 2, clarity: -2, overload: 2 } }
    }
  },
  {
    id: 'ot-4',
    category: 'Thought Loops & Overthinking',
    question: 'After conversations, you:',
    options: {
      A: { text: 'Move on easily', effects: { social: 1, calm: 2 } },
      B: { text: 'Think briefly about them', effects: { balance: 1 } },
      C: { text: 'Replay parts mentally', effects: { overthinking: 2, stress: 1 } },
      D: { text: 'Overthink what was said', effects: { overthinking: 4, social: -1, stress: 1 } }
    }
  },
  {
    id: 'ot-5',
    category: 'Thought Loops & Overthinking',
    question: 'Your mind during silence tends to:',
    options: {
      A: { text: 'Stay calm', effects: { calm: 3, balance: 2 } },
      B: { text: 'Wander slightly', effects: { balance: 1 } },
      C: { text: 'Become busy', effects: { overthinking: 2, overload: 1 } },
      D: { text: 'Become overwhelming', effects: { overthinking: 3, overload: 3, stress: 1 } }
    }
  },
  {
    id: 'sr-1',
    category: 'Stress Response & Pressure Handling',
    question: 'Under pressure today, you:',
    options: {
      A: { text: 'Became more focused', effects: { focus: 2, resilience: 2 } },
      B: { text: 'Stayed steady', effects: { resilience: 2, calm: 1 } },
      C: { text: 'Felt tense but managed', effects: { stress: 1, resilience: 1 } },
      D: { text: 'Felt mentally blocked', effects: { stress: 3, focus: -2, overload: 2 } }
    }
  },
  {
    id: 'sr-2',
    category: 'Stress Response & Pressure Handling',
    question: 'When deadlines are present, you tend to:',
    options: {
      A: { text: 'Feel motivated', effects: { motivation: 2, focus: 1 } },
      B: { text: 'Plan systematically', effects: { clarity: 2, focus: 1 } },
      C: { text: 'Feel anxious but act', effects: { stress: 2, motivation: 1 } },
      D: { text: 'Feel mentally overloaded', effects: { overload: 3, stress: 2, motivation: -1 } }
    }
  },
  {
    id: 'sr-3',
    category: 'Stress Response & Pressure Handling',
    question: 'Unexpected changes today made you feel:',
    options: {
      A: { text: 'Flexible', effects: { resilience: 2, balance: 2 } },
      B: { text: 'Slightly disturbed', effects: { balance: 1 } },
      C: { text: 'Stressed', effects: { stress: 2 } },
      D: { text: 'Disoriented', effects: { overload: 2, stress: 2, clarity: -1 } }
    }
  },
  {
    id: 'sr-4',
    category: 'Stress Response & Pressure Handling',
    question: 'When many things demand attention, you:',
    options: {
      A: { text: 'Organize naturally', effects: { focus: 2, clarity: 2, resilience: 1 } },
      B: { text: 'Handle step-by-step', effects: { balance: 2, focus: 1 } },
      C: { text: 'Feel pressure building', effects: { stress: 2, overload: 1 } },
      D: { text: 'Struggle to cope', effects: { overload: 3, stress: 2, resilience: -1 } }
    }
  },
  {
    id: 'sr-5',
    category: 'Stress Response & Pressure Handling',
    question: 'Your stress usually shows up as:',
    options: {
      A: { text: 'No noticeable signs', effects: { calm: 2, resilience: 1 } },
      B: { text: 'Mild tension', effects: { stress: 1 } },
      C: { text: 'Restlessness/irritation', effects: { stress: 2, balance: -1 } },
      D: { text: 'Mental shutdown', effects: { overload: 3, stress: 2, energy: -1 } }
    }
  },
  {
    id: 'se-1',
    category: 'Social Energy & Boundaries',
    question: 'After interacting with people today, you felt:',
    options: {
      A: { text: 'Energized', effects: { social: 3, energy: 2, happy: 1 } },
      B: { text: 'Neutral', effects: { social: 1 } },
      C: { text: 'Slightly drained', effects: { energy: -1, social: -1 } },
      D: { text: 'Exhausted', effects: { energy: -3, social: -2, overload: 1 } }
    }
  },
  {
    id: 'se-2',
    category: 'Social Energy & Boundaries',
    question: 'In conversations, you mostly:',
    options: {
      A: { text: 'Engage actively', effects: { social: 3, happy: 1 } },
      B: { text: 'Balance talking/listening', effects: { social: 2, balance: 1 } },
      C: { text: 'Listen more than speak', effects: { social: 1 } },
      D: { text: 'Avoid deep engagement', effects: { social: -2, stress: 1 } }
    }
  },
  {
    id: 'se-3',
    category: 'Social Energy & Boundaries',
    question: 'When someone expects something from you, you:',
    options: {
      A: { text: 'Respond comfortably', effects: { resilience: 2, social: 1 } },
      B: { text: 'Adjust if possible', effects: { balance: 1, social: 1 } },
      C: { text: 'Feel pressure', effects: { stress: 2, social: -1 } },
      D: { text: 'Feel overwhelmed', effects: { overload: 2, stress: 2, social: -1 } }
    }
  },
  {
    id: 'se-4',
    category: 'Social Energy & Boundaries',
    question: 'Your comfort in expressing disagreement is:',
    options: {
      A: { text: 'High', effects: { social: 2, resilience: 1, clarity: 1 } },
      B: { text: 'Moderate', effects: { social: 1 } },
      C: { text: 'Low', effects: { social: -1, stress: 1 } },
      D: { text: 'Avoidant', effects: { social: -2, stress: 2, overthinking: 1 } }
    }
  },
  {
    id: 'se-5',
    category: 'Social Energy & Boundaries',
    question: 'Social interactions today felt:',
    options: {
      A: { text: 'Natural', effects: { social: 3, happy: 1 } },
      B: { text: 'Manageable', effects: { social: 1, balance: 1 } },
      C: { text: 'Slightly forced', effects: { social: -1, stress: 1 } },
      D: { text: 'Draining', effects: { social: -2, energy: -2, stress: 1 } }
    }
  },
  {
    id: 'en-1',
    category: 'Energy Regulation Patterns',
    question: 'Your energy today was:',
    options: {
      A: { text: 'Stable', effects: { energy: 3, balance: 2 } },
      B: { text: 'Fluctuating slightly', effects: { energy: 1 } },
      C: { text: 'Frequently dropping', effects: { energy: -2, overload: 1 } },
      D: { text: 'Very inconsistent', effects: { energy: -3, overload: 2 } }
    }
  },
  {
    id: 'en-2',
    category: 'Energy Regulation Patterns',
    question: 'During the day, your body felt:',
    options: {
      A: { text: 'Relaxed', effects: { energy: 2, calm: 2 } },
      B: { text: 'Normal', effects: { energy: 1 } },
      C: { text: 'Heavy/tired', effects: { energy: -2 } },
      D: { text: 'Physically exhausted', effects: { energy: -3, overload: 2 } }
    }
  },
  {
    id: 'en-3',
    category: 'Energy Regulation Patterns',
    question: 'You needed breaks to function:',
    options: {
      A: { text: 'Rarely', effects: { energy: 2, focus: 1 } },
      B: { text: 'Occasionally', effects: { balance: 1 } },
      C: { text: 'Frequently', effects: { energy: -2, overload: 1 } },
      D: { text: 'Constantly', effects: { energy: -3, overload: 2, stress: 1 } }
    }
  },
  {
    id: 'en-4',
    category: 'Energy Regulation Patterns',
    question: 'Your pace of doing things was:',
    options: {
      A: { text: 'Natural', effects: { energy: 2, balance: 1 } },
      B: { text: 'Slightly slow', effects: { energy: -1 } },
      C: { text: 'Forced', effects: { stress: 1, energy: -1 } },
      D: { text: 'Sluggish', effects: { energy: -3, motivation: -1 } }
    }
  },
  {
    id: 'en-5',
    category: 'Energy Regulation Patterns',
    question: 'By end of day, your energy felt:',
    options: {
      A: { text: 'Still good', effects: { energy: 3, happy: 1 } },
      B: { text: 'Mildly reduced', effects: { energy: 1 } },
      C: { text: 'Low', effects: { energy: -2 } },
      D: { text: 'Depleted', effects: { energy: -3, overload: 2, stress: 1 } }
    }
  },
  {
    id: 'md-1',
    category: 'Motivation & Drive Patterns',
    question: 'Starting tasks today felt:',
    options: {
      A: { text: 'Automatic', effects: { motivation: 3, focus: 1 } },
      B: { text: 'Slightly delayed', effects: { motivation: 1 } },
      C: { text: 'Requires effort', effects: { motivation: -1, stress: 1 } },
      D: { text: 'Difficult to start', effects: { motivation: -3, overload: 1 } }
    }
  },
  {
    id: 'md-2',
    category: 'Motivation & Drive Patterns',
    question: 'You felt pulled toward productivity:',
    options: {
      A: { text: 'Naturally', effects: { motivation: 3, happy: 1 } },
      B: { text: 'Sometimes', effects: { motivation: 1 } },
      C: { text: 'Rarely', effects: { motivation: -2 } },
      D: { text: 'Not at all', effects: { motivation: -3, energy: -1 } }
    }
  },
  {
    id: 'md-3',
    category: 'Motivation & Drive Patterns',
    question: 'Interest in daily activities was:',
    options: {
      A: { text: 'High', effects: { motivation: 3, happy: 2 } },
      B: { text: 'Moderate', effects: { motivation: 1 } },
      C: { text: 'Low', effects: { motivation: -2 } },
      D: { text: 'Absent', effects: { motivation: -3, happy: -2, overload: 1 } }
    }
  },
  {
    id: 'md-4',
    category: 'Motivation & Drive Patterns',
    question: 'Completing tasks gave you:',
    options: {
      A: { text: 'Satisfaction', effects: { happy: 3, motivation: 2 } },
      B: { text: 'Neutral feeling', effects: { balance: 1 } },
      C: { text: 'Relief only', effects: { stress: 1, motivation: -1 } },
      D: { text: 'No feeling', effects: { motivation: -2, happy: -2 } }
    }
  },
  {
    id: 'md-5',
    category: 'Motivation & Drive Patterns',
    question: 'Motivation today was:',
    options: {
      A: { text: 'Consistent', effects: { motivation: 3, balance: 1 } },
      B: { text: 'Slightly uneven', effects: { motivation: 1 } },
      C: { text: 'Low', effects: { motivation: -2 } },
      D: { text: 'Missing', effects: { motivation: -3, overload: 1 } }
    }
  },
  {
    id: 'is-1',
    category: 'Internal Stability & Self-Regulation',
    question: 'When alone, your mind feels:',
    options: {
      A: { text: 'Calm', effects: { calm: 3, balance: 2 } },
      B: { text: 'Neutral', effects: { balance: 1 } },
      C: { text: 'Busy', effects: { overthinking: 2, overload: 1 } },
      D: { text: 'Unsettled', effects: { stress: 2, calm: -2, overload: 1 } }
    }
  },
  {
    id: 'is-2',
    category: 'Internal Stability & Self-Regulation',
    question: 'Your emotional baseline today was:',
    options: {
      A: { text: 'Stable', effects: { balance: 3, resilience: 1 } },
      B: { text: 'Slightly shifted', effects: { balance: 1 } },
      C: { text: 'Unstable', effects: { balance: -2, stress: 1 } },
      D: { text: 'Chaotic', effects: { balance: -3, overload: 2, stress: 2 } }
    }
  },
  {
    id: 'is-3',
    category: 'Internal Stability & Self-Regulation',
    question: 'You were able to reset after stress:',
    options: {
      A: { text: 'Easily', effects: { resilience: 3, calm: 1 } },
      B: { text: 'With some effort', effects: { resilience: 1 } },
      C: { text: 'Slowly', effects: { resilience: -1, stress: 1 } },
      D: { text: 'Not effectively', effects: { resilience: -3, stress: 2, overload: 1 } }
    }
  },
  {
    id: 'is-4',
    category: 'Internal Stability & Self-Regulation',
    question: 'Your inner dialogue today was:',
    options: {
      A: { text: 'Supportive', effects: { happy: 2, resilience: 2, calm: 1 } },
      B: { text: 'Neutral', effects: { balance: 1 } },
      C: { text: 'Critical', effects: { stress: 1, happy: -1, overthinking: 1 } },
      D: { text: 'Harsh', effects: { stress: 2, happy: -2, overload: 1 } }
    }
  },
  {
    id: 'is-5',
    category: 'Internal Stability & Self-Regulation',
    question: 'You felt mentally grounded:',
    options: {
      A: { text: 'Strongly', effects: { balance: 3, calm: 2, clarity: 1 } },
      B: { text: 'Somewhat', effects: { balance: 1 } },
      C: { text: 'Weakly', effects: { balance: -1, stress: 1 } },
      D: { text: 'Not at all', effects: { balance: -3, overload: 2, stress: 1 } }
    }
  },
  {
    id: 'rf-1',
    category: 'End-of-Day Psychological Reflection',
    question: 'If your day had a rhythm, it was:',
    options: {
      A: { text: 'Smooth', effects: { balance: 3, happy: 1 } },
      B: { text: 'Mixed', effects: { balance: 1 } },
      C: { text: 'Chaotic', effects: { overload: 2, stress: 1 } },
      D: { text: 'Broken', effects: { overload: 3, stress: 2, energy: -1 } }
    }
  },
  {
    id: 'rf-2',
    category: 'End-of-Day Psychological Reflection',
    question: 'Thinking about today now feels:',
    options: {
      A: { text: 'Calm', effects: { calm: 3, happy: 1 } },
      B: { text: 'Neutral', effects: { balance: 1 } },
      C: { text: 'Heavy', effects: { stress: 2, energy: -1 } },
      D: { text: 'Disturbing', effects: { stress: 3, overload: 2 } }
    }
  },
  {
    id: 'rf-3',
    category: 'End-of-Day Psychological Reflection',
    question: 'The most dominant feeling today was:',
    options: {
      A: { text: 'Stability', effects: { balance: 3, calm: 1 } },
      B: { text: 'Mild stress', effects: { stress: 1 } },
      C: { text: 'Pressure', effects: { stress: 2, overload: 1 } },
      D: { text: 'Exhaustion', effects: { energy: -3, overload: 2 } }
    }
  },
  {
    id: 'rf-4',
    category: 'End-of-Day Psychological Reflection',
    question: 'You feel mentally clear right now:',
    options: {
      A: { text: 'Yes', effects: { clarity: 3, calm: 1 } },
      B: { text: 'Somewhat', effects: { clarity: 1 } },
      C: { text: 'Not much', effects: { clarity: -2, overload: 1 } },
      D: { text: 'Not at all', effects: { clarity: -3, overload: 2, stress: 1 } }
    }
  },
  {
    id: 'rf-5',
    category: 'End-of-Day Psychological Reflection',
    question: 'Your mind feels ready for tomorrow:',
    options: {
      A: { text: 'Yes', effects: { resilience: 2, happy: 2, motivation: 1 } },
      B: { text: 'Moderately', effects: { resilience: 1 } },
      C: { text: 'Unsure', effects: { stress: 1, motivation: -1 } },
      D: { text: 'Not ready', effects: { stress: 2, resilience: -2, overload: 1 } }
    }
  },
  {
    id: 'dp-1',
    category: 'Deep Pattern Indicators',
    question: 'When nothing is happening, your mind tends to:',
    options: {
      A: { text: 'Rest', effects: { calm: 3, balance: 2 } },
      B: { text: 'Wander gently', effects: { balance: 1 } },
      C: { text: 'Become busy', effects: { overthinking: 2, overload: 1 } },
      D: { text: 'Overactivate', effects: { overthinking: 3, overload: 2, stress: 1 } }
    }
  },
  {
    id: 'dp-2',
    category: 'Deep Pattern Indicators',
    question: 'Your reaction speed emotionally is:',
    options: {
      A: { text: 'Balanced', effects: { balance: 2, calm: 1 } },
      B: { text: 'Slightly delayed', effects: { clarity: 1 } },
      C: { text: 'Fast/reactive', effects: { stress: 2, balance: -1 } },
      D: { text: 'Overreactive', effects: { stress: 3, overload: 1, calm: -1 } }
    }
  },
  {
    id: 'dp-3',
    category: 'Deep Pattern Indicators',
    question: 'Your internal resilience today felt:',
    options: {
      A: { text: 'Strong', effects: { resilience: 3, happy: 1 } },
      B: { text: 'Moderate', effects: { resilience: 1 } },
      C: { text: 'Weak', effects: { resilience: -2, stress: 1 } },
      D: { text: 'Fragile', effects: { resilience: -3, stress: 2, overload: 1 } }
    }
  },
  {
    id: 'dp-4',
    category: 'Deep Pattern Indicators',
    question: 'You handled uncertainty by:',
    options: {
      A: { text: 'Accepting it', effects: { resilience: 2, calm: 1 } },
      B: { text: 'Planning around it', effects: { clarity: 2, focus: 1 } },
      C: { text: 'Worrying slightly', effects: { stress: 1, overthinking: 1 } },
      D: { text: 'Feeling stressed', effects: { stress: 3, overload: 1 } }
    }
  },
  {
    id: 'dp-5',
    category: 'Deep Pattern Indicators',
    question: 'Your psychological load today feels:',
    options: {
      A: { text: 'Light', effects: { calm: 2, energy: 1, happy: 1 } },
      B: { text: 'Manageable', effects: { balance: 1 } },
      C: { text: 'Heavy', effects: { stress: 2, overload: 1 } },
      D: { text: 'Overwhelming', effects: { overload: 4, stress: 2, energy: -1 } }
    }
  },
  {
    id: 'dp-6',
    category: 'Deep Pattern Indicators',
    question: 'Your sense of control over today was:',
    options: {
      A: { text: 'High', effects: { clarity: 2, resilience: 2, happy: 1 } },
      B: { text: 'Moderate', effects: { resilience: 1 } },
      C: { text: 'Low', effects: { stress: 2, clarity: -1 } },
      D: { text: 'Very low', effects: { stress: 3, overload: 2, resilience: -2 } }
    }
  },
  {
    id: 'dp-7',
    category: 'Deep Pattern Indicators',
    question: 'Overall, your mental state today resembles:',
    options: {
      A: { text: 'Balanced system', effects: { balance: 4, happy: 2, calm: 1 } },
      B: { text: 'Slight imbalance', effects: { balance: 1, stress: 1 } },
      C: { text: 'Strained system', effects: { stress: 2, overload: 2 } },
      D: { text: 'Overloaded system', effects: { overload: 4, stress: 2, clarity: -1 } }
    }
  }
];

const KEYWORD_META = {
  happy: { label: 'Happy', color: '#34D399' },
  stress: { label: 'Stress', color: '#F97316' },
  focus: { label: 'Focus', color: '#3B82F6' },
  calm: { label: 'Calm', color: '#06B6D4' },
  overthinking: { label: 'Overthinking', color: '#8B5CF6' },
  motivation: { label: 'Motivation', color: '#F59E0B' },
  energy: { label: 'Energy', color: '#EF4444' },
  resilience: { label: 'Resilience', color: '#10B981' },
  social: { label: 'Social Ease', color: '#EC4899' },
  clarity: { label: 'Clarity', color: '#6366F1' },
  balance: { label: 'Balance', color: '#14B8A6' },
  overload: { label: 'Overload', color: '#7C3AED' }
};

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function hashString(input) {
  return Array.from(input).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 1)), 0);
}

function getAssessmentDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyQuestionSet(userId, date = getAssessmentDate(), size = 15) {
  const seedBase = hashString(`${userId}-${date}`);
  return QUESTION_BANK
    .map((question, index) => ({ question, weight: seededRandom(seedBase + index + 1) }))
    .sort((a, b) => a.weight - b.weight)
    .slice(0, Math.min(size, QUESTION_BANK.length))
    .map(({ question }) => ({
      id: question.id,
      category: question.category,
      question: question.question,
      options: Object.entries(question.options).map(([key, value]) => ({
        key,
        text: value.text
      }))
    }));
}

function scoreAssessment(answers) {
  const rawScores = Object.fromEntries(Object.keys(KEYWORD_META).map(key => [key, 0]));

  for (const answer of answers) {
    const question = QUESTION_BANK.find(item => item.id === answer.question_id);
    const option = question?.options?.[answer.option_key];
    if (!option) continue;

    for (const [keyword, value] of Object.entries(option.effects || {})) {
      rawScores[keyword] = (rawScores[keyword] || 0) + value;
    }
  }

  const normalized = Object.fromEntries(
    Object.keys(KEYWORD_META).map(keyword => [keyword, Math.max(rawScores[keyword] || 0, 0)])
  );
  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0) || 1;

  const keywordPercentages = Object.entries(normalized)
    .map(([keyword, score]) => ({
      keyword,
      label: KEYWORD_META[keyword].label,
      color: KEYWORD_META[keyword].color,
      percentage: Math.round((score / total) * 100)
    }))
    .filter(item => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const summed = keywordPercentages.reduce((sum, item) => sum + item.percentage, 0);
  if (keywordPercentages.length && summed !== 100) {
    keywordPercentages[0].percentage += 100 - summed;
  }

  return {
    keywordPercentages,
    topKeywords: keywordPercentages.slice(0, 6),
    summaryLabel: keywordPercentages[0]?.label || 'Balanced'
  };
}

module.exports = {
  QUESTION_BANK,
  KEYWORD_META,
  getAssessmentDate,
  getDailyQuestionSet,
  scoreAssessment
};