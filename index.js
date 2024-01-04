#!/usr/bin/env node

import inquirer from "inquirer";
import meow from 'meow';
import { refreshInterfaces } from "./tools.js";
import { listInterfacesAction } from "./actions/listInterfaces.js";
import { addAddressAction } from "./actions/addAddress.js";
import { removeIpAddressAction } from "./actions/removeAddress.js";
import { flushAddressesAction } from "./actions/flushAddresses.js";
import { dhcpInherit } from "./actions/dhcpInherit.js";
import { changeStateAction } from "./actions/changeState.js";

const cli = meow(`
    Usage
      $ netjs
      
      Use arrows to select your option
      Press enter to accept selected option

    NetJS is a simple CLI software that helps with setting up network interfaces
`, {importMeta: import.meta});

console.clear ();

refreshInterfaces ();

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