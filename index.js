import inquirer from "inquirer";
import { networkInterfaces } from 'os';
import chalk from "chalk";
import { promisify } from 'util';
import child_process from 'child_process';
import { readFileSync, readdirSync } from "fs";
import { addressDefaultTemplates } from "./addressDefaultTemplates.js";
import { sync as commandExists } from "command-exists";


const exec = promisify (child_process.exec);
const keypress = async () => {
    process.stdin.setRawMode (true);
    process.stdin.resume ();
    return new Promise (resolve => process.stdin.once ('data', () => {
        process.stdin.setRawMode (false);
        resolve ();
    }));
}

var interfaceList = {};

function refreshInterfaces () {
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

console.clear ();

refreshInterfaces ();

// ================= Main loop ================= //

(async function () {
    while (true) {
        let answers = await inquirer.prompt ([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'List interfaces',
                    'Add ip address to interface',
                    'Remove ip address from interface',
                    'Flush ip addresses from interface',
                    'Inherit ip addresses from dhcp',
                    'Change state of interface',
                    'Quit'
                ]
            }
        ]);

        if (answers.action == 'Quit') {
            console.clear ();
            break;
        }

        switch (answers.action) {
            case 'List interfaces':
                await listInterfacesAction ();
                break;
            case 'Add ip address to interface':
                await addAddressAction ();
                break;
            case 'Remove ip address from interface':
                await removeIpAddressAction ();
                break;
            case 'Flush ip addresses from interface':
                await flushAddressesAction ();
                break;
            case 'Inherit ip addresses from dhcp':
                await dhcpInherit ();
                break;
            case 'Change state of interface':
                await changeStateAction ();
                break;
        }
    }
}) ();

// ================= Actions ================= //

async function listInterfacesAction () {
    let interfaces = interfaceList;

    for (const interfaceName of Object.keys (interfaces)) {
        console.log (chalk.greenBright (interfaceName) + chalk.white (":"));
        
        for (const address of interfaces[interfaceName]) {
            if (address.status) {
                console.log (chalk.blueBright ("    status") + chalk.white (": ") + address.status);
            } else {
                console.log (chalk.blueBright ("    type") + chalk.white (": ") + address.family);
                console.log (chalk.blueBright ("    address") + chalk.white (": ") + address.address);
                console.log (chalk.blueBright ("    netmask") + chalk.white (": ") + address.netmask);
                console.log (chalk.blueBright ("    cidr") + chalk.white (": ") + address.cidr);
                console.log (chalk.blueBright ("    mac") + chalk.white (": ") + address.mac);
                console.log (chalk.blueBright ("    status") + chalk.white (": ") + readFileSync (`/sys/class/net/${interfaceName}/operstate`).toString ('utf-8'));
            }
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

async function addAddressAction () {
    let addressTemplate = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: Object.keys (interfaceList)
        },
        {
            type: 'list',
            name: 'template',
            message: 'Which address would you like to add? (only IPv4)',
            choices: [
                ...addressDefaultTemplates.map (val => {
                    return val.address;
                }),
                'Custom'
            ]
        }
    ]);

    await addAddress (addressTemplate.template, addressTemplate.interface);
    console.clear ();
    refreshInterfaces ();
}

async function removeIpAddressAction () {
    let answers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: Object.keys (interfaceList)
        }
    ]);

    await removeIpAddress (answers.interface);
    console.clear ();
    refreshInterfaces ();
}

async function flushAddressesAction () {
    let answers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: Object.keys (interfaceList)
        }
    ]);

    try {
        await exec (`sudo ip a flush dev ${answers.interface}`)
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Addresses successfully flushed');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
    console.clear ();
    refreshInterfaces ();
}

async function changeStateAction () {
    let answers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: Object.keys (interfaceList)
        },
        {
            type: 'list',
            name: 'status',
            message: 'On which state sould you like to set this interface?',
            choices: [
                'up',
                'down'
            ]
        }
    ]);

    try {
        await exec (`sudo ip link set dev ${answers.interface} ${answers.status}`)
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Status successfully updated');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
    console.clear ();
    refreshInterfaces ();
}

async function dhcpInherit () {
    let interfaceAnswers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: Object.keys (interfaceList)
        }
    ]);

    let dhcpcdExists = commandExists ('dhcpcd');
    let dhclientExists = commandExists ('dhclient');

    let command = '';

    if (dhcpcdExists && dhclientExists) {
        let answers = await inquirer.prompt ([
            {
                type: 'list',
                name: 'command',
                message: 'Which command would you like to use?',
                choices: ['dhcpcd', 'dhclient']
            }
        ]);

        command = `sudo ${answers.command} ${interfaceAnswers.interface}`
    } else if (dhcpcdExists) command = `sudo dhcpcd ${interfaceAnswers.interface}`;
    else if (dhclientExists) command = `sudo dhclient ${interfaceAnswers.interface}`;
    else {
        console.log (chalk.redBright ('Error: You have to have installed dhcpcd or dhclient to perform this action'));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        console.clear ();
        return;
    }

    try {
        await exec (command)
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Successfully inherited addresses from dhcp');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
    console.clear ();
    refreshInterfaces ();
}

// ================= More complex ================= //

async function addAddress (template, selectedInterface) {

    let address = '';

    let indexOfTemplate = addressDefaultTemplates.filter (val => {
        if (template == val.address) return val;
    });

    let prompts = [];

    for (const variable of indexOfTemplate[0].variables) {
        prompts.push (
            {
                type: 'input',
                name: variable,
                message: variable + ' (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        );
    }

    let answers = await inquirer.prompt (prompts);

    address = indexOfTemplate[0].address;

    for (const variable of indexOfTemplate[0].variables) {
        address = address.replace (variable, answers[variable])
    }


    try {
        await exec (`sudo ip a add ${address} dev ${selectedInterface}`);
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Address successfully added');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
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