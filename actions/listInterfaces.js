import { interfaceList, keypress } from "../tools.js";
import chalk from "chalk";
import { readFileSync } from "fs";

export async function listInterfacesAction () {
    let interfaces = interfaceList;

    for (const interfaceName of Object.keys (interfaces)) {
        console.log (chalk.greenBright (interfaceName) + chalk.white (":"));

        console.log (chalk.blueBright ("    status") + chalk.white (": ") + readFileSync (`/sys/class/net/${interfaceName}/operstate`).toString ('utf-8'));
        
        for (const address of interfaces[interfaceName]) {
            if (address.status) {
                continue;
            }

            console.log (chalk.blueBright ("    type") + chalk.white (": ") + address.family);
            console.log (chalk.blueBright ("    address") + chalk.white (": ") + address.address);
            console.log (chalk.blueBright ("    netmask") + chalk.white (": ") + address.netmask);
            console.log (chalk.blueBright ("    cidr") + chalk.white (": ") + address.cidr);
            console.log (chalk.blueBright ("    mac") + chalk.white (": ") + address.mac);

            console.log ();
        }
    }

    if (Object.keys (interfaces).length == 0) {
        console.log ('No interfaces to show');
        console.log ();
    }

    console.log ('Press any key to continue...');
    await keypress ();
    console.clear ();
}