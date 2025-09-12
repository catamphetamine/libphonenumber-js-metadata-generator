import parseReleaseNotes from './parseReleaseNotes'
import downloadFile from './downloadFile'

export default function downloadPhoneNumberMetadataXml() {
	return downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub()
}

// This is what `raw.githubusercontent.com` server returns with HTTP status code 200
// when requesting a file that doesn't exist.
const FILE_NOT_FOUND_CONTENT = '404: Not Found'

// Downloads the latest released revision of `PhoneNumberMetadata.xml` file from Google's GitHub releases.
function downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub() {
	return downloadFile('https://raw.githubusercontent.com/googlei18n/libphonenumber/master/release_notes.txt')
		.then((releaseNotes) => {
			if (releaseNotes === FILE_NOT_FOUND_CONTENT) {
				throw new Error('`release_notes.txt` file was not found in Google\'s git repository')
			}
			// Read the latest version's entry in the release notes.
			const { version, changes } = parseReleaseNotes(releaseNotes)
			// Download `PhoneNumberMetadata.xml` file from the GitHub repo "tag" that corresponds to the latest released version.
			//
			// It has been pointed out that a release version "tag" in the git repository usually gets created with a delay
			// that could be up to a couple of hours: https://gitlab.com/catamphetamine/libphonenumber-metadata-generator/-/issues/4
			// A workaround could be
			//
			return downloadFile(`https://raw.githubusercontent.com/google/libphonenumber/refs/tags/v${version}/resources/PhoneNumberMetadata.xml`)
				.then((xml) => {
					if (xml === FILE_NOT_FOUND_CONTENT) {
						throw new Error(`Tag "v${version}" was not found in Google's git repository. Perhaps it hasn't been created yet. Try again later.`)
					}
					return {
						version,
						changes,
						xml
					}
				})
		})
}

// Downloads the latest `PhoneNumberMetadata.xml` file from Google's GitHub repository,
// regardless of whether this XML file has been released yet or not.
function downloadPhoneNumberMetadataXmlFromGitHub() {
	return download('https://raw.githubusercontent.com/googlei18n/libphonenumber/master/resources/PhoneNumberMetadata.xml')
		.then((xml) => {
			return {
				version: 'latest',
				changes: [],
				xml
			}
		})
}