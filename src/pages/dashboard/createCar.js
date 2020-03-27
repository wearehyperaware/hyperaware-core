import getPath from './getPath'
import {map} from './dashboard'
import {zone} from './dashboard'
import Antenna from 'iotex-antenna'
import {Contract} from "iotex-antenna/lib/contract/contract";
import {ABI as VehicleRegABI} from '../vehicle-registration/ABI'
import DIDRegDetails from "../did-registration/did-contract-details";
import {toRau} from "iotex-antenna/lib/account/utils";
import axios from 'axios'
import {readLog, htmlIDFromDID} from "../helperFunctions";
import eventABI from "../vehicle-registration/vehicleEventABIs";

var d3 = require('d3');
var turf = require('turf');

//var zone = require('./dashboard')

var cars = {},
    j = 0,
    total = 0,
    current = 0;

export default function (position, vehicleInfo) {


    let color = vehicleInfo.vehicleType.includes("Ship") ? 'green' : "purple"; // color based on vehicleDID creator ID?
    return createCar(position, htmlIDFromDID(vehicleInfo.id), getRandomColor(), vehicleInfo.isPrivateVehicle);


    //
    //
    // for (var i = 0; i < num; i++) {
    //   getPath().then(function(path_info) {
    //     cars[++j] = { inside: false, ever: false, color: getRandomColor() };
    //     var route = turf.linestring(path_info.routes[0].geometry.coordinates);
    //     createCar(path_info.origin, cars[j].color)
    //       .transition()
    //       .duration(15000)
    //       .attrTween('transform', translateAlong(route, j, did))
    //       .remove();
    //   });
    // };
}

function createCar(coords, id, color, isPrivate) {
    console.log(coords);
    let new_car
    if (isPrivate === true) {
        new_car = d3.select('svg')
            .append('circle')
            .attr('id', id)
            .attr('isPrivateVehicle', isPrivate)
            .attr('data-coords', coords.toString())
            .attr('fill', 'transparent')
            .attr('stroke', 'transparent')
            .attr('r', '50px')
            .attr('transform', function () {
                var pixelCoords = map.project(coords);
                return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
            })
            .on('click', function () {
                console.log(id);
            });
    } else {
        new_car = d3.select('svg')
            .append('circle')
            .attr('id', id)
            .attr('isPrivateVehicle', isPrivate)
            .attr('data-coords', coords.toString())
            .attr('fill', color)
            .attr('r', 50)
            .attr('transform', function () {
                var pixelCoords = map.project(coords);
                return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
            })
            .on('click', function () {
                console.log(id);
            });
    }
    return new_car;
}

function translateAlong(path, j, did) {
    var l = turf.lineDistance(path, 'kilometers');
    return function (d, i, a) {
        var car = d3.select(this);
        return function (t) {
            // t is time as as % of total transition duration
            var current_car = cars[j];
            var p = turf.along(path, t * l, 'kilometers');
            // SEND MESSAGE TO ENCLAVE HERE AND CHECK turf.Inside() INSIDE ENCLAVE
            if (!current_car.inside && turf.inside(p, zone)) {
                current_car.inside = true;
                car.classed('inzone', true);
                increment('current');
                if (!current_car.ever) {
                    addNotification(current_car.color, j, 'enter', did);
                    current_car.ever = true;
                    car.classed('enter', true);
                    increment('total');
                }
            } else if (current_car.inside && !turf.inside(p, zone)) {
                addNotification(current_car.color, j, 'exit', did);

                car.classed('inzone', false);
                car.classed('enter', false);
                current_car.inside = false;
                decrement('current');
            }
            if (t === 1) {
                current_car = null;
                if (turf.inside(p, zone)) {
                    decrement('current');
                }
            }
            p = turf.along(path, t * l, 'kilometers');
            var pixelCoords = map.project(p.geometry.coordinates);
            return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
        };
    };
}

function addNotification(color, index, type, did) {

    var ticker = d3.selectAll('#ticker');
    var notification_types = {
        enter: {alert: '! Alert', message: 'entering'},
        exit: {alert: '✓ Leaving', message: 'exiting'}
    };

    var html = '<strong class="strongpad" style="background:' + color + '"">' + notification_types[type].alert + '</strong> ' + truncateDID(did) + ' is <strong>' + notification_types[type].message + '</strong> congestion zone.'
    html = type === 'enter' ? html + 'You will incur a £5 fee.' : html;
    ticker.insert('div', ':first-child').html(html).classed('expanded', true);
}

function getRandomColor() {
    var colors = d3.scale.category10().range();
    var max = colors.length;
    return colors[Math.floor(Math.random() * max)];
}

var metrics = {'total': total, 'current': current};

function increment(metric) {
    d3.selectAll('.' + metric + '-vehicles').text(++metrics[metric]);
    if (metric === 'total') {
        d3.selectAll('.total-revenue').text(metrics[metric] * 5);
    }
}

function decrement(metric) {
    d3.selectAll('.' + metric + '-vehicles').text(--metrics[metric]);
}

function truncateDID(did) {
    return did.substr(0, 15) + "..." + did.substr(42, 8)
}

