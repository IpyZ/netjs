import { interfaceList, refreshInterfaces, exec, keypress } from "../tools.js";
import chalk from "chalk";
import inquirer from "inquirer";

export async function removeIpAddressAction () {
    let answers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: [...Object.keys (interfaceList), 'Cancel']
        }
    ]);

    if (answers.interface == 'Cancel') {
        console.clear ();
        return;
    }

    await removeIpAddress (answers.interface);
    console.clear ();
    refreshInterfaces ();
}

async function removeIpAddress (interfaceName) {
    let interfaces = interfaceList;
    let addresses = [];

    if (interfaces[interfaceName].length == 0) {
        console.log ('Interface has no addresses');
        console.log ();
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    for (let interfaceInfo of interfaces[interfaceName]) {
        if (interfaceInfo.family != 'IPv4') continue;
        addresses.push (interfaceInfo.cidr);
    }

    let answers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'address',
            message: 'What ip address you want to remove? (only IPv4)',
            choices: addresses
        }
    ]);

    try {
        await exec (`sudo ip a del ${answers.address} dev ${interfaceName}`);
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Address successfully removed');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
}