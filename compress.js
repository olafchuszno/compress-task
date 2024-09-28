"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = compress;
var SequenceType;
(function (SequenceType) {
    SequenceType["Identical"] = "identical";
    SequenceType["Consecutive"] = "consecutive";
    SequenceType["ConsecutiveReversed"] = "consecutive-reversed";
    SequenceType["Interval"] = "interval";
    SequenceType["IntervalReversed"] = "interval-reversed";
})(SequenceType || (SequenceType = {}));
function compress(m) {
    if (!m.length) {
        return '';
    }
    if (m.length < 3) {
        if (m.length === 1) {
            return m[0].toString();
        }
        var firstNumber = m[0], secondNumber = m[1];
        if (firstNumber === secondNumber) {
            return "".concat(firstNumber, "*2");
        }
        return "".concat(firstNumber, ",").concat(secondNumber);
    }
    var compressedResult = [];
    var skipIterations = 0;
    var carriedSequence = null;
    //   Iterate and check triplets
    for (var i = 0; i < m.length - 2; i++) {
        if (i === 50) {
            debugger;
        }
        if (skipIterations) {
            skipIterations--;
            continue;
        }
        // If we have a carried sequence
        if (carriedSequence) {
            // Current number - first after carried sequence
            var currentNumber = m[i];
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
                if (i > m.length - 1) {
                    // We're out of numbers
                    break;
                }
                // TODO - How can we have more than 1 number still ??? Is it possible ???
                // We have last 3 / 2 / 1 numbers
                var firstNumber_1 = m[i];
                var secondNumber = m[i + 1];
                var thirdNumber = m[i + 2];
                // If we have 3 numbers
                if (i === m.length - 3) {
                    var triplet = [firstNumber_1, secondNumber, thirdNumber];
                    var sequence = getSequence(triplet);
                    // interface CarriedSequence {
                    //   indices: number[];
                    //   values: number[];
                    //   type: SequenceType;
                    //   intervalStep?: number;
                    // }
                    if (sequence) {
                        // Make sequence out of carried sequence
                        var createdCarriedSequence = {
                            indices: [i, i + 1, i + 2],
                            values: triplet,
                            type: sequence.type,
                        };
                        if (sequence.intervalStep) {
                            createdCarriedSequence.intervalStep = sequence.intervalStep;
                        }
                        // Push the last created sequence
                        compressedResult.push(compressCarriedSequence(createdCarriedSequence));
                        // Break the loop - since just created and pushed a sequence out of last 3 numbers in the array!
                        break;
                    }
                    // Else we have only two numbers left!
                }
                else if (i === m.length - 2) {
                    if (firstNumber_1 === secondNumber) {
                        compressedResult.push("".concat(firstNumber_1, "*2"));
                    }
                    else {
                        // We have 2 last numbers and they don't form or extend ay sequence
                        compressedResult.push(firstNumber_1.toString());
                        compressedResult.push(secondNumber.toString());
                    }
                    // Else we have just one number left!!!
                }
                else {
                    // Push all the numbers to the result - it's the last iteration
                    compressedResult.push(firstNumber_1.toString());
                }
                // End of m array
                break;
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
        var currentTriplet = m.slice(i, i + 3);
        // if last 3 numbers
        if (i === m.length - 3) {
            console.log('entered last three numbers on i:', i);
            console.log('m.length:', m.length);
            if (currentTriplet[0] === currentTriplet[1] && currentTriplet[1] !== currentTriplet[2]) {
                // We have a couple of first two and last one is not in any sequence
                compressedResult.push("".concat(currentTriplet[0], "*2"));
                compressedResult.push(currentTriplet[2].toString());
                break;
            }
            // If couple of the LAST two nums in the current (last) sequence
            if (currentTriplet[1] === currentTriplet[2] && currentTriplet[0] !== currentTriplet[1]) {
                // We have a couple of first two and last one is not in any sequence
                compressedResult.push(currentTriplet[0].toString());
                compressedResult.push("".concat(currentTriplet[1], "*2"));
                break;
            }
            var lastSequence = getSequence(currentTriplet);
            // Check whether we can add the current number to the carried sequence
            if (lastSequence) {
                var lastCarriedSequence = {
                    indices: [i, i + 1, i + 2],
                    values: currentTriplet,
                    type: lastSequence.type,
                };
                if (lastSequence.intervalStep) {
                    lastCarriedSequence.intervalStep = lastSequence.intervalStep;
                }
                // TODO create compressSequence function
                compressedResult.push(compressCarriedSequence(lastCarriedSequence));
                // If has sequence
            }
            else {
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
        var currentSequence = getSequence(currentTriplet);
        var firstNumber = currentTriplet[0];
        // If we don't have a sequence
        if (!currentSequence) {
            compressedResult.push(firstNumber.toString());
            continue;
        }
        // We have a sequence!
        // TODO - Last Error - what if < 2 numbers are left after pushing couple??
        // If we just have a couple (first & second nums)
        if (currentSequence.type === SequenceType.Identical && currentSequence.members === 'firstTwo') {
            compressedResult.push("".concat(firstNumber, "*2"));
            skipIterations = 1;
            var indexAfterSkip_1 = i + skipIterations + 1;
            // LAST TODOOOO
            // If after skipping we aren't going to enter the loop - finish manually
            if (indexAfterSkip_1 >= m.length - 2) {
                var firstNumberAfterSkip = m[indexAfterSkip_1];
                // We have a sequence to carry - AND we have 2 more numbers
                if (indexAfterSkip_1 === m.length - 2) {
                    var secondNumberAfterSkip = m[indexAfterSkip_1 + 1];
                    if (firstNumberAfterSkip === secondNumberAfterSkip) {
                        compressedResult.push("".concat(firstNumberAfterSkip, "*2"));
                        break;
                    }
                    compressedResult.push(firstNumberAfterSkip.toString());
                    compressedResult.push(secondNumberAfterSkip.toString());
                }
                else if (indexAfterSkip_1 === m.length - 1) {
                    // Else - we just have 1 number left
                    compressedResult.push(firstNumberAfterSkip.toString());
                }
                break;
            }
            // Continue - Don't carry the firstTwo sequence since it ended on the third number in this triplet
            continue;
        }
        // There is a full triplet sequence
        var sequenceToCarry = {
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
        var indexAfterSkip = i + skipIterations + 1;
        // If after skipping we aren't going to enter the loop - finish manually
        if (indexAfterSkip >= m.length - 2) {
            // We have a sequence to carry - AND we have 2 more numbers
            if (indexAfterSkip === m.length - 2) {
                var firstNumber_2 = m[indexAfterSkip];
                var secondNumber = m[indexAfterSkip + 1];
                if (canContinueSequence(carriedSequence, firstNumber_2)) {
                    carriedSequence.values.push(firstNumber_2);
                    if (canContinueSequence(carriedSequence, secondNumber)) {
                        carriedSequence.values.push(secondNumber);
                        compressedResult.push(compressCarriedSequence(carriedSequence));
                        break;
                    }
                    compressedResult.push(compressCarriedSequence(carriedSequence));
                    compressedResult.push(secondNumber.toString());
                    break;
                }
                else {
                    compressedResult.push(compressCarriedSequence(carriedSequence));
                    // We have last two numbers that don't continue the sequence
                    if (firstNumber_2 === secondNumber) {
                        compressedResult.push("".concat(firstNumber_2, "*2"));
                    }
                    else {
                        compressedResult.push("".concat(firstNumber_2));
                        compressedResult.push("".concat(secondNumber));
                    }
                    break;
                }
            }
            else {
                // Else - we just have 1 number left
                var lastNumber = m[indexAfterSkip];
                if (canContinueSequence(carriedSequence, lastNumber)) {
                    carriedSequence.values.push(lastNumber);
                    compressedResult.push(compressCarriedSequence(carriedSequence));
                    break;
                }
                compressedResult.push(compressCarriedSequence(carriedSequence));
                compressedResult.push(lastNumber.toString());
                break;
            }
        }
        continue;
    }
    return compressedResult.join(',');
}
function getSequence(triplet) {
    var first = triplet[0], second = triplet[1], third = triplet[2];
    // Check number order
    if ((first < second && second > third) ||
        (first > second && second < third)) {
        return false;
    }
    // Check for couples
    if (first === second) {
        var currentSequence = {
            type: SequenceType.Identical,
            members: 'firstTwo',
        };
        if (third === second) {
            currentSequence.members = 'all';
        }
        return currentSequence;
    }
    // TODO - optimize with ABS
    // Check for Consecutive
    if (first === (second - 1) && second === (third - 1)) {
        var currentSequence = {
            type: SequenceType.Consecutive,
            members: 'all',
        };
        return currentSequence;
    }
    // Check for Consecutive (Reversed)
    if (first === (second + 1) && second === (third + 1)) {
        var currentSequence = {
            type: SequenceType.ConsecutiveReversed,
            members: 'all',
        };
        return currentSequence;
    }
    // Check for Intervals
    var firstStep = second - first;
    if ((third - firstStep) === second) {
        var currentSequence = {
            type: SequenceType.Interval,
            members: 'all',
            intervalStep: firstStep,
        };
        if (first > second) {
            currentSequence.type = SequenceType.IntervalReversed;
        }
        return currentSequence;
    }
    return false;
}
function canContinueSequence(carriedSequence, nextNumber) {
    var carriedSequenceValues = carriedSequence.values;
    var lastSequenceValue = carriedSequenceValues[carriedSequenceValues.length - 1];
    // Check whether acn continue the sequence
    switch (carriedSequence.type) {
        case SequenceType.Identical:
            return carriedSequenceValues[0] === nextNumber;
        case SequenceType.Consecutive:
            return lastSequenceValue + 1 === nextNumber;
        case SequenceType.ConsecutiveReversed:
            return lastSequenceValue - 1 === nextNumber;
        case SequenceType.Interval:
            return lastSequenceValue + carriedSequence.intervalStep === nextNumber;
        case SequenceType.IntervalReversed:
            return lastSequenceValue + carriedSequence.intervalStep === nextNumber;
        default:
            return false;
    }
}
function compressCarriedSequence(carriedSequence) {
    var compressedSequence = '';
    var firstValue = carriedSequence.values[0];
    var lastValue = carriedSequence.values[carriedSequence.values.length - 1];
    switch (carriedSequence.type) {
        case SequenceType.Identical:
            compressedSequence = "".concat(firstValue, "*").concat(carriedSequence.values.length);
            break;
        case SequenceType.Consecutive:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue);
            break;
        case SequenceType.ConsecutiveReversed:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue);
            break;
        case SequenceType.Interval:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue, "/").concat(Math.abs(carriedSequence.intervalStep));
            break;
        case SequenceType.IntervalReversed:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue, "/").concat(Math.abs((carriedSequence.intervalStep)));
            break;
        default:
            return compressedSequence;
    }
    return compressedSequence;
}
var result = compress([
    98, 181, 181, 181, 36, 131, 129, 127, 105, 108,
    22, 19, 71, 163, 161, 159, 157, 197, 61, 60,
    41, 68, 65, 62, 59, 56, 37, 179, 119, 116,
    113, 110, 91, 90, 89, 88, 45, 123, 124, 51,
    50, 50, 50, 50, 139, 137, 135, 133, 122, 122,
    122, 131, 132, 133, 184, 197
]);
console.log(result);
var expected = '98,181*3,36,131-127/2,105,108,22,19,71,163-157/2,197,61,60,41,68-56/3,37,179,119-110/3,91-88,45,123,124,51,50*4,139-133/2,122*3,131-133,184,197';
console.log('should be:', expected);
console.log('passed:', result === expected);
