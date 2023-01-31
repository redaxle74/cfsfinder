// declare search parameter variables
var _astmType = '';
var _trussType = '';
var _roofLength = 0;
var _roofHeight = 0;
var _spaceCount = 0;
var _costFactor = 0.000;
var _topSteel = '';
var _btmSteel = '';
var _webSteel = '';

var _numTops = 0;
var _numVerts = 0;
var _numDiags = 0;
var _effSpaces = 0;
var _effLength = 0;

var _maxCostFactor = 1000.000;
var _maxHeight = 3.000;
var _minLength = 6.000;
var _maxLength = 10.000;
var _minSpaces = 6;
var _maxSpaces = 20;
var _maxTops = 2;

// UI variables
var _svgWidth = 1300;
var _svgHeight = 325;
var _svgxScale = 0;
var _svgyScale = 0;
var _svgxOffset = 10;
var _svgyOffset = 5;
var _spaceWidth = 0;


/*
set demo mode
options: false, true
 */
var demo = false;
// var demo = true;

// declare solution and summary objects
var _solution = {};
var _summary = {};

/**
 * [ui] prepare common elements
 */
function prepMain()
{
    var args = urlArgs();
    demo = (args.demo !== undefined);

    var jumpto = $('.jumpto');
    jumpto.empty();
    jumpto.append(`
        &nbsp;Jump to:&nbsp;
        <select id="jumpto" name="jumpto" onchange="jumpTo(this);" style="width:20em;">
            <option value="">(Select)</option>
            <option value="costbasedjump">Cost-Based Summary</option>
            <option value="practicaljump">Practical Summary</option>
            <option value="bottomtests">Bottom Chord Evaluations</option>
            <option value="topsmember">Top Members Evaluations</option>
            <option value="vertsmember"> Vertical Members Evaluations</option>
            <option value="diagsmember">Diagonal Members Evaluations</option>
        </select>
    `);

    var step2tops = $('#btmtopinputs');
    step2tops.append(memberGrp('B', 'btm'));
    for (var i = 1; i <= _maxTops; i++) {
        step2tops.append(memberGrp('T' + zeroLPad(i, 2), 'top'));
    }

    var step2verts = $('#vertinputs');
    var step2diags = $('#diaginputs');
    for (var i = 1; i <= _maxSpaces; i++) {
        step2verts.append(memberGrp('V' + zeroLPad(i, 2), 'vert'));
        step2diags.append(memberGrp('D' + zeroLPad(i, 2), 'diag'));
    }
}

/**
 * [ui] show step 1 page
 */
function showStep1(fill = true)
{
    if (fill) prepStep1();
    if (fill && demo) demoStep1();
    $('#step2, #step3x, #result').hide();
    $('#step1').show();
    $('#_trussType').focus();
}

/**
 * [ui] prepare step 1 page
 */
function prepStep1()
{
    $('#_spaceCount').val('0');
    $('#_roofLength, #_roofHeight').val('0.000');
    $('#maxCostFactor').text(_maxCostFactor);
    $('#minSpaces').text(_minSpaces);
    $('#maxSpaces').text(_maxSpaces);
    $('#minLength').text(_minLength);
    $('#maxLength').text(_maxLength);
    $('#maxHeight').text(_maxHeight);

    var cfs = $('#_topSteel, #_btmSteel, #_webSteel');
    for (var i in steels) {
        cfs.append($("<option></option>")
                        .attr("value", steels[i].id)
                        .text(steels[i].name));
    }

    var astm = $('#_astmType');
    for (var i in astms) {
        astm.append($("<option></option>")
                        .attr("value", astms[i].id)
                        .text(astms[i].name + ' - Fy: ' + astms[i].Fy + ' - Fu:' + astms[i].Fu));
    }

    var truss = $('#_trussType');
    for (var i in trusses) {
        truss.append($("<option></option>")
                        .attr("value", trusses[i].id)
                        .text(trusses[i].name));
    }
    truss.focus();
}

/**
 * assign demo values to step 1 values
 */
function demoStep1()
{
    $('#_astmType').val('a36');
    // $('#_trussType').val('prtt');
    $('#_trussType').val('howe');
    // $('#_trussType').val('mono');
    $('#_spaceCount').val(6);
    $('#_costFactor').val(65);
    // $('#_spaceCount').val(8);
    $('#_roofLength').val(6);
    $('#_roofHeight').val(2);
    $('#_btmSteel').val(randomItem(steels).id);
    $('#_topSteel').val(randomItem(steels).id);
    $('#_webSteel').val(randomItem(steels).id);
}

/**
 * check step 1 input values
 */
