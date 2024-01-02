import inquirer from "inquirer";
import { networkInterfaces } from 'os';
import chalk from "chalk";
import { promisify } from 'util';
import child_process from 'child_process';
import { readFileSync } from "fs";

const exec = promisify (child_process.exec);
const keypress = async () => {
    process.stdin.setRawMode (true);
    process.stdin.resume ();
    return new Promise (resolve => process.stdin.once ('data', () => {
        process.stdin.setRawMode (false);
        resolve ();
    }));
}

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
                    'Change state of interface',
                    'Quit'
                ]
            }
        ]);

        if (answers.action == 'Quit') {
            console.log ('Goodbye');
            break;
        } else if (answers.action == 'List interfaces') {
            let interfaces = networkInterfaces ();

            for (const interfaceName of Object.keys (interfaces)) {
                console.log (chalk.greenBright (interfaceName) + chalk.white (":"));
                
                for (const address of interfaces[interfaceName]) {
                    console.log (chalk.blueBright ("    type") + chalk.white (": ") + address.family);
                    console.log (chalk.blueBright ("    address") + chalk.white (": ") + address.address);
                    console.log (chalk.blueBright ("    netmask") + chalk.white (": ") + address.netmask);
                    console.log (chalk.blueBright ("    cidr") + chalk.white (": ") + address.cidr);
                    console.log (chalk.blueBright ("    mac") + chalk.white (": ") + address.mac);
                    console.log (chalk.blueBright ("    status") + chalk.white (": ") + readFileSync (`/sys/class/net/${interfaceName}/operstate`).toString ('utf-8'));
                    console.log ();
                }
            }

            if (Object.keys (interfaces).length == 0) {
                console.log ('No interfaces to show');
                console.log ();
            }

            console.log ('Press any key to continue...');
            await keypress ();
        } else if (answers.action == 'Add ip address to interface') {

            let addressTemplate = await inquirer.prompt ([
                {
                    type: 'list',
                    name: 'interface',
                    message: 'Which interface would you like to affect?',
                    choices: Object.keys (networkInterfaces ())
                },
                {
                    type: 'list',
                    name: 'template',
                    message: 'Which address would you like to add? (only IPv4)',
                    choices: [
                        '192.168.0.x/24',
                        '192.168.1.x/24',
                        '192.168.x.y/24',
                        '10.0.0.x/8',
                        '10.x.y.z/8',
                        'Custom'
                    ]
                }
            ]);

            await addAddress (addressTemplate.template, addressTemplate.interface);
        } else if (answers.action == 'Remove ip address from interface') {
            let answers = await inquirer.prompt ([
                {
                    type: 'list',
                    name: 'interface',
                    message: 'Which interface would you like to affect?',
                    choices: Object.keys (networkInterfaces ())
                }
            ]);

            await removeIpAddress (answers.interface);
        }
    }
}) ();

async function addAddress (template, selectedInterface) {

    let address = '';

    if (template == '192.168.x.y/24') {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'x',
                message: 'x (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'y',
                message: 'y (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        address = `192.168.${answers.x}.${answers.y}/24`;
    } else if (template == '10.x.y.z/8') {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'x',
                message: 'x (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'y',
                message: 'y (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'z',
                message: 'z (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        address = `10.${answers.x}.${answers.y}.${answers.z}/8`;
    } else if (template == '10.0.0.x/8') {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'x',
                message: 'x (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        address = `10.0.0.${answers.x}/8`;
    } else if (template == '192.168.0.x/24') {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'x',
                message: 'x (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        address = `192.168.0.${answers.x}/24`;
    } else if (template == '192.168.1.x/24') {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'x',
                message: 'x (only number from 0 to 255 is accepted): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        address = `192.168.1.${answers.x}/24`;
    } else {
        let answers = await inquirer.prompt ([
            {
                type: 'input',
                name: 'ip',
                message: 'ip: ',
                validate (value) {
                    const pass = value.match (
                        /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/i
                    )

                    if (pass) return true;
                }
            },
            {
                type: 'input',
                name: 'mask',
                message: 'cidr netmask (without slash): ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 32;
                }
            }
        ]);

        address = answers.ip + '/' + answers.mask;

    }

    try {
        await exec (`sudo ip a add ${address} dev ${selectedInterface}`);
    } catch (e) {
        console.log ("Command failed to execute: " + e);
        console.log ();
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
    let interfaces = networkInterfaces ();
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
        console.log ("Command failed to execute: " + e);
        console.log ();
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Address successfully removed');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
}