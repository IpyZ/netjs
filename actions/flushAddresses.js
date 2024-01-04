import { interfaceList, refreshInterfaces, exec, keypress } from "../tools.js";
import chalk from "chalk";
import inquirer from "inquirer";

export async function flushAddressesAction () {
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