function checkStep1()
{
    var passed = true;
    var message = '';
    var focus = '';

    focus = '#_trussType';
    _trussType = $(focus).val();
    if (_trussType == '') {
        passed = false;
        message = 'Please select Truss Type!';
    }

    if (passed) {
        focus = '#_roofLength';
        _roofLength = trunc(Number($(focus).val()));
        if (isNaN(_roofLength) || _roofLength <= 0.000) { passed = false; message = 'Invalid Roof Length!'; }
        else if (_roofLength < _minLength || _roofLength > _maxLength) { passed = false; message = 'Valid Roof Length: ' + _minLength + ' to ' + _maxLength; }
        else { $(focus).val(_roofLength); _roofLength *= 1000; }
    }
    if (passed) {
        focus = '#_roofHeight';
        _roofHeight = trunc(Number($(focus).val()));
        if (isNaN(_roofHeight) || _roofHeight <= 0.000) { passed = false; message = 'Invalid Roof Height!'; }
        else if (_roofHeight < 1.000 || _roofHeight > _maxHeight) { passed = false; message = 'Valid Roof Height: 1 to ' + _maxHeight; }
        else { $(focus).val(_roofHeight); _roofHeight *= 1000; }
    }
    if (passed) {
        focus = '#_spaceCount';
        _spaceCount = Number($(focus).val());
        if (!Number.isInteger(_spaceCount) || _spaceCount <= 0.000) { passed = false; message = 'Invalid Space Count!'; }
        else if (_spaceCount < _minSpaces || _spaceCount > _maxSpaces) { passed = false; message = 'Valid Space Count: ' + _minSpaces + ' to ' + _maxSpaces; }
        else if (_trussType != 'mono' && oddEven(_spaceCount) == 'odd') { passed = false; message = 'For a ' + trusses[_trussType].name + ', Space Count must be an Even Number!' }
        else $(focus).val(_spaceCount);
    }
    if (passed) {
        focus = '#_costFactor';
        _costFactor = Number($(focus).val());
        if (!Number.isInteger(_costFactor) || _costFactor <= 0.000) { passed = false; message = 'Invalid Cost Factor!'; }
        else if (_costFactor < 0 || _costFactor > _maxCostFactor) { passed = false; message = 'Valid Cost Factor: 0 to ' + _maxCostFactor; }
        else $(focus).val(_costFactor);
    }
    if (passed) {
        focus = '#_astmType';
        _astmType = $(focus).val();
        if (_astmType == '') { passed = false; message = 'Please select ASTM Type!'; }
    }
    if (passed) {
        focus = '#_btmSteel';
        _btmSteel = $(focus).val();
        if (_btmSteel == '') { passed = false; message = 'Please select Bottom CFS Type!'; }
    }
    if (passed) {
        focus = '#_topSteel';
        _topSteel = $(focus).val();
        if (_topSteel == '') { passed = false; message = 'Please select Top CFS Type!'; }
    }
    if (passed) {
        focus = '#_webSteel';
        _webSteel = $(focus).val();
        if (_webSteel == '') { passed = false; message = 'Please select Web CFS Type!'; }
    }

    // if validation fails, show error dialog
    window.scrollTo(0,0);
    if (!passed) {
        cuteToast({type: 'error', message});
        $(focus).focus();
    }
    else {
        showStep2();
    }
}

/**
 * [ui] show step 2 page
 */
function showStep2(fill = true)
{
    spawnMembers();
    drawTruss();
    if (fill) prepStep2();
    if (fill && demo) demoStep2();
    $('#step1, #step3, #result').hide();
    $('#step2').show();
    $('#_BType').focus();
}

/**
 * generate truss members and their properties
 */
function spawnMembers()
{
    _solution = Object.assign({}, solution);

    // space length
    _solution.spaceLength = trunc(_roofLength / _spaceCount);

    // roof effective length, effective spaces, vertical count
    _effLength = (_trussType == 'mono') ? _roofLength : (_roofLength / 2);
    _effSpaces = (_trussType == 'mono') ? _spaceCount : (_spaceCount / 2);
    _numVerts = (_trussType == 'mono') ? _spaceCount : _spaceCount - 1;
    _numTops = (_trussType == 'mono') ? 1 : 2;

    // bottom chord length and default values
    _solution.bottom.length = _roofLength;
    _solution.bottom['passed'] = []; _solution.bottom['failed'] = [];
    _solution.bottom.values = {};

    // top chord length and default values
    var topLength = trunc(Math.sqrt(Math.pow(_effLength, 2) + Math.pow(_roofHeight, 2)));
    if (_trussType == 'mono') {
        var member = {id: 'T01'};
        member.length = topLength;
        member.values = {};
        _solution.tops['T01'] = member;
    }
    else {
        for (var t = 1; t <= _numTops; t++) {
            var tid = 'T' + zeroLPad(t, 2);
            var member = {id: tid};
            member.length = topLength
            member.values = {};
            _solution.tops[tid] = member;
        }
    }

    // vertical members length
    var offsetid = 0;
    var offset = 1;
    for (var vnum = 1 ; vnum <= _numVerts; vnum++) {
        offsetid += offset;
        var vid = 'V' + zeroLPad(vnum, 2);
        var member = {id: vid};
        member.length = trunc((offsetid * _solution.spaceLength * _roofHeight) / _effLength);
        member.values = {};
        _solution.verts[vid] = member;

        if (vnum >= _effSpaces && offset == 1) offset = -1;
    }

    // diagonal members length
    var offsetid = 0;
    var offset = 1;
    _numDiags = 0;
    for (var vnum = 1 ; vnum <= _numVerts; vnum++) {
        offsetid += offset;
        if (vnum != _effSpaces) {
            _numDiags++;
            var vid = 'V' + zeroLPad(vnum, 2);
            var did = 'D' + zeroLPad(_numDiags, 2);
            var refvid = (_trussType != 'prtt') ? vid : ('V' + zeroLPad(vnum + offset, 2));
            var member = {id: did};
            member.length = trunc(Math.sqrt(Math.pow(_solution.verts[refvid].length, 2) + Math.pow(_solution.spaceLength, 2)));
            member.values = {};
            _solution.diags[did] = member;
        }
        if (vnum >= _effSpaces && offset == 1) offset = -1;
    }
}

