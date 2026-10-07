import { QuestionItem } from '@/types/studio';

export const BOOKLET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Generates a deterministic shuffled question set for a given booklet code.
 * Booklet 'A' is always the master/original question set.
 * Booklets 'B', 'C', 'D'... have questions and multiple-choice options shuffled,
 * with the correct answer letter synchronized to match the new option position.
 */
export function generateBookletQuestions(
  masterQuestions: QuestionItem[],
  bookletCode: string,
  seedSalt = 1
): QuestionItem[] {
  if (!masterQuestions || masterQuestions.length === 0) return [];
  if (bookletCode === 'A') return masterQuestions;

  // Deterministic seed based on bookletCode and seedSalt
  let seed = bookletCode.charCodeAt(0) * 1009 + seedSalt * 997 + masterQuestions.length * 41;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // 1. Shuffle question order
  const shuffled = masterQuestions.map((q, idx) => ({
    ...q,
    _masterIndex: idx,
  }));

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 2. Permute multiple choice options and sync correctAnswer
  return shuffled.map((q) => {
    if (
      q.type === 'multiple_choice' &&
      q.options &&
      q.options.length >= 2 &&
      !q.optionsInImage
    ) {
      const count = q.options.length;
      const letters = ['A', 'B', 'C', 'D', 'E'].slice(0, count);

      // Clean raw texts (strip leading 'A) ', 'B) ' etc.)
      const rawTexts = q.options.map((opt) => opt.replace(/^[A-E]\)\s*/i, '').trim());

      // Find original correct index
      const oldCorrectIdx = letters.indexOf(q.correctAnswer.trim().toUpperCase());

      // Deterministic permutation for this question's options
      const indices = Array.from({ length: count }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(pseudoRandom() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // Build new options array
      const newOptions = indices.map((origIdx, newPos) => {
        return `${letters[newPos]}) ${rawTexts[origIdx]}`;
      });

      // Synchronize correct answer letter
      let newCorrectAnswer = q.correctAnswer;
      if (oldCorrectIdx !== -1) {
        const newPos = indices.indexOf(oldCorrectIdx);
        if (newPos !== -1) {
          newCorrectAnswer = letters[newPos];
        }
      }

      return {
        ...q,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      };
    }

    return { ...q };
  });
}

/**
 * Returns the next available booklet code from BOOKLET_LETTERS.
 */
export function getNextBookletLetter(currentBooklets: string[]): string | null {
  for (const letter of BOOKLET_LETTERS) {
    if (!currentBooklets.includes(letter)) {
      return letter;
    }
  }
  return null;
}

export interface BookletMatrixRow {
  masterIndex: number;
  questionText: string;
  bookletEntries: Record<string, { questionNumber: number; correctAnswer: string }>;
}

/**
 * Generates an answer key comparison matrix for all active booklets.
 * Enables teachers to grade students taking different booklet types side-by-side.
 */
export function getBookletMatrix(
  masterQuestions: QuestionItem[],
  bookletCodes: string[],
  bookletSeeds: Record<string, number>
): BookletMatrixRow[] {
  // Generate question sets for each booklet
  const bookletSets: Record<string, QuestionItem[]> = {};
  bookletCodes.forEach((code) => {
    bookletSets[code] = generateBookletQuestions(masterQuestions, code, bookletSeeds[code] || 1);
  });

  return masterQuestions.map((masterQ, mIdx) => {
    const entries: Record<string, { questionNumber: number; correctAnswer: string }> = {};

    bookletCodes.forEach((code) => {
      const bQuestions = bookletSets[code];
      const foundIdx = bQuestions.findIndex((q) => q.id === masterQ.id);
      if (foundIdx !== -1) {
        entries[code] = {
          questionNumber: foundIdx + 1,
          correctAnswer: bQuestions[foundIdx].correctAnswer || '—',
        };
      } else {
        entries[code] = {
          questionNumber: mIdx + 1,
          correctAnswer: masterQ.correctAnswer || '—',
        };
      }
    });

    return {
      masterIndex: mIdx + 1,
      questionText: masterQ.text ? masterQ.text.slice(0, 60) + (masterQ.text.length > 60 ? '...' : '') : `Soru ${mIdx + 1}`,
      bookletEntries: entries,
    };
  });
}
