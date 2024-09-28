type Triplet = [number, number, number];

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
  intervalStep?: number;
}

interface CarriedSequence {
  indices: number[];
  values: number[];
  type: SequenceType;
  intervalStep?: number;
}

export function compress(m: number[]): string {
  const compressedResult: string[] = [];

  let skipIterations = 0;
  let carriedSequence: null | CarriedSequence = null;

  //   Iterate and check triplets
  for (let i = 0; i < m.length - 2; i++) {
    // Last iteration i === 13
    if (skipIterations) {
      skipIterations--;
      continue;
    }

    // If we have a carried sequence
    if (carriedSequence) {
      // Current number - first after carried sequence
      let currentNumber = m[i];

      // If it is the last sequence (last three numbers)
      // Add the sequence with the current number since IT IS the last number
      if (i === m.length - 3) {

        // Check whether we can pack more of the last 3 numbers to the carried sequence
        while (canContinueSequence(carriedSequence, currentNumber)) {
          carriedSequence.values.push(currentNumber);

          i++;
          currentNumber = m[i];
        }

        // However long the carried sequence is - push it to 
        compressedResult.push(compressCarriedSequence(carriedSequence));

        // Reset the pushed sequence
        carriedSequence = null;

        // We reached the end of "m" array - break the loop
        if (i >= m.length - 1) {
          console.log('REACHED the end --- Last 3 numbers were a sequence')
          break;
        }

        // We have last 3 / 2 / 1 numbers

        const firstNumber = m[i];
        const secondNumber = m[i+1];
        const thirdNumber = m[i + 2];

        // If we have 3 numbers
        if (i === m.length - 3) {
          const triplet: Triplet = [firstNumber, secondNumber, thirdNumber];
          
          const sequence = getSequence(triplet);

          // interface CarriedSequence {
          //   indices: number[];
          //   values: number[];
          //   type: SequenceType;
          //   intervalStep?: number;
          // }

          if (sequence) {
            // Make sequence out of carried sequence
            const createdCarriedSequence: CarriedSequence = {
              indices: [i, i+1, i+2],
              values: triplet,
              type: sequence.type,
            }

            if (sequence.intervalStep) {
              createdCarriedSequence.intervalStep = sequence.intervalStep;
            }

            // Push the last created sequence
            compressedResult.push(compressCarriedSequence(createdCarriedSequence));

            // Break the loop - since just created and pushed a sequence out of last 3 numbers in the array!
            break;
          }

          // Else we have only two numbers left!
        } else if (i === m.length - 2) {
          if (firstNumber === secondNumber) {
            compressedResult.push(`${firstNumber}*2`);
          } else {
            // We have 2 last numbers and they don't form or extend ay sequence
            compressedResult.push(firstNumber.toString());
            compressedResult.push(secondNumber.toString());
          }

          // Else we have just one number left!!!
        } else {
          // Push all the numbers to the result - it's the last iteration
          compressedResult.push(firstNumber.toString());
        }

        // This continue breaks the for loop
        continue;
      }

      // Check whether we can continue the sequence by 1
      // TODO Make sure we don't run out of bounds
      if (canContinueSequence(carriedSequence, currentNumber)) {
        carriedSequence.values.push(currentNumber);
        carriedSequence.indices.push(i);

        continue;
      }

      // We cannot continue the sequence! But still working on the current number

      // Push (n) numbers
      compressedResult.push(compressCarriedSequence(carriedSequence));
      
      // TODO - Check whether we should keep that or skip only 2 nex iterations
      // Skip (n) iterations
      // skipIterations = carriedSequence.values.length;

      // Reset carried sequence - starting a new one
      carriedSequence = null;

      // Not skipping this iteration - since we are starting a new potential sequence
      // continue;
    }

    // We don't have a carried sequence

    const currentTriplet: Triplet = m.slice(i, i + 3) as Triplet;

    // if last 3 numbers
    if (i === m.length - 3) {
      console.log('entered last three numbers on i:', i);
      console.log('m.length:', m.length);

      if (currentTriplet[0] === currentTriplet[1] && currentTriplet[1] !== currentTriplet[2]) {
        // We have a couple of first two and last one is not in any sequence
        compressedResult.push(`${currentTriplet[0]}*2`);
        compressedResult.push(currentTriplet[2].toString());
        break;
      }

      const lastSequence = getSequence(currentTriplet);

      // Check whether we can add the current number to the carried sequence
      if (lastSequence) {
        const lastCarriedSequence: CarriedSequence = {
          indices: [i, i + 1, i + 2],
          values: currentTriplet,
          type: lastSequence.type,
        };

        // TODO create compressSequence function
        compressedResult.push(compressCarriedSequence(lastCarriedSequence))
        // If has sequence
      } else {
        // Push all the numbers to the result - it's the last iteration
        compressedResult.push(currentTriplet[0].toString());
        compressedResult.push(currentTriplet[1].toString());
        compressedResult.push(currentTriplet[2].toString());
      }

      console.log('end of code - before continue');
      // This continue breaks the for loop
      continue;
    }

    
    // if the triplet has a sequence - check next number for it as well
    const currentSequence = getSequence(currentTriplet);

    const firstNumber = currentTriplet[0];

    // If we don't have a sequence
    if (!currentSequence) {
      compressedResult.push(firstNumber.toString());
      continue;
    }

    // We have a sequence!

    // If we just have a couple (first & second nums)
    if (currentSequence.type === SequenceType.Identical && currentSequence.members === 'firstTwo') {
      compressedResult.push(`${firstNumber}*2`);

      skipIterations = 1;

      continue;
    }

    // There is a full triplet sequence
    const sequenceToCarry: CarriedSequence = {
      indices: [i, i + 1, i + 2],
      values: currentTriplet,
      type: currentSequence.type,
    };

    // If it is an interval - save the object
    if (currentSequence.intervalStep) {
      sequenceToCarry.intervalStep = currentSequence.intervalStep;
    }

    // Save the sequenceToCarry in the closure for next iteration
    // So we can check whether it can be extended by next numbers in m[]
    carriedSequence = sequenceToCarry;

    // We have a triplet sequence - skip to the next (4th) number
    // So we skip next 2 numbers - they are in the triplet
    skipIterations = 2;

    const indexAfterSkip = i + skipIterations + 1;

    // LAST TODOOOO
    // If after skipping we aren't going to enter the loop - finish manually
    if (indexAfterSkip >= m.length - 2) {

      // We have a sequence to carry - AND we have 2 more numbers
      if (indexAfterSkip === m.length - 2) {
        const firstNumber = m[indexAfterSkip];
        const secondNumber = m[indexAfterSkip + 1];

        if (canContinueSequence(carriedSequence, firstNumber)) {
          carriedSequence.values.push(firstNumber);

          if (canContinueSequence(carriedSequence, secondNumber)) {
            carriedSequence.values.push(secondNumber);
            compressedResult.push(compressCarriedSequence(carriedSequence));

            break
          }

          compressedResult.push(compressCarriedSequence(carriedSequence));
          compressedResult.push(secondNumber.toString());

          break;
        }

        // Else - we just have 1 number left
      } else {
        const lastNumber = m[indexAfterSkip];

        if (canContinueSequence(carriedSequence, lastNumber)) {
          carriedSequence.values.push(lastNumber);
          compressedResult.push(compressCarriedSequence(carriedSequence));

          break;
        }

        compressedResult.push(compressCarriedSequence(carriedSequence));
        compressedResult.push(lastNumber.toString());
        break;
      }

      break;
    }

    continue;
  }

  return compressedResult.join(',');
}

