import { interfaceList, refreshInterfaces, exec, keypress } from "../tools.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { sync as commandExists } from "command-exists";

export async function dhcpInherit () {
    let interfaceAnswers = await inquirer.prompt ([
        {
            type: 'list',
            name: 'interface',
            message: 'Which interface would you like to affect?',
            choices: [...Object.keys (interfaceList), 'Cancel']
        }
    ]);

    if (interfaceAnswers.interface == 'Cancel') {
        console.clear ();
        return;
    }

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