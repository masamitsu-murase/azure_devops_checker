[![WebExtensions](https://github.com/masamitsu-murase/azure_devops_checker/actions/workflows/webextensions.yml/badge.svg)](https://github.com/masamitsu-murase/azure_devops_checker/actions/workflows/webextensions.yml)

# Azure DevOps Checker

## Overview

This is an extension to check Pull Request status in your Azure DevOps project.

## How to use

1. Sign in to your account in Azure DevOps page.  
2. Input your organization, project, and user id in option page.
   Your user id is found in `https://dev.azure.com/{organization}/_apis/projects/{project-uuid}/teams/{team-id}/members`
3. Open popup to see the current status.

## Releases

* For Firefox  
  Download and install `azure_devops_pr_checker-X.Y.Z-fx.xpi` from [Releases page](https://github.com/masamitsu-murase/azure_devops_checker/releases).
* For Google Chrome  
  Install this extension in [Chrome WebStore page](https://chrome.google.com/webstore/detail/azure-devops-pr-checker/mbogghodjfbndghplebepmfgjapejiio).

## 3rd party libraries

* [Vue.js](https://vuejs.org/index.html)  
  This is distributed under the MIT License.
* [Vuetify](https://vuetifyjs.com/)  
  This is distributed under the MIT License.
* [Font Awesome Free](https://fontawesome.com/)  
  This is distributed under the following license.  
  For more detail, please refer to [the license page](https://fontawesome.com/license/free).
  * Icons — CC BY 4.0 License
  * Fonts — SIL OFL 1.1 License
  * Code — MIT License
* [WebExtension-Polyfill](https://github.com/mozilla/webextension-polyfill)  
  This is distributed under the MPL-2.0 License

## License

Copyright 2021 Masamitsu MURASE

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
