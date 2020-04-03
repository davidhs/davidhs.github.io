import { numeral } from './numeral.js';

let Utils = {};

Utils.theilSenEstimator = function (theData) {

    let slopes = [];

    let data = theData.slice(0);

    data.sort(function (a, b) {
        return a[0] - b[0];
    });

    // console.log(data);

    let n = data.length;

    for (let i = 0; i < n - 1; i += 1) {

        let xi = data[i][0];
        let yi = data[i][1];

        for (let j = i + 1; j < n; j += 1) {

            let xj = data[j][0];
            let yj = data[j][1];

            let dy = yj - yi;
            let dx = xj - xi;

            let slope = dy / dx;

            slopes.push(slope);
        }
    }


    // console.log("Slopes before", slopes);

    slopes.sort(function (a, b) {
        return a - b;
    });


    // console.log("Slopes after", slopes);

    let medianSlope = Utils.getMedian(slopes);

    // console.log("Median slope", medianSlope);

    let yintercepts = [];

    for (let i = 0; i < n; i += 1) {
        let yintercept = data[i][1] - medianSlope * data[i][0];
        yintercepts.push(yintercept);
    }

    // console.log("y-intercepts before", yintercepts);

    yintercepts.sort(function (a, b) {
        return a - b;
    });


    // console.log("y-intercepts after", yintercepts);

    let medianYIntercept = Utils.getMedian(yintercepts);

    // console.log("median y intercept", medianYIntercept);


    return {
        equation: [medianSlope, medianYIntercept],
        string: "y = " + numeral(medianSlope).format('0.[00]') + "x " + (medianYIntercept < 0 ? "-" : "+") +  " " + numeral(Math.abs(medianYIntercept)).format('0.[00]')
    };

};

Utils.getMedian = function (list) {

    let median = null;

    if (list.length % 2 === 0) {
        let idx1 = list.length / 2 - 1;
        let idx2 = list.length / 2;
        let val1 = list[idx1];
        let val2 = list[idx2];
        median = (val1 + val2) / 2;
    } else {
        let idx = Math.floor(list.length / 2);
        median = list[idx];
    }

    return median;
};


export { Utils };