/**
 * [ui] draw the truss and members
 */
function drawTruss()
{
    var svg = $('#dimforce')[0];
    svg.innerHTML = '';

    el = svgNode('rect');
    el.setAttribute('x', 0);
    el.setAttribute('y', 0);
    el.setAttribute('width', 188);
    el.setAttribute('height', 35);
    el.setAttribute('rx', 5);
    el.setAttribute('ry', 5);
    el.setAttribute('stroke', 'none');
    el.setAttribute('fill', '#787878');
    svg.appendChild(el);

    el = svgNode('text');
    el.setAttribute('x', 96);
    el.setAttribute('y', 25);
    el.setAttribute('stroke', 'none');
    el.classList.add('trussName');
    el.textContent = trusses[_trussType].name;
    svg.appendChild(el);

    _svgxScale = trunc(_svgWidth / 12000);
    _svgyScale = trunc(_svgHeight / 3000);
    _svgxOffset = 10 + ((_svgWidth - (_roofLength * _svgxScale)) / 2);
    _spaceWidth = trunc(_solution.bottom.length / _spaceCount) * _svgxScale;

    // bottom
    var rx = _roofLength * _svgyScale;
    drawMember(svg, _svgxOffset, _svgyOffset + _svgHeight, _svgxOffset + rx, _svgyOffset + _svgHeight);
    drawBadge(svg, 'B', (_svgWidth / 2) + 10, _svgHeight + 25, 'btm');

    if (_trussType != 'mono') {
        // top left
        var x2 = _svgxOffset + (rx / 2);
        var y2 = _svgyOffset + _svgHeight - (_roofHeight * _svgyScale);
        drawMember(svg, _svgxOffset, _svgyOffset + _svgHeight, x2, y2);
        drawBadge(svg, 'T01', x2 - 60, y2 + 13, 'top');

        // top right
        drawMember(svg, _svgxOffset + rx, _svgyOffset + _svgHeight, x2, y2);
        drawBadge(svg, 'T02', x2 + 60, y2 + 13, 'top');

        // left diagonals
        xref = 0;
        for (var dnum = 1 ; dnum < _effSpaces; dnum++) {
            xref += _spaceWidth;
            x2 = xref + _spaceWidth;
            var vid = 'V' + zeroLPad((_trussType == 'howe') ? dnum : dnum + 1, 2);
            var y1 = (_trussType == 'howe') ? _svgHeight - (_solution.verts[vid].length * _svgyScale) : _svgHeight;
            var y2 = (_trussType == 'howe') ? _svgHeight : _svgHeight - (_solution.verts[vid].length * _svgyScale);
            drawMember(svg, _svgxOffset + xref, _svgyOffset + y1, _svgxOffset + x2, _svgyOffset + y2);

            var bx = _svgxOffset + xref + (_spaceWidth / 2);
            var by = _svgHeight - (_solution.verts[vid].length * _svgyScale / 2);
            drawBadge(svg, 'D' + zeroLPad(dnum, 2), bx, by, 'diag');
        }
        // right diagonals
        for (var dnum = _effSpaces ; dnum <= _numDiags; dnum++) {
            xref += _spaceWidth;
            x2 = xref + _spaceWidth;
            var vid = 'V' + zeroLPad((_trussType == 'howe') ? dnum + 1 : dnum, 2);
            var y1 = (_trussType == 'howe') ? _svgHeight : _svgHeight - (_solution.verts[vid].length * _svgyScale);
            var y2 = (_trussType == 'howe') ? _svgHeight - (_solution.verts[vid].length * _svgyScale) : _svgHeight;
            drawMember(svg, _svgxOffset + xref, _svgyOffset + y1, _svgxOffset + x2, _svgyOffset + y2);

            var bx = _svgxOffset + xref + (_spaceWidth / 2);
            var by = _svgHeight - (_solution.verts[vid].length * _svgyScale / 2);
            drawBadge(svg, 'D' + zeroLPad(dnum, 2), bx, by, 'diag');
        }

        // verticals
        var xref = 0;
        for (var vnum = 1 ; vnum <= _numVerts; vnum++) {
            xref += _spaceWidth;
            var vid = 'V' + zeroLPad(vnum, 2);
            var y2 = (_solution.verts[vid].length * _svgyScale);
            drawMember(svg, _svgxOffset + xref, _svgyOffset + _svgHeight, _svgxOffset + xref, _svgyOffset + _svgHeight - y2);

            var by = _svgHeight - (_solution.verts[vid].length * _svgyScale / 2);
            drawBadge(svg, vid, _svgxOffset + xref, _svgyOffset + by, 'vert');
        }
    }
    else {
        // top
        var y2 = _svgHeight - (_roofHeight * _svgyScale);
        drawMember(svg, _svgxOffset, _svgyOffset + _svgHeight, _svgxOffset + rx, _svgyOffset + y2);

        var cx = _svgxOffset + ((_spaceWidth * _spaceCount) / 2);
        var cy = _svgHeight - (_solution.verts['V' + zeroLPad(parseInt(_numVerts/2), 2)].length * _svgyScale) - 15;
        drawBadge(svg, 'T01', cx, cy, 'top');

        // diagonals
        xref = 0;
        for (var dnum = 1 ; dnum <= _numDiags; dnum++) {
            xref += _spaceWidth;
            x2 = xref + _spaceWidth;
            var vid = 'V' + zeroLPad(dnum, 2);
            var y1 = (_solution.verts[vid].length * _svgyScale);
            drawMember(svg, _svgxOffset + xref, _svgyOffset + _svgHeight - y1, _svgxOffset + x2, _svgyOffset + _svgHeight);

            var bx = _svgxOffset + xref + (_spaceWidth / 2);
            var by = _svgHeight - (_solution.verts[vid].length * _svgyScale / 2);
            drawBadge(svg, 'D' + zeroLPad(dnum, 2), bx, by, 'diag');
        }

        // verticals
        var xref = 0;
        for (var vnum = 1 ; vnum <= _numVerts; vnum++) {
            xref += _spaceWidth;
            var vid = 'V' + zeroLPad(vnum, 2);
            var y2 = (_solution.verts[vid].length * _svgyScale);
            drawMember(svg, _svgxOffset + xref, _svgyOffset + _svgHeight, _svgxOffset + xref, _svgyOffset + _svgHeight - y2);

            var by = _svgHeight - (_solution.verts[vid].length * _svgyScale / 2);
            drawBadge(svg, vid, _svgxOffset + xref, _svgyOffset + by, 'vert');
        }

    }
}

