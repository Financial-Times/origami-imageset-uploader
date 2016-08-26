Origami Imageset Uploader
=========================

Service that uploads imagesets to an S3 bucket so they can be provided by the [origami image service](https://github.com/Financial-Times/origami-image-service)

[![Build status](https://img.shields.io/circleci/project/Financial-Times/origami-imageset-uploader.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Running Locally](#running-locally)
  * [Configuration](#configuration)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [License](#license)


Requirements
------------

Running Origami Imageset Uploader requires [Node.js] 4.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
make install
```

Copy `sample.env` to `.env` and fill out some of the [configurations](#configuration):

```sh
cp sample.env .env
```

Run the application in development mode with

```sh
make run
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure Origami Navigation Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `LOG_LEVEL`: A Syslog-compatible level at which to emit log events to stdout. One of `trace`, `debug`, `info`, `warn`, `error`, or `crit`.
  * `DOWNLOAD_DIRECTORY`: (required) Name of the directory where to download the imagesets to before uploading them.
  * `GITHUB_SECRET`: (required) Hash used by Github to sign the payload from its webhook request so we can confirm it comes from a webhook configure by us. The hash is in the Origami LastPass directory.
  * `AWS_ACCESS_KEY_ID`: (required) The access key corresponding to the IAM user set up for this service. It's in the Origami LastPass directory.
  * `AWS_SECRET_ACCESS_KEY`: (required) The access key corresponding to the IAM user set up for this service. It's in the Origami LastPass directory.
  * `AWS_BUCKET_NAME`: (required) The bucket name set up in S3 for this service.


Testing
-------

To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

The [production][heroku-production] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You'll need to provide your GitHub username for change request logging, ensure you've been [added to this spreadsheet][developer-spreadsheet]. Now deploy the last QA image by running the following:

```sh
GITHUB_USERNAME=yourgithubusername make promote
```

We use [Semantic Versioning][semver] to tag releases. Only tagged releases should hit production, this ensures that the `__about` endpoint is informative. To tag a new release, use one of the following (this is the only time we allow a commit directly to `master`):

```sh
npm version major
npm version minor
npm version patch
```

Now you can push to GitHub (`git push && git push --tags`) which will trigger a QA deployment. Once QA has deployed with the newly tagged version, you can promote it to production.


License
-------

The Financial Times has published this software under the [MIT license][license].



[imageset-uploader]: https://origami-imageset-uploader.herokuapp.com/
[ci]: https://circleci.com/gh/Financial-Times/origami-imageset-uploader
[developer-spreadsheet]: https://docs.google.com/spreadsheets/d/1mbJQYJOgXAH2KfgKUM1Vgxq8FUIrahumb39wzsgStu0/edit#gid=0
[heroku-production]: https://dashboard.heroku.com/apps/origami-imageset-uploader
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[semver]: http://semver.org/
