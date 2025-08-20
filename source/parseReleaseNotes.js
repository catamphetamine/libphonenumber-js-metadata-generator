export default function parseReleaseNotes(text) {
	// Read the latest version's entry of the release notes.
	const versionBlockSeparator = '\n\n'
	const versionBlockSeparatorStartsAt = text.indexOf(versionBlockSeparator)
	let latestVersionNotes
	if (versionBlockSeparatorStartsAt >= 0) {
		latestVersionNotes = text.slice(0, versionBlockSeparatorStartsAt)
	} else {
		// This scenario isn't supposed to be encountered in real life but is present in tests.
		latestVersionNotes = text
	}
	// Read the first line of the release notes.
	// It contains the release date and the version number.
	// Example: "Aug 13, 2025: v9.0.12"
	const [dateAndVersion, textAfterDateAndVersion] = readLine(latestVersionNotes)
	// Extract the latest released version from the first line of the release notes.
	// Example: "Aug 13, 2025: v9.0.12"
	const latestReleasedVersionMatch = dateAndVersion.match(/[A-Za-z]+ \d+, \d{4}: v([\d\.]+)$/)
	if (!latestReleasedVersionMatch) {
		throw new Error(`Latest release version not found in Google's release notes: ${firstLine}`)
	}
	// Example: "9.0.12".
	const latestReleasedVersion = latestReleasedVersionMatch[1]
	// Read the metadata changes.
	const metadataChanges = getMetadataChanges(textAfterDateAndVersion)
	// Return the result.
	return {
		version: latestReleasedVersion,
		changes: metadataChanges
	}
}

function getMetadataChanges(text) {
	const metadataChanges = []
	const metadataChangesStartMarker = 'Metadata changes:'
	const metadataChangesStartsAt = text.indexOf(metadataChangesStartMarker)
	if (metadataChangesStartsAt >= 0) {
		let metadataChangesAndRest = text.slice(metadataChangesStartsAt + metadataChangesStartMarker.length + '\n'.length)
		while (metadataChangesAndRest) {
			const [line, rest] = readLine(metadataChangesAndRest)
			if (line.indexOf(' - ') === 0) {
				metadataChanges.push(line.slice(' - '.length))
			} else if (line.indexOf('   ') === 0) {
				metadataChanges[metadataChanges.length - 1] += '\n' + line.slice('   '.length)
			} else {
				break
			}
			metadataChangesAndRest = rest
		}
	}
	return metadataChanges
}

function readLine(text) {
	const indexOfNewLineCharacter = text.indexOf('\n')
	if (indexOfNewLineCharacter >= 0) {
		return [
			text.slice(0, indexOfNewLineCharacter),
			text.slice(indexOfNewLineCharacter + '\n'.length)
		]
	}
	return [text, undefined]
}