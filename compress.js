"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = void 0;
var SequenceType;
(function (SequenceType) {
    SequenceType["Identical"] = "identical";
    SequenceType["Consecutive"] = "consecutive";
    SequenceType["ConsecutiveReversed"] = "consecutive-reversed";
    SequenceType["Interval"] = "interval";
    SequenceType["IntervalReversed"] = "interval-reversed";
})(SequenceType || (SequenceType = {}));
function compress(numbers) {
    var sequences = [];
    var iterationsToSkip = 0;
    // Iterate through the string and add sequences
    for (var i = 0; i < numbers.length; i++) {
        if (iterationsToSkip) {
            iterationsToSkip--;
            continue;
        }
        var currentNumber = numbers[i];
        var currentSequence = getSequence(numbers.slice(i, i + 3));
        if (currentSequence) {
            if (currentSequence.type === SequenceType.Identical) {
                var lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2];
                // Keep checking next numbers to extend the sequence
                while (currentNumber === lastSequenceNumberAfterSkip) {
                    iterationsToSkip++;
                    currentSequence.members = 'all';
                    currentSequence.values.push(lastSequenceNumberAfterSkip);
                    lastSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2];
                }
            }
            else {
                var firstSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 1];
                var secondSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 2];
                // number after current sequence - asserting this number to current sequence
                var thirdSequenceNumberAfterSkip = numbers[i + iterationsToSkip + 3];
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
    var compressedArray = sequences.map(function (element) {
        if (typeof element === 'number') {
            return element.toString();
        }
        else {
            return compressSequence(element);
        }
    });
    return compressedArray.join(',');
}
exports.compress = compress;
function getSequence(numbers) {
    var firstNumber = numbers[0], secondNumber = numbers[1], thirdNumber = numbers[2];
    if (numbers.length === 1) {
        return false;
    }
    if (numbers.length === 2) {
        if (firstNumber === secondNumber) {
            // We have a couple
            var sequence = {
                type: SequenceType.Identical,
                members: 'firstTwo',
                values: numbers,
            };
            return sequence;
        }
        return false;
    }
    // Sequence has three numbers
    // Check number order
    if ((firstNumber < secondNumber && secondNumber > thirdNumber) ||
        (firstNumber > secondNumber && secondNumber < thirdNumber)) {
        return false;
    }
    // Check for Identical Sequence
    if (firstNumber === secondNumber) {
        var currentSequence = {
            type: SequenceType.Identical,
            members: 'firstTwo',
            values: [firstNumber, secondNumber]
        };
        if (thirdNumber === secondNumber) {
            currentSequence.members = 'all';
            values: [firstNumber, secondNumber, thirdNumber];
        }
        return currentSequence;
    }
    // Check for Consecutive Sequence
    if (Math.abs(firstNumber - secondNumber) === 1 && Math.abs(secondNumber - thirdNumber) === 1) {
        var currentSequence = {
            type: SequenceType.Consecutive,
            members: 'all',
            values: numbers,
        };
        if (firstNumber > secondNumber) {
            currentSequence.type = SequenceType.ConsecutiveReversed;
        }
        return currentSequence;
    }
    // Check for Interval Sequence
    var firstStep = secondNumber - firstNumber;
    if ((thirdNumber - firstStep) === secondNumber) {
        var currentSequence = {
            type: SequenceType.Interval,
            members: 'all',
            intervalStep: firstStep,
            values: numbers,
        };
        if (firstNumber > secondNumber) {
            currentSequence.type = SequenceType.IntervalReversed;
        }
        return currentSequence;
    }
    return false;
}
function compressSequence(sequence) {
    var compressedSequence = '';
    var firstValue = sequence.values[0];
    var lastValue = sequence.values[sequence.values.length - 1];
    switch (sequence.type) {
        case SequenceType.Identical:
            compressedSequence = "".concat(firstValue, "*").concat(sequence.values.length);
            break;
        case SequenceType.Consecutive:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue);
            break;
        case SequenceType.ConsecutiveReversed:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue);
            break;
        case SequenceType.Interval:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue, "/").concat(Math.abs(sequence.intervalStep));
            break;
        case SequenceType.IntervalReversed:
            compressedSequence = "".concat(firstValue, "-").concat(lastValue, "/").concat(Math.abs((sequence.intervalStep)));
            break;
        default:
            return compressedSequence;
    }
    return compressedSequence;
}
