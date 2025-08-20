2.0.0 / 20.08.2025
==================

* Previously, it used to download the latest metadata XML file from Google's GitHub repository. It has been [pointed out](https://gitlab.com/catamphetamine/libphonenumber-js/-/work_items/192) that potentially downloading an unreleased version of that file might be unsafe and that it would've been safer to only download a metadata XML file that is part of an actual release. In addition to doing that, it now also reports the version of the release that the metadata was downloaded from. So the breaking changes are:
  - Metadata is downloaded from the latest release branch rather than from the develop branch of the GitHub repository.
	- The exported `download()` function no longer accepts an argument which used to be a URL of the metadata file that should be downloaded.
	- The exported `download()` function now returns not an XML string but an object of shape `{ version: "1.2.3", xml: "<!DOCTYPE><phoneNumberMetadata>...", changes: ["Updated phone metadata for region code(s): BE, CZ, SR", ...] }`.

1.0.1 / 08.11.2020
==================

* Metadata `version` is now an integer instead of a semver version. Semver versions of previously generated metadata are automatically converted into an integer version. The minimum supported version of `libphonenumber-js` is `1.9.2`.

1.0.0 / 08.11.2020
==================

* Initial release.