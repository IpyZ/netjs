import { interfaceList, refreshInterfaces, exec, keypress } from "../tools.js";
import chalk from "chalk";
import inquirer from "inquirer";

export async function changeStateAction () {
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
                'down',
                'Cancel'
            ]
        }
    ]);

    if (answers.status == 'Cancel') {
        console.clear ();
        return;
    }

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