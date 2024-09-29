enum SequenceType {
  Identical = 'identical',
  Consecutive = 'consecutive',
  ConsecutiveReversed = 'consecutive-reversed',
  Interval = 'interval',
  IntervalReversed = 'interval-reversed',
}

interface Sequence {
  type: SequenceType;
  members: 'firstTwo' | 'all';
  values: number[];
  intervalStep?: number;
}

export function compress(numbers: number[]): string {
  const sequences: Array<Sequence | number> = [];
  let iterationsToSkip = 0;

  // Iterate through the string and add sequences
  for (let i = 0; i < numbers.length; i++) {
    if (iterationsToSkip) {
      iterationsToSkip--;
      continue;
    }

    const currentNumber = numbers[i];
    const nextNumber = numbers[i + 1];

    // If the next number is the same - we have couple
    if (getSequence([currentNumber, nextNumber])) {
      

      const currentSequence: Sequence = {
        members: 'firstTwo',
        values: [currentNumber, nextNumber],
        type: SequenceType.Identical,
      }

      let lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2]

      // Keep checking next numbers to extend the sequence
      while (currentNumber === lastSequenceNumberAfterSkip) {
        iterationsToSkip++;

        currentSequence.members = 'all';
        currentSequence.values.push(lastSequenceNumberAfterSkip);

        lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2]
      }

      sequences.push(currentSequence);

      iterationsToSkip++;

      continue;
    }

    const thirdNumber = numbers[i + 2];

    const currentTriplet = [currentNumber, nextNumber, thirdNumber];

    const currentSequence = getSequence(currentTriplet);
    
    // If the next 2 numbers (current tripplet) form a sequence
    if (currentSequence) {
      let firstSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 1]
      let secondSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2]
      // number after current sequence - asserting this number to current sequence
      let thirdSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 3]

      // Keep checking next numbers to extend the sequence
      while (getSequence([firstSequenceNumberAfterSkip, secondSequenceNumberAfterSkip, thirdSequenceNumberAfterSkip])) {
        iterationsToSkip++;
        currentSequence.values.push(thirdSequenceNumberAfterSkip);

        firstSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 1];
        secondSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2];
        // number after current sequence - asserting this number to current sequence
        thirdSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 3];
      }

      sequences.push(currentSequence);

      iterationsToSkip += 2;

      continue;
    }

    // We don't have any sequence
    sequences.push(currentNumber);

    continue;
  }

  const compressedArray = sequences.map((element: Sequence | number) => {
    if (typeof element === 'number') {
      return element.toString();
    } else {
      return compressSequence(element);
    }
  });

  return compressedArray.join(',');
}

function getSequence(numbers: number[]): false | Sequence {
  if (numbers.length === 1) {
    return false;
  }

  if (numbers.length === 2) {
    if (numbers[0] === numbers[1]) {
      // We have a couple
      const sequence: Sequence = {
        type: SequenceType.Identical,
        members: 'firstTwo',
        values: numbers,
      }

      return sequence;
    }

    return false;
  }

  // Sequence has three numbers

  const [first, second, third] = numbers;

  // Check number order
  if (
    (first < second && second > third) ||
    (first > second && second < third)
  ) {
    return false;
  }

  // Check for couples
  if (first === second) {
    const currentSequence: Sequence = {
      type: SequenceType.Identical,
      members: 'firstTwo',
      values: [first, second]
    }

    if (third === second) {
      currentSequence.members = 'all';
      values: [first, second, third]
    }

    return currentSequence;
  }

  // TODO - optimize with ABS
  // Check for Consecutive
  if (first === (second - 1) && second === (third - 1)) {
    const currentSequence: Sequence = {
      type: SequenceType.Consecutive,
      members: 'all',
      values: numbers,
    }

    return currentSequence;
  }

  // Check for Consecutive (Reversed)
  if (first === (second + 1) && second === (third + 1)) {
    const currentSequence: Sequence = {
      type: SequenceType.ConsecutiveReversed,
      members: 'all',
      values: numbers,
    }

    return currentSequence;
  }

  // Check for Intervals
  const firstStep = second - first;

  if ((third - firstStep) === second) {
    const currentSequence: Sequence = {
      type: SequenceType.Interval,
      members: 'all',
      intervalStep: firstStep,
      values: numbers,
    }

    if (first > second) {
      currentSequence.type = SequenceType.IntervalReversed
    }

    return currentSequence;
  }

  return false;
}

function compressSequence(sequence: Sequence): string {
  let compressedSequence = '';

  const firstValue = sequence.values[0];
  const lastValue = sequence.values[sequence.values.length - 1];

  switch (sequence.type) {
    case SequenceType.Identical:
      compressedSequence = `${firstValue}*${sequence.values.length}`;
      break;

    case SequenceType.Consecutive:
      compressedSequence = `${firstValue}-${lastValue}`;
      break;

    case SequenceType.ConsecutiveReversed:
      compressedSequence = `${firstValue}-${lastValue}`;
      break;

    case SequenceType.Interval:
      compressedSequence = `${firstValue}-${lastValue}/${Math.abs((sequence.intervalStep as number))}`;
      break;

    case SequenceType.IntervalReversed:
      compressedSequence = `${firstValue}-${lastValue}/${Math.abs((sequence.intervalStep) as number)}`;
      break;
    
    default:
      return compressedSequence;
  }

  return compressedSequence;
}