function getSequence(triplet: Triplet): false | Sequence {
  const [first, second, third] = triplet;

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
    }

    if (third === second) {
      currentSequence.members = 'all';
    }

    return currentSequence;
  }

  // TODO - optimize with ABS
  // Check for Consecutive
  if (first === (second - 1) && second === (third - 1)) {
    const currentSequence: Sequence = {
      type: SequenceType.Consecutive,
      members: 'all',
    }

    return currentSequence;
  }

  // Check for Consecutive (Reversed)
  if (first === (second + 1) && second === (third + 1)) {
    const currentSequence: Sequence = {
      type: SequenceType.ConsecutiveReversed,
      members: 'all',
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
    }

    if (first > second) {
      currentSequence.type = SequenceType.IntervalReversed
    }

    return currentSequence;
  }

  return false;
}

function canContinueSequence(carriedSequence: CarriedSequence, nextNumber: number) {
  const carriedSequenceValues = carriedSequence.values;
  const lastSequenceValue = carriedSequenceValues[carriedSequenceValues.length - 1];

  // Check whether acn continue the sequence
  switch (carriedSequence.type) {
    case SequenceType.Identical:
      return carriedSequenceValues[0] === nextNumber;

    case SequenceType.Consecutive:
      return lastSequenceValue + 1 === nextNumber;

    case SequenceType.ConsecutiveReversed:
      return lastSequenceValue - 1 === nextNumber;

    case SequenceType.Interval:
      return lastSequenceValue + (carriedSequence.intervalStep as number) === nextNumber;

    case SequenceType.IntervalReversed:
      return lastSequenceValue + (carriedSequence.intervalStep as number) === nextNumber;
    
    default:
      return false
  }
}

function compressCarriedSequence(carriedSequence: CarriedSequence): string {
  let compressedSequence = '';
  const firstValue = carriedSequence.values[0];
  const lastValue = carriedSequence.values[carriedSequence.values.length - 1];

  switch (carriedSequence.type) {
    case SequenceType.Identical:
      compressedSequence = `${firstValue}*${carriedSequence.values.length}`;
      break;

    case SequenceType.Consecutive:
      compressedSequence = `${firstValue}-${lastValue}`;
      break;

    case SequenceType.ConsecutiveReversed:
      compressedSequence = `${firstValue}-${lastValue}`;
      break;

    case SequenceType.Interval:
      compressedSequence = `${firstValue}-${lastValue}/${Math.abs((carriedSequence.intervalStep as number))}`;
      break;

    case SequenceType.IntervalReversed:
      compressedSequence = `${firstValue}-${lastValue}/${Math.abs((carriedSequence.intervalStep) as number)}`;
      break;
    
    default:
      return compressedSequence;
  }

  return compressedSequence;
}

const result = compress([1, 2, 2, 3]);

console.log(result);

console.log('should be: 1,2*2,3');

console.log('passed:', result === '1,2*2,3');
