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

    const currentSequence = getSequence(numbers.slice(i, i + 3));

    if (currentSequence) {
      if (currentSequence.type === SequenceType.Identical) {
        let lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2]

        // Keep checking next numbers to extend the sequence
        while (currentNumber === lastSequenceNumberAfterSkip) {
          iterationsToSkip++;

          currentSequence.members = 'all';
          currentSequence.values.push(lastSequenceNumberAfterSkip);

          lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2]
        }
      } else {
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
  
        // Additional skip since 2 more numbers in a sequence - compared to one additional with Identical Sequence type
        iterationsToSkip++;
      }

      sequences.push(currentSequence);

      iterationsToSkip++;

      continue;
    }

    sequences.push(currentNumber);
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
  const [firstNumber, secondNumber, thirdNumber] = numbers;

  if (numbers.length === 1) {
    return false;
  }

  if (numbers.length === 2) {
    if (firstNumber === secondNumber) {
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

  // Check number order
  if (
    (firstNumber < secondNumber && secondNumber > thirdNumber) ||
    (firstNumber > secondNumber && secondNumber < thirdNumber)
  ) {
    return false;
  }

  // Check for Identical Sequence
  if (firstNumber === secondNumber) {
    const currentSequence: Sequence = {
      type: SequenceType.Identical,
      members: 'firstTwo',
      values: [firstNumber, secondNumber]
    }

    if (thirdNumber === secondNumber) {
      currentSequence.members = 'all';
      values: [firstNumber, secondNumber, thirdNumber]
    }

    return currentSequence;
  }

  // Check for Consecutive Sequence
  if (Math.abs(firstNumber - secondNumber) === 1 && Math.abs(secondNumber - thirdNumber) === 1) {
    const currentSequence: Sequence = {
      type: SequenceType.Consecutive,
      members: 'all',
      values: numbers,
    }

    if (firstNumber > secondNumber) {
      currentSequence.type = SequenceType.ConsecutiveReversed;
    }

    return currentSequence;
  }

  // Check for Interval Sequence
  const firstStep = secondNumber - firstNumber;

  if ((thirdNumber - firstStep) === secondNumber) {
    const currentSequence: Sequence = {
      type: SequenceType.Interval,
      members: 'all',
      intervalStep: firstStep,
      values: numbers,
    }

    if (firstNumber > secondNumber) {
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
