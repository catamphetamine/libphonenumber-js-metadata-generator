import parseReleaseNotes from './parseReleaseNotes'
import downloadFile from './downloadFile'

// Downloads `PhoneNumberMetadata.xml` file from Google's `libphonenumber` GitHub repository.
export default function downloadPhoneNumberMetadataXml() {
	return downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub()
}

// This is what `raw.githubusercontent.com` server returns with HTTP status code 200
// when requesting a file that doesn't exist.
const FILE_NOT_FOUND_CONTENT = '404: Not Found'

const RELEASE_NOTES_URL = 'https://raw.githubusercontent.com/googlei18n/libphonenumber/master/release_notes.txt'

const GOOGLE_REPOSITORY_TAG_NAME_TEMPLATE = 'v{version}'
const METADATA_XML_URL_TEMPLATE = 'https://raw.githubusercontent.com/google/libphonenumber/refs/tags/{tag}/resources/PhoneNumberMetadata.xml'

// Downloads the latest released revision of `PhoneNumberMetadata.xml` file from Google's GitHub releases.
function downloadPhoneNumberMetadataXmlForLatestReleaseFromGitHub() {
	console.log('Downloading `release_notes.txt` file from Google\'s `libphonenumber` GitHub repository')
	return downloadFile(RELEASE_NOTES_URL)
		.then((releaseNotes) => {
			if (releaseNotes === FILE_NOT_FOUND_CONTENT) {
				throw new FileNotFoundError(
					'`release_notes.txt` file was not found in Google\'s `libphonenumber` GitHub repository',
					RELEASE_NOTES_URL
				)
			}

			// Read the latest version's entry in the release notes.
			const releasedVersionsInfo = parseReleaseNotes(releaseNotes)
			// If not a single release notes entry has been parsed, throw an error.
			if (releasedVersionsInfo.length === 0) {
				throw new Error('Couldn\'t parse released versions\' entries from `release_notes.txt` in Google\'s `libphonenumber` GitHub repository')
			}

			console.log('Latest released version of Google\'s `libphonenumber`: ' + releasedVersionsInfo[0].version)
			console.log('Downloading `PhoneNumberMetadata.xml` for that version')

			// Download metadata XML.
			//
			// It has been pointed out that a release version "tag" in the git repository usually gets created with a delay
			// that could be up to a couple of hours: https://gitlab.com/catamphetamine/libphonenumber-metadata-generator/-/issues/4
			//
			// A workaround is to attempt to download the latest release metadata
			// and then fall back to the previous release metadata.
			//
			return downloadMetadataXmlForReleaseVersion(releasedVersionsInfo[0].version)
				.then(
					// If the latest release metadata file exists then return the result.
					(xml) => ({ ...releasedVersionsInfo[0], xml }),
					(error) => {
						// If the latest release metadata file was not found,
						// it's likely to the git "tag" not having been created yet.
						if (error instanceof FileNotFoundError) {
							// If there's no previous release then exit with an error.
							if (releasedVersionsInfo.length === 1) {
								throw error
							}
							// Fall back to the previous release metadata.
							return downloadMetadataXmlForReleaseVersion(releasedVersionsInfo[1].version)
								.then(
									// If the previous release metadata file exists then return the result.
									(xml) => ({ ...releasedVersionsInfo[1], xml }),
									(error) => {
										// If the prevoius release metadata file was not found
										// then it seems like some kind of an unusual error.
										if (error instanceof FileNotFoundError) {
											throw new Error(`Neither tag "${GOOGLE_REPOSITORY_TAG_NAME_TEMPLATE.replace('{version}', releasedVersionsInfo[0].version)}" nor tag "${GOOGLE_REPOSITORY_TAG_NAME_TEMPLATE.replace('{version}', releasedVersionsInfo[1].version)}" were found in Google's \`libphonenumber\` GitHub repository. This is not supposed to happen.`)
										} else {
											throw error
										}
									}
								)
						} else {
							throw error
						}
					}
				)
		})
}

// Downloads the latest `PhoneNumberMetadata.xml` file from Google's GitHub repository,
// regardless of whether this XML file has been released yet or not.
function downloadPhoneNumberMetadataXmlFromGitHub() {
	console.log('Downloading latest `PhoneNumberMetadata.xml` from Google\'s `libphonenumber` GitHub repository')
	return download('https://raw.githubusercontent.com/googlei18n/libphonenumber/master/resources/PhoneNumberMetadata.xml')
		.then((xml) => {
			return {
				version: 'latest',
				changes: [],
				xml
			}
		})
}

function downloadMetadataXmlForReleaseVersion(version) {
	// Download `PhoneNumberMetadata.xml` file from the GitHub repo "tag" that corresponds to the latest released version.
	//
	// It has been pointed out that a release version "tag" in the git repository usually gets created with a delay
	// that could be up to a couple of hours: https://gitlab.com/catamphetamine/libphonenumber-metadata-generator/-/issues/4
	//
	const tag = GOOGLE_REPOSITORY_TAG_NAME_TEMPLATE.replace('{version}', version)
	const metadataXmlUrl = METADATA_XML_URL_TEMPLATE.replace('{tag}', tag)
	return downloadFile(metadataXmlUrl)
		.then((xml) => {
			if (xml === FILE_NOT_FOUND_CONTENT) {
				throw new FileNotFoundError(
					`Tag "v${version}" was not found in Google's \`libphonenumber\` GitHub repository. Perhaps it hasn't been created yet. Try again later.`,
					metadataXmlUrl
				)
			}
			return xml
		})
}

class FileNotFoundError extends Error {
	constructor(message, url) {
		super(message)
		this.url = url
	}
}