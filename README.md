<!-- prettier-ignore-start -->
<p align="center">
    <a href="https://ncheck.eu">
        <img alt="NetCheck" src="https://github.com/memphisx/netcheck-frontend/raw/master/src/assets/netcheck-logo.png" />
    </a>
</p>
<p align="center">
    <a aria-label="License" href="https://github.com/memphisx/netcheck-frontend/blob/master/LICENSE">
        <img alt="" src="https://img.shields.io/github/license/memphisx/netcheck-frontend?style=for-the-badge&labelColor=000000&color=blue">
    </a>
    <a aria-label="Docker image version" href="https://hub.docker.com/repository/docker/memphisx/netcheck-frontend">
        <img alt="" src="https://img.shields.io/docker/v/memphisx/netcheck-frontend/latest?style=for-the-badge&label=Version">
    </a>
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/memphisx/netcheck-frontend?style=for-the-badge">
    <a href="https://github.com/memphisx/netcheck-frontend/issues">
        <img alt="GitHub issues" src="https://img.shields.io/github/issues/memphisx/netcheck-frontend?style=for-the-badge">
    </a>
    <img alt="GitHub issues by-label" src="https://img.shields.io/github/issues/memphisx/netcheck-frontend/bug?style=for-the-badge">
    <a href="https://github.com/memphisx/netcheck-frontend/actions">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/memphisx/netcheck-frontend/Test%20and%20release?style=for-the-badge">
    </a>
    <a href="https://github.com/memphisx/netcheck-frontend/stargazers">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/memphisx/netcheck-frontend?style=for-the-badge">
    </a>
    <a href="https://github.com/memphisx/netcheck-frontend/network">
        <img alt="GitHub forks" src="https://img.shields.io/github/forks/memphisx/netcheck-frontend?style=for-the-badge">
    </a>
    <img alt="GitHub watchers" src="https://img.shields.io/github/watchers/memphisx/netcheck-frontend?style=for-the-badge">
    <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/memphisx/netcheck-frontend?style=for-the-badge">
</p>
<!-- prettier-ignore-end -->


<br>

<h1 align="center">Performance & availability monitoring app</h1>
<h3 align="center">Built on Spring Boot & Quasar Frameworks</h3>
<h3 align="center"><a href="https://demo.ncheck.eu" target="_blank">Check out the demo</a></h3>

<br>

Netcheck lets you monitor the availability and performance of your websites or web services by running on your own
servers/machines or hosting providers of your preference.
It is inspired by services like [Pingdom](https://www.pingdom.com) and [Statuscake](https://www.statuscake.com)

<p align="center">
    Main page
    <img alt="Main page" src="https://github.com/memphisx/netcheck-frontend/raw/develop/preview-images/main-view.png">
    <br/><br/>
    Live check (Dark mode on)
    <img alt="Live check" src="https://github.com/memphisx/netcheck-frontend/raw/develop/preview-images/live-check-view.png">
    <br/><br/>
    List of monitored websites (Dark mode on)
    <img alt="Performance of monitored domains" src="https://github.com/memphisx/netcheck-frontend/raw/develop/preview-images/monitored-list-view.png">
    <br/><br/>
    Performance of a monitored website (Dark mode on)
    <img alt="Performance of monitored domains" src="https://github.com/memphisx/netcheck-frontend/raw/develop/preview-images/monitored-view.png">
    <br/><br/>
    States of a monitored domain (Dark mode on)
    <img alt="States of monitored domain" src="https://github.com/memphisx/netcheck-frontend/raw/develop/preview-images/state-view.png">
</p>

This git repository is for the frontend/ui side of the app. The backend api is required to run before running the frontend.
Please follow the instructions on the [Netcheck API Repository](https://github.com/memphisx/netcheck-api) beforehand.

**WARNING**: The app is still under heavy development and quite rough around the edges.
Feel free to report any bugs you may encounter, provide feature requests or in general any feedback through the
[github issues page](https://github.com/memphisx/netcheck-api/issues).

<br>

### Quick Start

* Make sure you have followed the instructions [here](https://github.com/memphisx/netcheck-api) for running the backend.
You also need to have nodejs installed (instructions [here](https://nodejs.org/en/download/package-manager/)).
* Install quasar cli
```bash
yarn global add @quasar/cli
```
* Install all the required dependencies
```bash
yarn install
```
* Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```
This will automatically open the ui in your default browser which is exposed at [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
<br><br>

**Features:**<br>
⚡️ Built on Spring Boot ([backend](https://github.com/memphisx/netcheck-api)) and Quasar (frontend - this repo)<br>
⚡️ Support live checking of domains through HTTP and HTTPS<br>
⚡️ Support scheduled checks with predefined check frequency of 5,10 or 15 minutes<br>
⚡️ HTTPS Certificate validation checks<br>
⚡️ Metric Generation for uptime and response times<br>
⚡️ State change notification system (currently supports <a href="https://pushover.net/">Pushover</a>)<br>

**Other key features coming:**<br>
⚡️ Authentication <br>
⚡️ Multi user support<br>
⚡️ Additional notification providers (Pushbullet, Telegram, Discord, Slack, Kafka, etc)<br>
⚡️ Custom endpoint checks<br>
⚡️ Custom request headers on checks<br>
⚡ Additional check implementations<br>
⚡️ Multi location support for the scheduled checks<br>

<br>

### What is Netcheck Designed For?

Netcheck is designed for realtime monitoring and performance metric collection of websites through scheduled checks.
It is similar to 3rd party services like [Pingdom](https://pingdom.com), [DownDetector](https://downdetector.co.uk)
and [StatusCake](https://statuscake.com).

Netcheck may not include the vast feature set the aforementioned services provide, but it gives you full control
over your data and doesn't lock you in to a single provider. And since it is self hosted it can also run exclusively
on your intranet/cluster and check non publicly available services.

<br>
