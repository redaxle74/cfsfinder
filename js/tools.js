function jumpTo(el)
{
    var grp = $(el).val();
    $('#' + grp).focus();
}

function urlArgs () {
    var url = document.location.href;
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}

function memberGrp(_id, _badge) {
    return `
        <div id="grp` + _id + `" class="inputgrp">
            <div class="inputset">
                <label for="_` + _id + `Type" class="field"><span class="badge ` + _badge + `">` + _id + `</span>` + _id + ` Force Type</label>
                <select id="_` + _id + `Type" class="_forcetype" name="` + _id + `Type">
                    <option value="">(Select)</option>
                    <option value="cmpr">Compression</option>
                    <option value="tens">Tension</option>
                </select>
            </div>
            <div class="inputset">
                <label for="_` + _id + `Force" class="field"><span class="badge ` + _badge + `">` + _id + `</span>` + _id + ` Force Value <span class="mini">(KiloNewtons)</span></label>
                <input id="_` + _id + `Force" class="_forcevalue" name="_` + _id + `Force" type="text" value="0.000">
            </div>
        </div>
    `;
}
function randomItem(items) {
    var list = Object.values(items);
    return list[Math.floor(Math.random() * list.length)];
}

function randomNum(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function svgNode(type) {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
}

function zeroLPad(num, len) {
    return (num + '').padStart(len, '0');
}

function oddEven(num) {
    return (num % 2 === 0) ? 'even' : 'odd';
}

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function trunc(value, places = 3)
{
    return parseFloat(value.toFixed(places));
}

function sortCost( a, b )
{
    if (a.cost < b.cost) return -1;
    if (a.cost > b.cost) return 1;
    return 0;
}

function sortArea( a, b )
{
    if (a.area < b.area) return 1;
    if (a.area > b.area) return -1;
    return sortCost( a, b );
}

