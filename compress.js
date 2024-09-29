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
    if (numbers.length === 1) {
        return false;
    }
    if (numbers.length === 2) {
        if (numbers[0] === numbers[1]) {
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
    var first = numbers[0], second = numbers[1], third = numbers[2];
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
            values: [first, second]
        };
        if (third === second) {
            currentSequence.members = 'all';
            values: [first, second, third];
        }
        return currentSequence;
    }
    // TODO - optimize with ABS
    // Check for Consecutive
    if (first === (second - 1) && second === (third - 1)) {
        var currentSequence = {
            type: SequenceType.Consecutive,
            members: 'all',
            values: numbers,
        };
        return currentSequence;
    }
    // Check for Consecutive (Reversed)
    if (first === (second + 1) && second === (third + 1)) {
        var currentSequence = {
            type: SequenceType.ConsecutiveReversed,
            members: 'all',
            values: numbers,
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
            values: numbers,
        };
        if (first > second) {
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
