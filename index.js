import inquirer from "inquirer";
import { networkInterfaces } from 'os';
import chalk from "chalk";

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

                let lenght = 0;
                
                for (const address of interfaces[interfaceName]) {
                    console.log (chalk.blueBright ("    type") + chalk.white (": ") + address.family);
                    console.log (chalk.blueBright ("    address") + chalk.white (": ") + address.address);
                    console.log (chalk.blueBright ("    netmask") + chalk.white (": ") + address.netmask);
                    console.log (chalk.blueBright ("    cidr") + chalk.white (": ") + address.cidr);
                    console.log (chalk.blueBright ("    mac") + chalk.white (": ") + address.mac);
                    console.log ();

                    lenght++;
                }

                if (lenght == 0) console.log ();
            }
        }
    }
}) (); 