import { determinePossibleGatewayAddress, interfaceList, keypress, exec, refreshInterfaces } from '../tools.js';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function addDefaultGatewayAction () {
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

    await addDefaultGateway (answers.interface);
    console.clear ();
    refreshInterfaces ();
}

async function addDefaultGateway (selectedInterface) {
    let thisInterface = interfaceList[selectedInterface];

    if (thisInterface[0].family != 'IPv4') {
        console.log (chalk.redBright ('Only IPv4 is currently supported'));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    let possibleAddresses = determinePossibleGatewayAddress (thisInterface[0].cidr);
    
    let address = await inquirer.prompt ([
        {
            type: 'list',
            name: 'address',
            message: 'Select the default gateway address',
            choices: [...possibleAddresses, 'Other']
        }
    ]);

    let finalAddress = address.address;

    if (address.address == 'Other') {
        console.log ('Please enter custom address: a.x.y.z: ');
        let address = await inquirer.prompt ([
            {
                type: 'input',
                name: 'a',
                message: 'a: ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'x',
                message: 'x: ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'y',
                message: 'y: ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            },
            {
                type: 'input',
                name: 'z',
                message: 'z: ',
                validate (value) {
                    return !isNaN (value) && value >=0 && value <= 255;
                }
            }
        ]);

        finalAddress = address.a + '.' + address.x + '.' + address.y + '.' + address.z;
    }

    try {
        await exec (`sudo ip route add default via ${finalAddress} dev ${selectedInterface}`);
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Default gateway successfully added');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
}