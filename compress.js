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
    var compressedResult = [];
    var skipIterations = 0;
    var carriedSequence = null;
    //   Iterate and check triplets
    for (var i = 0; i < m.length; i++) {
        if (skipIterations) {
            skipIterations--;
            continue;
        }
        // If we have a carried sequence
        if (carriedSequence) {
            // Current number - first after carried sequence
            var currentNumber = m[i];
            // If it is the last iteration
            // Add the sequence with the current number since IT IS the last number
            if (i === m.length - 1) {
                // Check whether we can add the current number to the carried sequence
                if (canContinueSequence(carriedSequence, currentNumber)) {
                    carriedSequence.values.push(currentNumber);
                    compressedResult.push(compressCarriedSequence(carriedSequence));
                }
                else {
                    // Push all the numbers to the result - it's the last iteration
                    compressedResult.push(compressCarriedSequence(carriedSequence));
                    compressedResult.push(currentNumber.toString());
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
        var currentTriplet = m.slice(i, i + 3);
        // if the triplet has a sequence - check next number for it as well
        var currentSequence = getSequence(currentTriplet);
        var firstNumber = currentTriplet[0];
        // If we don't have a sequence
        if (!currentSequence) {
            compressedResult.push(firstNumber.toString());
            continue;
        }
        // We have a sequence!
        // If we just have a couple (first & second nums)
        if (currentSequence.type === SequenceType.Identical && currentSequence.members === 'firstTwo') {
            compressedResult.push("".concat(firstNumber, "*2"));
            skipIterations = 1;
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
var finalResult = compress([1, 1, 1, 2, 5, 6, 9, 10]);
console.log(finalResult);
console.log();
