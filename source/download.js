import parseReleaseNotes from './parseReleaseNotes'
import downloadFile from './downloadFile'

export default function downloadPhoneNumberMetadataXml() {
	return downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub()
}

// Downloads the latest released revision of `PhoneNumberMetadata.xml` file from Google's GitHub releases.
function downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub() {
	return downloadFile('https://raw.githubusercontent.com/googlei18n/libphonenumber/master/release_notes.txt')
		.then((releaseNotes) => {
			// Read the latest version's entry of the release notes.
			const { version, changes } = parseReleaseNotes(releaseNotes)
			// Download `PhoneNumberMetadata.xml` file from the GitHub repo "tag" that corresponds to the latest released version.
			return downloadFile(`https://raw.githubusercontent.com/google/libphonenumber/refs/tags/v${version}/resources/PhoneNumberMetadata.xml`)
				.then((xml) => {
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