/**
 * [ui] draw a member figure
 */
function drawMember(svg, x1, y1, x2, y2)
{
    var el = svgNode('line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    svg.appendChild(el);
}

/**
 * [ui] draw a member badge label
 */
function drawBadge(svg, label, x, y, color)
{
    grp = svgNode('g');
    grp.setAttribute('id', 'grp' + label);
    grp.setAttribute('onclick', '$("#_' + label + 'Type").focus();');
    grp.classList.add('badger');
    grp.classList.add('grpbadge');

    el = svgNode('circle');
    el.setAttribute('cx', x);
    el.setAttribute('cy', y);
    el.setAttribute('stroke', 'none');
    el.setAttribute('r', 14);
    el.classList.add('badge' + color);
    grp.appendChild(el);

    el = svgNode('text');
    el.setAttribute('x', x);
    el.setAttribute('y', y + 5);
    el.setAttribute('stroke', 'none');
    el.classList.add('badge');
    el.textContent = label;
    grp.appendChild(el);

    svg.appendChild(grp);
}

/**
 * [ui] prepare step 2 page
 */
function prepStep2()
{
    $('#step2 .inputgrp').hide();
    $('#btmtopinputs #grpB').show();
    for (_id in _solution.tops) $('#btmtopinputs #grp' + _id).show();
    for (_id in _solution.verts) $('#vertinputs #grp' + _id).show();
    for (_id in _solution.diags) $('#diaginputs #grp' + _id).show();
}

/**
 * assign demo values to step 2 values
 */
function demoStep2()
{
    $('#_BType').val(randomItem(forces).id);
    $('#_BForce').val(randomNum(10,25));

    for (_id in _solution.tops) {
        $('#_' + _id + 'Type').val(randomItem(forces).id);
        $('#_' + _id + 'Force').val(randomNum(10,25));
    }
    for (_id in _solution.verts) {
        $('#_' + _id + 'Type').val(randomItem(forces).id);
        $('#_' + _id + 'Force').val(randomNum(10,25));
    }
    for (_id in _solution.diags) {
        $('#_' + _id + 'Type').val(randomItem(forces).id);
        $('#_' + _id + 'Force').val(randomNum(10,25));
    }
}

/**
 * check step 2 input values
 */
function checkStep2()
{
    var passed = true;
    var message = '';
    var focus = '';

    focus = '#_BType';
    _btmType = $(focus).val();
    if (_btmType == '') {
        passed = false;
        message = 'Please select B Force Type!';
    }
    else solution.bottom.type = _btmType;
    if (passed) {
        focus = '#_BForce';
        _btmForce = trunc(Number($(focus).val()));
        if (isNaN(_btmForce) || _btmForce <= 0.000) { passed = false; message = 'Invalid B Force Value!'; }
        else { $(focus).val(_btmForce); solution.bottom.force = _btmForce * 1000; }
    }

    if (passed) {
        for (_id in _solution.tops) {
            focus = '#_' + _id + 'Type';
            _mType = $(focus).val();
            if (_mType == '') {
                passed = false;
                message = 'Please select ' + _id + ' Top Force Type!';
                break;
            }
            else solution.tops[_id].type = _mType;
            if (passed) {
                focus = '#_' + _id + 'Force';
                _mForce = trunc(Number($(focus).val()));
                if (isNaN(_mForce) || _mForce <= 0.000) { passed = false; message = 'Invalid ' + _id + ' Top Force Value!'; break; }
                else { $(focus).val(_mForce); solution.tops[_id].force = _mForce * 1000; }
            }
        }
    }

    if (passed) {
        for (_id in _solution.verts) {
            focus = '#_' + _id + 'Type';
            _mType = $(focus).val();
            if (_mType == '') {
                passed = false;
                message = 'Please select ' + _id + ' Vertical Force Type!';
                break;
            }
            else solution.verts[_id].type = _mType;
            if (passed) {
                focus = '#_' + _id + 'Force';
                _mForce = trunc(Number($(focus).val()));
                if (isNaN(_mForce) || _mForce <= 0.000) { passed = false; message = 'Invalid ' + _id + ' Vertical Force Value!'; break; }
                else { $(focus).val(_mForce); solution.verts[_id].force = _mForce * 1000; }
            }
        }
    }

    if (passed) {
        for (_id in _solution.diags) {
            focus = '#_' + _id + 'Type';
            _mType = $(focus).val();
            if (_mType == '') {
                passed = false;
                message = 'Please select ' + _id + ' Diagonal Force Type!';
                break;
            }
            else solution.diags[_id].type = _mType;
            if (passed) {
                focus = '#_' + _id + 'Force';
                _mForce = trunc(Number($(focus).val()));
                if (isNaN(_mForce) || _mForce <= 0.000) { passed = false; message = 'Invalid ' + _id + ' Diagonal Force Value!'; break; }
                else { $(focus).val(_mForce); solution.diags[_id].force = _mForce * 1000; }
            }
        }
    }

    // if validation fails, show error dialog
    window.scrollTo(0,0);
    if (!passed) {
        cuteToast({type: 'error', message});
        $(focus).focus();
    }
    else {
        showStep3();
        goSolve();
    }
}

/**
 * [ui] show step 3 page
 */
function showStep3()
{
    $('#jumpto, .teststat').val('');
    $('.choices').empty();
    $('#step1, #step2, #result').hide();
    $('#step3').show();
}

/**
 * prepare solution
 */
function goSolve()
{
    prepMembers();
    probeSteels();
    tallyResult();
    console.log('_solution:', _solution);
    console.log('_summary:', _summary);

    showResult();
}

/**
 * initialize member evaluations
 */
function prepMembers()
{
    _solution.bottom.values = {};
    if (_solution.bottom.type == 'tens') {
        _solution.bottom.values = {
            Ag: trunc(_solution.bottom.force / (fixed.yieldFactor * astms[_astmType].Fy)),
            Ae: trunc(_solution.bottom.force / (fixed.ultiFactor * astms[_astmType].Fu)),
            rmin: trunc(_solution.bottom.length / fixed.gyrateFactor),
        };
        _solution.bottom['passed'] = []; _solution.bottom['failed'] = [];
    }

    for (_id in _solution.tops) {
        _solution.tops[_id].values = {};
        if (_solution.tops[_id].type == 'tens') {
            _solution.tops[_id].values = {
                Ag: trunc(_solution.tops[_id].force / (fixed.yieldFactor * astms[_astmType].Fy)),
                Ae: trunc(_solution.tops[_id].force / (fixed.ultiFactor * astms[_astmType].Fu)),
                rmin: trunc(_solution.tops[_id].length / fixed.gyrateFactor),
            };
        }
        _solution.tops[_id]['passed'] = []; _solution.tops[_id]['failed'] = [];
    }

    for (_id in _solution.verts) {
        _solution.verts[_id].values = {};
        if (_solution.verts[_id].type == 'tens') {
            _solution.verts[_id].values = {
                Ag: trunc(_solution.verts[_id].force / (fixed.yieldFactor * astms[_astmType].Fy)),
                Ae: trunc(_solution.verts[_id].force / (fixed.ultiFactor * astms[_astmType].Fu)),
                rmin: trunc(_solution.verts[_id].length / fixed.gyrateFactor),
            };
        }
        _solution.verts[_id]['passed'] = []; _solution.verts[_id]['failed'] = [];
    }

    for (_id in _solution.diags) {
        _solution.diags[_id].values = {};
        if (_solution.diags[_id].type == 'tens') {
            _solution.diags[_id].values = {
                Ag: trunc(_solution.diags[_id].force / (fixed.yieldFactor * astms[_astmType].Fy)),
                Ae: trunc(_solution.diags[_id].force / (fixed.ultiFactor * astms[_astmType].Fu)),
                rmin: trunc(_solution.diags[_id].length / fixed.gyrateFactor),
            };
        }
        _solution.diags[_id]['passed'] = []; _solution.diags[_id]['failed'] = [];
    }

}

/**
 * probe qualified steel types per member
 */
function probeSteels()
{
    for (var stid in steels) {
        if (_btmSteel == stid) {
            var specs = Object.values(steelspecs[stid]);
            for (var specid in specs) {
                var steel = specs[specid];
                var check = (_solution.bottom.type == 'tens') ?
                    doTension(stid, _solution.bottom, steel) :
                    doCompression(stid, _solution.bottom, steel);
                _solution.bottom[(check.pass ? 'passed' : 'failed')].push(check.details);
            }
        }

        if (_topSteel == stid) {
            var specs = Object.values(steelspecs[stid]);
            for (var specid in specs) {
                var steel = specs[specid];
                for (var mid in _solution.tops) {
                    var check = (_solution.tops[mid].type == 'tens') ?
                        doTension(stid, _solution.tops[mid], steel) :
                        doCompression(stid, _solution.tops[mid], steel);
                    _solution.tops[mid][(check.pass ? 'passed' : 'failed')].push(check.details);
                }
            }
        }

        if (_webSteel == stid) {
            var specs = Object.values(steelspecs[stid]);
            for (var specid in specs) {
                var steel = specs[specid];
                for (var mid in _solution.verts) {
                    var check = (_solution.verts[mid].type == 'tens') ?
                        doTension(stid, _solution.verts[mid], steel) :
                        doCompression(stid, _solution.verts[mid], steel);
                    _solution.verts[mid][(check.pass ? 'passed' : 'failed')].push(check.details);
                }

                for (var mid in _solution.diags) {
                    var check = (_solution.diags[mid].type == 'tens') ?
                        doTension(stid, _solution.diags[mid], steel) :
                        doCompression(stid, _solution.diags[mid], steel);
                    _solution.diags[mid][(check.pass ? 'passed' : 'failed')].push(check.details);
                }
            }
        }
    }

    _solution.bottom.passed.sort(sortCost);
    for (var mid in _solution.tops) _solution.tops[mid].passed.sort(sortCost);
    for (var mid in _solution.verts) _solution.verts[mid].passed.sort(sortCost);
    for (var mid in _solution.diags) _solution.diags[mid].passed.sort(sortCost);
}

/**
 * validate member with tension force type
 */
function doTension(stid, member, steel)
{
    var checks = [
        {
            desc: 'steel area (' + steel.area + ') > Ag (' + member.values.Ag + ')',
            pass: (steel.area > member.values.Ag),
        },
        {
            desc: 'steel area (' + steel.area + ') > Ae * ∐ (' + member.values.Ae + ' * ' + fixed.shearFactor + ')',
            pass: (steel.area * fixed.shearFactor > member.values.Ae),
        },
        {
            desc: 'rx (' + steel.rx + ') > rmin (' + member.values.rmin + ')',
            pass: (steel.rx > member.values.rmin),
        },
        {
            desc: 'ry (' + steel.ry + ') > rmin (' + member.values.rmin + ')',
            pass: (steel.ry > member.values.rmin),
        },
    ];
    var _pass = true;
    for (c in checks) {
        if (!checks[c].pass) {
            _pass = false;
            break;
        }
    }
    var _result = {pass: _pass, details: {id: steel.id, area: steel.area} };
    if (_pass) _result.details.cost = computeCost(stid, steel, member);
    _result.details.checks = checks;

    return _result;
}

/**
 * validate member with compression force type
 */
function doCompression(stid, member, steel)
{
    var values = {};
    values.P = member.force;
    values.Ag = steel.area;
    values.KLrx = trunc((fixed.supportFactor * member.length) / steel.rx);
    values.KLry = trunc((fixed.supportFactor * member.length) / steel.ry);
    values.KLr =  (values.KLry > values.KLrx) ? values.KLry : values.KLrx;
    values.Fe = trunc((Math.pow(Math.PI, 2) * fixed.youngMod) / Math.pow(values.KLr, 2));
    values.YYf = trunc(fixed.youngYield * Math.sqrt(fixed.youngMod / astms[_astmType].Fy));
    values.Fcr = trunc( (values.KLr <= member.YYf) ?
        (Math.pow(fixed.critStress, (astms[_astmType].Fy / values.Fe)) * astms[_astmType].Fy) :
        (fixed.fcrConstant * values.Fe));
    values.Pn = trunc(values.Fcr * steel.area);
    values.Pu = trunc(fixed.reductFactor * values.Pn);
    _pass = (values.Pu > member.force);
    var checks = [{
        desc: 'Pu (' + values.Pu + ') > P (' + member.force + ')',
        pass: _pass,
    }];

    var _result = {pass: _pass, details: {id: steel.id, area: steel.area} };
    if (_pass) _result.details.cost = computeCost(stid, steel, member);
    _result.details.values = values;
    _result.details.checks = checks;

    return _result;
}

/**
 * calculate for the member cost
 */
function computeCost(stid, steel, member)
{
    var cost = 0;
    var costKg = _costFactor / 1000;
    // var costKg = fixed.costFactor;
    var steelWeight = steel.weight / 1000;
    switch (stid) {
        case 'cwlips':
            cost = trunc(
                (costKg * steelWeight * member.length * steel.t * (
                    steel.D + (steel.d * 2) + (steel.B * 2)
                )) * (1 + fixed.laborFactor + fixed.matrlFactor)
            );
            break;

        case 'cxlips':
            cost =  trunc(
                (costKg * steelWeight * member.length * steel.t * (
                    steel.D + (steel.B * 2)
                )) * (1 + fixed.laborFactor + fixed.matrlFactor)
            );
            break;

        case 'eqwlips':
            cost =  trunc(
                (costKg * steelWeight * member.length * steel.t * (
                    steel.D +  steel.B + (steel.d * 2)
                )) * (1 + fixed.laborFactor + fixed.matrlFactor)
            );
            break;

        case 'eqxlips':
            cost =  trunc(
                (costKg * steelWeight * member.length * steel.t * (
                    steel.D +  steel.B
                )) * (1 + fixed.laborFactor + fixed.matrlFactor)
            );
            break;
    }
    return cost;
}

/**
 * summarize evaluations; prepare report
 */
function tallyResult()
{
    _summary = {
        costbased: {grand: 0, tops: {}, bottom: {}, verts: {}, diags: {}},
        practical: {grand: 0, tops: {}, bottom: {}, verts: {}, diags: {}},
    }
    _solution.practical.tops = [];
    _solution.practical.webs = [];

    var first = getFirstCost(_btmSteel, _solution.bottom);
    _summary.costbased.bottom = first;

    if (_topSteel == _btmSteel)
        _solution.practical.tops.push({id: first.steelid, area: first.area});
    else {
        _summary.practical.bottom = first;
        _summary.practical.grand += first.cost;
    }

    for (var mid in _solution.tops) {
        var first = getFirstCost(_topSteel, _solution.tops[mid]);
        _summary.costbased.tops[mid] = first;
        _solution.practical.tops.push({id: first.steelid, area: first.area});
    }
    for (var mid in _solution.verts) {
        var first = getFirstCost(_webSteel, _solution.verts[mid]);
        _summary.costbased.verts[mid] = first;
        _solution.practical.webs.push({id: first.steelid, area: first.area});
    }
    for (var mid in _solution.diags) {
        var first = getFirstCost(_webSteel, _solution.diags[mid]);
        _summary.costbased.diags[mid] = first;
        _solution.practical.webs.push({id: first.steelid, area: first.area});
    }

    _solution.practical.tops.sort(sortArea);
    _solution.practical.webs.sort(sortArea);

    if (_topSteel == _btmSteel)
        _summary.practical.bottom = getFirstArea(_btmSteel, _solution.bottom, _solution.practical.tops[0]);

    for (var mid in _solution.tops)
        _summary.practical.tops[mid] = getFirstArea(_topSteel, _solution.tops[mid], _solution.practical.tops[0]);

    for (var mid in _solution.verts)
        _summary.practical.verts[mid] = getFirstArea(_webSteel, _solution.verts[mid], _solution.practical.webs[0]);

    for (var mid in _solution.diags)
        _summary.practical.diags[mid] = getFirstArea(_webSteel, _solution.diags[mid], _solution.practical.webs[0]);

}

/**
 * fetch the area-biggest steel from cost-based summary
 */
function getFirstArea(steeltype, member, first)
{
    var _detail = Object.assign({}, detail);
    _detail.steeltype = steels[steeltype].name;
    _detail.steelid = '(no match)';
    _detail.force = forces[member.type].name;
    _detail.forceval = member.force;
    _detail.length = member.length;

    var steel = steelspecs[steeltype][first.id];
    if (steel !== undefined) {
        var cost = computeCost(steeltype, steel, member);
        _detail.area = steel.area;
        _detail.steelid = steel.id;
        _detail.cost = cost;
        _summary.practical.grand += cost;
    }

    return Object.assign({}, _detail);
}

/**
 * fetch the cost-cheapeast steel that qualified
 */
function getFirstCost(steeltype, member)
{
    var _detail = Object.assign({}, detail);
    _detail.force = forces[member.type].name;
    _detail.forceval = member.force;
    _detail.length = member.length;
    _detail.steeltype = steels[steeltype].name;
    _detail.area = 0;
    _detail.cost = 0;
    _detail.steelid = '(no match)';
    if (member.passed[0] !== undefined) {
        _detail.area = member.passed[0].area;
        _detail.steelid = member.passed[0].id;
        _detail.cost = member.passed[0].cost;
        _summary.costbased.grand += _detail.cost;
    }
    return Object.assign({}, _detail);
}

/**
 * [ui] arrange and display results
 */
function showResult()
{
    showSummary('#costbased', _summary.costbased);
    showSummary('#practical', _summary.practical);

    $('#bottpassed').text('Passed (' + _solution.bottom.passed.length + ')');
    $('#bottfailed').text('Failed (' + _solution.bottom.failed.length + ')');

    var msel = $('#topsmember');
    msel.empty();
    msel.append('<option value="">(Select)</option>');
    for (var m in _solution.tops) {
        msel.append('<option value="'+ m + '">' + m + '</option>');
    }

    var msel = $('#vertsmember');
    msel.empty();
    msel.append('<option value="">(Select)</option>');
    for (var m in _solution.verts) {
        msel.append('<option value="'+ m + '">' + m + '</option>');
    }

    var msel = $('#diagsmember');
    msel.empty();
    msel.append('<option value="">(Select)</option>');
    for (var m in _solution.diags) {
        msel.append('<option value="'+ m + '">' + m + '</option>');
    }
}

/**
 * [ui] tabulate the summary report
 */
function showSummary(div, data)
{
    var report = $(div + ' #content');
    report.empty();
    report.append(`<div class="entry"><div>&nbsp; Bottom Chord</div>
            <div class="number">` + addCommas(data.bottom.length.toFixed(3)) + `</div>
            <div>` + data.bottom.force + `</div>
            <div class="number">` + addCommas(data.bottom.forceval.toFixed(3)) + `</div>
            <div>` + data.bottom.steeltype + `</div>
            <div>` + data.bottom.steelid + `</div>
            <div class="number">` + addCommas(data.bottom.cost.toFixed(3)) + `</div>
        </div>`);
    report.append('<div class="entry"><div>&nbsp; Top Members</div></div>');
    for (_id in data.tops) {
        report.append(`<div class="entry"><div class="indent">` + _id + `</div>
                <div class="number">` + addCommas(data.tops[_id].length.toFixed(3)) + `</div>
                <div>` + data.tops[_id].force + `</div>
                <div class="number">` + addCommas(data.tops[_id].forceval.toFixed(3)) + `</div>
                <div>` + data.tops[_id].steeltype + `</div>
                <div>` + data.tops[_id].steelid + `</div>
                <div class="number">` + addCommas(data.tops[_id].cost.toFixed(3)) + `</div>
            </div>`);
    }
    report.append('<div class="entry"><div>&nbsp; Vertical Members</div></div>');
    for (_id in data.verts) {
        report.append(`<div class="entry"><div class="indent">` + _id + `</div>
                <div class="number">` + addCommas(data.verts[_id].length.toFixed(3)) + `</div>
                <div>` + data.verts[_id].force + `</div>
                <div class="number">` + addCommas(data.verts[_id].forceval.toFixed(3)) + `</div>
                <div>` + data.verts[_id].steeltype + `</div>
                <div>` + data.verts[_id].steelid + `</div>
                <div class="number">` + addCommas(data.verts[_id].cost.toFixed(3)) + `</div>
            </div>`);
    }
    report.append('<div class="entry"><div>&nbsp; Diagonal Members</div></div>');
    for (_id in data.diags) {
        report.append(`<div class="entry"><div class="indent">` + _id + `</div>
                <div class="number">` + addCommas(data.diags[_id].length.toFixed(3)) + `</div>
                <div>` + data.diags[_id].force + `</div>
                <div class="number">` + addCommas(data.diags[_id].forceval.toFixed(3)) + `</div>
                <div>` + data.diags[_id].steeltype + `</div>
                <div>` + data.diags[_id].steelid + `</div>
                <div class="number">` + addCommas(data.diags[_id].cost.toFixed(3)) + `</div>
            </div>`);
    }
    report.append(`<div class="grand">
            <div>Grand Total :</div>
            <div class="number">` + addCommas(data.grand.toFixed(3)) + `</div>
        </div>`);
}

/**
 * [ui] show a list of steel evaluations per member
 */
function showEvals(mid)
{
    var crits = $('#' + mid + 'results');
    var whichtest = $('#' + mid + 'tests').val();
    crits.empty();
    $('#' + mid + 'values, #' + mid + 'crit').empty();
    var member = _solution[mid];
    var t = 0;
    for (var tid in member[whichtest]) {
        t++;
        crits.append('<div class="choice">' +
            '<input type="radio" name="' + mid + whichtest + '" id="' + mid + whichtest + tid + '" value="' + tid + '" ' +
                'onclick="selEval(' + "'" + mid + "', '" + whichtest + "', '" + tid + "'" + ');">' +
            '<label for="' + mid + whichtest + tid + '" class="testitem">' +
                '<div class="digits">' + t +'</div>' +
                '<div class="digits">' + member[whichtest][tid].id +'</div>' +
                '<div class="digitsr">' + ((whichtest == 'passed') ? addCommas(member[whichtest][tid].cost.toFixed(3)) : '') +'&nbsp;</div>' +
            '</label>' +
        '</div>');
    }

}

/**
 * [ui] select and show a steel evaluation
 */
function selEval(_mid, _rid, _tid)
{
    var whichvalues = $('#' + _mid + 'values');
    var whichcrit = $('#' + _mid + 'crit');
    whichvalues.empty();
    whichcrit.empty();

    var member = _solution[_mid];

    var _values = (member.type == 'cmpr') ?  member[_rid][_tid].values : member.values;
    for (var tv in _values) {
        whichvalues.append('<div class="choice"><div>' + tv + '</div><div class="digits">' + _values[tv] + '</div></div>');
    }

    for (var tc in member[_rid][_tid].checks) {
        var cr = member[_rid][_tid].checks[tc];
        whichcrit.append('<div class="choice"><div>' + cr.desc + '</div>' +
            '<div class="digits ' + (cr.pass ? 'pass':'fail') + '">' + (cr.pass ? 'pass':'fail') + '</div></div>');
    }
}

/**
 * [ui] show a list of steel evaluations per sub-member
 */
function showSubEvals(_mid)
{
    var crits = $('#' + _mid + 'results');
    crits.empty();
    $('#' + _mid + 'values, #' + _mid + 'crit').empty();

    var whichtest = $('#' + _mid + 'tests').val();
    var whichmember = $('#' + _mid + 'member').val();

    if (whichmember) {
        $('#'+ _mid + 'passed').text('Passed (' + _solution[_mid][whichmember].passed.length + ')');
        $('#'+ _mid + 'failed').text('Failed (' + _solution[_mid][whichmember].failed.length + ')');
    }

    if (whichtest && whichmember) {
        var member = _solution[_mid];
        var t = 0;
        for (var tid in member[whichmember][whichtest]) {
            t++;
            crits.append('<div class="choice">' +
                '<input type="radio" name="' + _mid + whichtest + '" id="' + _mid + whichtest + tid + '" value="' + tid + '" ' +
                    'onclick="selSubEval(' + "'" + _mid + "', '" + whichmember + "', '" + whichtest + "', '" + tid + "'" + ');">' +
                '<label for="' + _mid + whichtest + tid + '" class="testitem">' +
                    '<div class="digits">' + t +'</div>' +
                    '<div class="digits">' + member[whichmember][whichtest][tid].id +'</div>' +
                    '<div class="digitsr">' + ((whichtest == 'passed') ? addCommas(member[whichmember][whichtest][tid].cost.toFixed(3)) : '') +'&nbsp;</div>' +
                '</label>' +
            '</div>');
        }
    }
}

/**
 * [ui] select and show a steel evaluation of a sub-member
 */
function selSubEval(_mid, _mnum, _rid, _tid)
{
    var whichvalues = $('#' + _mid + 'values');
    var whichcrit = $('#' + _mid + 'crit');
    whichvalues.empty();
    whichcrit.empty();

    var member = _solution[_mid][_mnum];
    var _values = (member.type == 'cmpr') ?  member[_rid][_tid].values : member.values;
    for (var tv in _values) {
        whichvalues.append('<div class="choice"><div>' + tv + '</div><div class="digits">' + _values[tv] + '</div></div>');
    }

    for (var tc in member[_rid][_tid].checks) {
        var cr = member[_rid][_tid].checks[tc];
        whichcrit.append('<div class="choice"><div>' + cr.desc + '</div>' +
            '<div class="digits ' + (cr.pass ? 'pass':'fail') + '">' + (cr.pass ? 'pass':'fail') + '</div></div>');
    }
}
