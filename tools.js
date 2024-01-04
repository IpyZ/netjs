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