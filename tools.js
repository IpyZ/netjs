import { networkInterfaces } from 'os';
import { promisify } from 'util';
import child_process from 'child_process';
import { readdirSync, readFileSync } from 'fs';

export const exec = promisify (child_process.exec);
export const keypress = async () => {
    process.stdin.setRawMode (true);
    process.stdin.resume ();
    return new Promise (resolve => process.stdin.once ('data', () => {
        process.stdin.setRawMode (false);
        resolve ();
    }));
}

/**
 * Represents a collection of network interfaces and their associated details.
 * Each key in the object represents a network interface name, and the value is an array containing the interface details.
 * @type {Object.<string, Array<{family: string, address: string, netmask: string, cidr: string, mac: string, internal: boolean, status: string}>}
 */
export var interfaceList = {};

export function refreshInterfaces () {
    interfaceList = {};
    let upInterfaces = networkInterfaces ();
    for (let i of Object.keys (upInterfaces)) {
        interfaceList[i] = upInterfaces[i];
    }

    readdirSync ('/sys/class/net/').forEach (file => {
        if (Object.keys (upInterfaces).indexOf (file) == -1) {
            interfaceList[file] = [{status: readFileSync (`/sys/class/net/${file}/operstate`).toString ('utf-8')}];
        }
    });
}

/**
 * Returns a list of possible IP addresses for a given IP address and subnet mask.
 * @param {string} address - The IP address.
 * @returns {string[]} - A list of possible IP addresses.
 */
export function determinePossibleGatewayAddress (address) {
    const addresses = [];

    const maskCidr = Number (address.split('/')[1]);
    const zeros = 32 - maskCidr;
    const ones = 32 - zeros;

    const maskParts = [];

    for (let i = 0; i < 4; i++) {
        let maskPart = '';
        for (let j = (i * 8) + 1; j < (i * 8) + 9; j++) {
            if (j <= ones) {
                maskPart += '1';
                continue;
            }

            maskPart += '0';
        }

        maskParts.push (maskPart);
    }

    const addressParts = address.split('/')[0].split('.');

    let newAddress = '';

    for (let i = 0; i < addressParts.length; i++) {
        if (i > 0) {
            newAddress += '.';
        }

        let newAddressPart = Number (addressParts[i]) & parseInt (maskParts[i], 2);

        if (i == addressParts.length - 1 && newAddressPart < 255) newAddressPart += 1;

        newAddress += newAddressPart;
    }

    addresses.push (newAddress);

    newAddress = '';

    for (let i = 0; i < addressParts.length; i++) {
        if (i > 0) {
            newAddress += '.';
        }

        let newAddressPart = Number (addressParts[i]) | parseInt (stringBitNot(maskParts[i]), 2);

        if (i == addressParts.length - 1 && parseInt (stringBitNot(maskParts[i]), 2) > 0) newAddressPart -= 1;

        newAddress += newAddressPart;
    }

    addresses.push (newAddress);

    return addresses;
}

function stringBitNot (bits) {
    return bits.split ('').map (val => {
        return val == '1'? '0' : '1';
    }).join ('');
}