/*
* mDPI: mouse DPI
* mRD: mouse revolution distance
* IGS: in-game sensitivity
* nIGS: normalized in-game sensitivity
* tprus: ticks per revolution unit sensitivity, or
*          how many counts/ticks your mouse registers when
*          you complete a full revolution/rotation in-game
*          with in-game sensitivity set to 100.
*/

/**
 * Computes the average (median I think) of `arr`.
 *
 * @param {number[]} arr  Array of numbers.
 */
function average(arr) {
    let res = 0;
    const n = arr.length;
    for (let i = 0; i < arr.length; i += 1) {
        res += arr[i] / n;
    }
    return res;
}

/**
 * Computes how many mouse ticks / counts correspons to a full rotation
 * in game when the in-game sensitivity is set to 100.
 *
 * Also, assumes you use raw mouse input.
 *
 * @param {number} mouse_full_rotation_distance_in_cm  The distance your mouse had to travel so your character
 *                                                     in-game completed a full revolution (360°).
 * @param {number} mouse_DPI  Your mouse DPI.
 * @param {number} in_game_sensitivity  Your in-game sensitivity.
 */
function computeTicksPerFullRotation(mouse_full_rotation_distance_in_cm, mouse_DPI, in_game_sensitivity) {
    // How many centimeters in one inch.
    const scale_from_inch_to_cm = 2.54;
    // How many inches in one centimeter
    const scale_from_cm_to_inch = 1 / scale_from_inch_to_cm;
    const distance_travelled_in_cm = mouse_full_rotation_distance_in_cm;
    const distance_travelled_in_inch = distance_travelled_in_cm * scale_from_cm_to_inch;
    const mDPI = mouse_DPI;
    // In-game sensitivity, scale 1 - 100.
    const IGS = in_game_sensitivity;
    // Normalize in-game sensitivity, scale 0.01 - 1.00
    const nIGS = IGS / 100;
    const ticks_per_full_rotation = mDPI * distance_travelled_in_inch * nIGS;
    return ticks_per_full_rotation;
}

/**
 * Returns how many counts or ticks your mouse emits when
 * you complete a full revolution (turn 360°) in-game with
 * in-game sensitivity of 100.
 */
function getTicksPerFullRevolution() {
    // Measurements.
    const g = [
        computeTicksPerFullRotation(39.5, 4000, 1),
        computeTicksPerFullRotation(26, 6000, 1),
        computeTicksPerFullRotation(19.5, 8000, 1)
    ];
    // Average of measurement.
    const tpfr = average(g);


    // return tpfr;
    return 100 * 2 * Math.PI;
}

/**
 * Returns the mouse revolution distance for the given
 * mouse DPI and in-game sensitivity.
 *
 * @param {number} mDPI  mouse DPI
 * @param {number} IGS  in-game sensitivity
 */
function get_mRD(mDPI, IGS) {
    const nIGS = IGS / 100;
    const tprus = getTicksPerFullRevolution();
    const mRD = tprus / (mDPI * nIGS);
    return mRD;
}

/**
 * Returns the in-game sensitivity for the given
 * mouse DPI and mouse revolution distance.
 *
 * @param {number} mDPI  mouse DPI
 * @param {number} mRD   mouse revolution distance.
 */
function get_IGS(mDPI, mRD) {
    const tprus = getTicksPerFullRevolution();
    const nIGS = tprus / (mDPI * mRD);
    const IGS = 100 * nIGS;
    return IGS;
}


/**
 * Returns the mouse DPI for the given in-game
 * sensitivity and mouse revolution distance
 *
 * @param {number} IGS  in-game sensitivity
 * @param {number} mRD  mouse revolution distance
 */
function get_mDPI(IGS, mRD) {
    const tprus = getTicksPerFullRevolution();
    const nIGS = 0.01 * IGS;
    const mDPI = tprus / (nIGS * mRD);
    return mDPI;
}

/**
 * Format number
 * 
 * @param {number} n  the number
 */
function fmt(n) {
    return n.toFixed(3);
}


// Do not keep track of derived values.
const sheet = {
    f1: {
        mDPI: 400,
        IGS: 100,
        unit: "inch"
    },
    f2: {
        IGS: 100,
        RD: 10,
        unit: "inch"
    },
    f3: {
        mDPI: 400,
        RD: 10,
        unit: "inch"
    }
};


const dom = {
    f1: {
        mdpi: document.getElementById('f1_mdpi'),
        igs: document.getElementById('f1_igs'),
        rd: document.getElementById('f1_rd'),
        ui: document.getElementById('f1_ui'),
        uc: document.getElementById('f1_uc')
    },
    f2: {
        mdpi: document.getElementById('f2_mdpi'),
        igs: document.getElementById('f2_igs'),
        rd: document.getElementById('f2_rd'),
        ui: document.getElementById('f2_ui'),
        uc: document.getElementById('f2_uc')
    },
    f3: {
        mdpi: document.getElementById('f3_mdpi'),
        igs: document.getElementById('f3_igs'),
        rd: document.getElementById('f3_rd'),
        ui: document.getElementById('f3_ui'),
        uc: document.getElementById('f3_uc')
    }
};


// Form 1: get revolution distance
{
    dom.f1.ui.onchange = (e) => {
        sheet.f1.unit = "inch";
        updateForm();
    };

    dom.f1.uc.onchange = (e) => {
        sheet.f1.unit = "cm";
        updateForm();
    };

    dom.f1.mdpi.onmousewheel = dom.f1.igs.onmousewheel = (e) => { };

    dom.f1.mdpi.onchange = dom.f1.mdpi.oninput = (e) => {
        const dpi = +e.target.value;
        if (dpi >= 1) {
            sheet.f1.mDPI = dpi;
            updateForm();
        }
    };

    dom.f1.igs.onchange = dom.f1.igs.oninput = (e) => {
        const igs = +e.target.value;
        if (igs >= 1 && igs <= 100) {
            sheet.f1.IGS = igs;
            updateForm();
        }
    };

}

