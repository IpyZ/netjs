import { exec, keypress, refreshInterfaces, interfaceList } from "../tools.js";
import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Represents a route entry in the network routing table.
 * @typedef {Object} RouteEntry
 * @property {string} dst - The destination network or host.
 * @property {string} gateway - The gateway IP address or '*' if none.
 * @property {string} dev - The name of the network interface.
 * @property {string} scope - The scope of the route.
 * @property {string} proto - The routing protocol.
 * @property {string} metric - The route metric.
 * @property {string} via - The route via address.
 * @property {string} src - The source IP address.
 * @property {string} cache - The route cache status.
 * @property {string} rtt - The round-trip time for the route.
 * @property {string} rttvar - The round-trip time variance for the route.
 * @property {string} ssthresh - The slow start threshold for the route.
 * @property {string} cwnd - The congestion window for the route.
 * @property {string} advmss - The advertised maximum segment size for the route.
 * @property {string} reordering - The reordering for the route.
 * @property {string} window - The window size for the route.
 * @property {string} mss - The maximum segment size for the route.
 * @property {string} irtt - The initial round-trip time for the route.
 * @property {string} qdisc - The queuing discipline for the route.
 * @property {string} qlen - The queue length for the route.
 * @property {string} backlog - The backlog for the route.
 */

export async function removeDefaultGatewayAction () {
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

    await removeDefaultGateway (interfaceAnswers.interface);
    console.clear ();
    refreshInterfaces ();
}

async function removeDefaultGateway (selectedInterface) {
    /**
     * @type {Array<RouteEntry>}
     */
    let routes;

    try {
        let { stdout } = await exec (`ip --json route show dev ${selectedInterface}`);
        routes = JSON.parse (stdout);

        routes = routes.filter (route => {
            return route.dst == 'default';
        })
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    let gateways = routes.map (route => {
        return route.gateway;
    })

    let gateway = await inquirer.prompt ([
        {
            type: 'list',
            name: 'gateway',
            message: 'Which gateway would you like to remove?',
            choices: gateways
        }
    ]);

    try {
        await exec (`sudo ip route del default via ${gateway.gateway} dev ${selectedInterface}`);
    } catch (e) {
        console.error (chalk.redBright ("Command failed to execute: " + e));
        console.log (chalk.white ());
        console.log ('Press any key to continue...');
        await keypress ();
        return;
    }

    console.log ('Gateway successfully removed');
    console.log ();
    console.log ('Press any key to continue...');
    await keypress ();
}