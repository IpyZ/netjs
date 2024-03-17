<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->


<div align="center">

  <h3 align="center">NetJS</h3>

  <p align="center">
    Network management tool written in JS
    <br />
    <a href="https://github.com/IpyZ/netjs/issues">Report Bug</a>
    ·
    <a href="https://github.com/IpyZ/netjs/issues">Request Feature</a>
  </p>
</div>



<!-- ABOUT THE PROJECT -->
## About The Project

![NetJS Screenshot][product-screenshot]

How to set up your network interfaces in linux? With commands like ip or ifconfig. Unfortuantely many begginers to linux do not feel comfortable with raw text output and raw commands. NetJS makes setting up network interfaces easier and faster.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get started you simply need to install NetJS gloablly via npm. <br /><br />
**WARNING!**
<br />
NetJS supports only Linux operating systems.

### Prerequisites

First, you have to install some dependecies:
* iproute2
* dhclient or dhcpcd
* sudo

However all of these packages should be preinstalled on any Linux distro.
<br /><br />
And ofcourse you need Node.JS also: [https://nodejs.org](https://nodejs.org)

### Installation

Simply type:
```
sudo npm i -g netjs-cli
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Simply type in your terminal:
```
netjs
```
and move with your arrows. Select option, select additional parameters and the magic is done.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Listing interfaces
- [x] Adding/removing ip addresses
- [x] Flushing ip addresses
- [x] Inheriting addresses from DHCP
- [x] Changing state of interface
- [ ] Editing default gateway
- [ ] Editing DNS addresses
- [ ] Saving configuration without any network manager installed (make own manager)
- [ ] Exporting configuration to netplan and /etc/network.d
- [ ] Editing routes
- And more in the future

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Apache2.0 License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Filip Śliwa - @ipyz on Discord

Project Link: [https://github.com/IpyZ/netjs](https://github.com/IpyZ/netjs)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
* [chalk](https://www.npmjs.com/package/chalk)
* [meow](https://www.npmjs.com/package/meow)
* [command-exists](https://www.npmjs.com/package/command-exists)
* [README template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[product-screenshot]: images/screenshot.png