// Form 2: get mouse DPI
{
    dom.f2.ui.onchange = (e) => {
        sheet.f2.unit = "inch";
        updateForm();
    };

    dom.f2.uc.onchange = (e) => {
        sheet.f2.unit = "cm";
        updateForm();
    };

    dom.f2.mdpi.onmousewheel = dom.f2.rd.onmousewheel = (e) => { };


    dom.f2.igs.onchange = dom.f2.igs.oninput = (e) => {
        const igs = +e.target.value;
        if (igs >= 1 && igs <= 100) {
            sheet.f2.IGS = igs;
            updateForm();
        }
    };

    dom.f2.rd.onchange = dom.f2.rd.oninput = (e) => {
        const rd = +e.target.value;
        if (rd > 0 && rd <= 10000) {
            sheet.f2.RD = rd;
            updateForm();
        }
    };

}

// Form 3: get in-game sensitivity
{
    dom.f3.ui.onchange = (e) => {
        sheet.f3.unit = "inch";
        updateForm();
    };

    dom.f3.uc.onchange = (e) => {
        sheet.f3.unit = "cm";
        updateForm();
    };

    dom.f3.mdpi.onchange = dom.f3.mdpi.oninput = (e) => {
        const dpi = +e.target.value;
        if (dpi >= 1) {
            sheet.f3.mDPI = dpi;
            updateForm();
        }
    };

    dom.f3.rd.onchange = dom.f3.rd.oninput = (e) => {
        const rd = +e.target.value;
        if (rd > 0 && rd <= 10000) {
            sheet.f3.RD = rd;
            updateForm();
        }
    };

}


/**
 * 
 */
function updateForm() {
    // Form 1
    {
        const mRD_inches = get_mRD(sheet.f1.mDPI, sheet.f1.IGS);

        if (sheet.f1.unit === "cm") {
            const mRD_cm = mRD_inches * 2.54;
            dom.f1.rd.innerText = fmt(mRD_cm);
        } else if (sheet.f1.unit === "inch") {
            dom.f1.rd.innerText = fmt(mRD_inches);
        }
    }

    // Form 2
    {
        const rd_inch = (sheet.f2.unit === "inch") ? sheet.f2.RD : sheet.f2.RD / 2.54;
        const mDPI = get_mDPI(sheet.f2.IGS, rd_inch);
        dom.f2.mdpi.innerText = fmt(mDPI);
    }

    // FOrm 3
    {
        const rd_inch = (sheet.f3.unit === "inch") ? sheet.f3.RD : sheet.f3.RD / 2.54;
        const IGS = get_IGS(sheet.f3.mDPI, rd_inch);
        dom.f3.igs.innerText = fmt(IGS);
    }
}


/**
 * 
 */
function updateSheetUI() {
    // Form 1
    {
        dom.f1.mdpi.value = "" + sheet.f1.mDPI;
        dom.f1.igs.value = "" + sheet.f1.IGS;

        const mDPI = sheet.f1.mDPI;
        const IGS = sheet.f1.IGS;

        // Measured in inches.
        const mRD_inch = get_mRD(mDPI, IGS);

        const mRD_report = sheet.f1.unit === "inch" ? mRD_inch : mRD_inch * 2.54;

        dom.f1.rd.innerText = "" + mRD_report;
    }

    // Form 2
    {
        dom.f2.igs.value = "" + sheet.f2.IGS;
        dom.f2.rd.value = "" + sheet.f2.RD;


        const IGS = sheet.f2.IGS;
        // Measured in inches
        const mRD_unknown = sheet.f2.RD;
        const mRD_inch = sheet.f2.unit === "inch" ? mRD_unknown : mRD_unknown / 2.54;

        const mDPI = get_mDPI(IGS, mRD_inch);

        dom.f2.mdpi.innerText = "" + mDPI;
    }

    // Form 3
    {
        dom.f3.mdpi.value = "" + sheet.f3.mDPI;
        dom.f3.rd.value = "" + sheet.f3.RD;


        


        const mDPI = sheet.f3.mDPI;
        const mRD_unknown = sheet.f3.RD;
        const mRD_inch = sheet.f3.unit === "inch" ? mRD_unknown : mRD_unknown / 2.54;

        console.log(mDPI, mRD_unknown, sheet.f3.unit);

        const IGS = get_IGS(mDPI, mRD_inch);

        dom.f2.igs.innerText = "" + IGS;
    }
}

/**
 * 
 * @param {number} igs 
 * @param {number} dpi 
 * @param {number} unit 
 */
function setProfile(igs, dpi, unit = "inch") {
    const form_names = Object.keys(sheet);
    for (let i = 0; i < form_names.length; i += 1) {
        const form_name = form_names[i];
        const form = sheet[form_name];

        if (unit === "inch") {
            form.unit = "inch";
        } else if (unit === "cm") {
            form.unit = "cm";
        }


        if ("mDPI" in form) {
            form.mDPI = dpi;
        }
        if ("IGS" in form) {
            form.IGS = igs;
        }
        if ("RD" in form) {
            form.RD = get_mRD(dpi, igs);
        }

        if (unit === "inch") {
            dom[form_name].ui.click();
        } else if (unit === "cm") {
            dom[form_name].uc.click();
        }

    }
    updateSheetUI();
    updateForm();
}

// profiles

document.getElementById('profile_shroud').onclick = (e) => {
    setProfile(11, 400);
};

document.getElementById('profile_king_george').onclick = (e) => {
    setProfile(15, 800);
};

// Update form

updateForm();