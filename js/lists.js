const fixed = {
    // costFactor: 65,
    laborFactor: 0.4,
    matrlFactor: 0.15,
    shearFactor: 1,
    ultiFactor: 0.75,
    yieldFactor: 0.9,
    gyrateFactor: 300,
    supportFactor: 1,
    youngMod: 200000,
    critStress: 0.658,
    reductFactor: 0.9,
    fcrConstant: 0.877,
    youngYield: 4.71,
}

const trusses = {
    mono: {
        id: 'mono',
        name: 'Mono Truss',
    },
    howe: {
        id: 'howe',
        name: 'Howe Truss',
    },
    prtt: {
        id: 'prtt',
        name: 'Pratt Truss',
    },
};

const forces = {
    tens: {id: 'tens', name: 'Tension'},
    cmpr: {id: 'cmpr', name: 'Compression'},
};

const solution = {
    bottom: {},
    tops: {},
    verts:{},
    diags: {},
    practical: { tops: [], webs: [] },
}

const detail = {force: '', forceval: 0.000, steeltype: '', steelid: '', length: 0.000, area: 0.000, cost: 0.000};

const astms = {
    a36:      {id: 'a36', name: 'A36', Fy: '248', Fu: '400'},
    a53grb:   {id: 'a53grb', name: 'A53 Gr. B', Fy: '241', Fu: '414'},
    a500grb:  {id: 'a500grb', name: 'A500 Gr. B', Fy: '290', Fu: '400'},
    a500grb:  {id: 'a500grb', name: 'A500 Gr. B', Fy: '317', Fu: '400'},
    a500grc:  {id: 'a500grc', name: 'A500 Gr. C', Fy: '317', Fu: '428'},
    a500grc:  {id: 'a500grc', name: 'A500 Gr. C', Fy: '345', Fu: '428'},
    a501gra:  {id: 'a501gra', name: 'A501 Gr. A', Fy: '248', Fu: '400'},
    a501grb:  {id: 'a501grb', name: 'A501 Gr. B', Fy: '345', Fu: '483'},
    a1085:    {id: 'a1085', name: 'A1085', Fy: '345', Fu: '448'},
    a572gr42: {id: 'a572gr42', name: 'A572 Gr. 42', Fy: '290', Fu: '414'},
    a572gr50: {id: 'a572gr50', name: 'A572 Gr. 50', Fy: '345', Fu: '448'},
    a572gr55: {id: 'a572gr55', name: 'A572 Gr. 55', Fy: '379', Fu: '483'},
    a572gr60: {id: 'a572gr60', name: 'A572 Gr. 60', Fy: '414', Fu: '517'},
    a572gr65: {id: 'a572gr65', name: 'A572 Gr. 65', Fy: '448', Fu: '552'},
    a913gr50: {id: 'a913gr50', name: 'A913 Gr. 50', Fy: '345', Fu: '448'},
    a913gr60: {id: 'a913gr60', name: 'A913 Gr. 60', Fy: '414', Fu: '517'},
    a913gr65: {id: 'a913gr65', name: 'A913 Gr. 65', Fy: '448', Fu: '552'},
    a913gr70: {id: 'a913gr70', name: 'A913 Gr. 70', Fy: '483', Fu: '621'},
    a992:     {id: 'a992', name: 'A992', Fy: '345', Fu: '448'},
};

const steels = {
    cwlips: {id: 'cwlips', name: 'C With Lips'},
    cxlips: {id: 'cxlips', name: 'C No Lips'},
    eqwlips: {id: 'eqwlips', name: 'Equal Angles With Lips'},
    eqxlips: {id: 'eqxlips', name: 'Equal Angles No Lips'},
};
