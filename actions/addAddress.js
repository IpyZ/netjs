import { interfaceList, refreshInterfaces, keypress, exec } from "../tools.js";
import chalk from "chalk";
import { addressDefaultTemplates } from "./addressDefaultTemplates.js";
import inquirer from "inquirer";

export async function addAddressAction () {
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
                'Cancel'
            ]
        }
    ]);

    if (addressTemplate.template == 'Cancel') {
        console.clear ();
        return;
    }

    await addAddress (addressTemplate.template, addressTemplate.interface);
    console.clear ();
    refreshInterfaces ();
}

async function addAddress (template, selectedInterface) {

    let address = '';

    let indexOfTemplate = addressDefaultTemplates.filter (val => {
        if (template == val.address) return val;
    });

    let prompts = [];

    for (const variable of indexOfTemplate[0].variables) {
        if (variable === 'm') {
            prompts.push (
                {
                    type: 'input',
                    name: variable,
                    message: variable + ' (only number from 0 to 32 is accepted): ',
                    validate (value) {
                        return !isNaN (value) && value >= 0 && value <= 32;
                    }
                }
            );

            continue;
        }

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