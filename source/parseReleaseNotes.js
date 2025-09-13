export default function parseReleaseNotes(text, versionsInfo = []) {
	// Get a block of release notes that describes a released version.
	const [versionNotes, restText] = getVersionNotes(text)

	// Read the first line of the release notes.
	// It contains the release date and the version number.
	// Example: "Aug 13, 2025: v9.0.12"
	const [dateAndVersionText, textAfterDateAndVersion] = readLine(versionNotes)

	// Old release notes entries might have a "\n\n" sequence after the "date and version" line.
	// Skip such old release notes entries.
	if (textAfterDateAndVersion) {
		// Parse `date` and `version` from the first line of text.
		// `date` example: "Nov 23, 2016".
		// `version` example: "9.0.12".
		const dateAndVersion = parseDateAndVersion(dateAndVersionText)

		if (dateAndVersion) {
			const { date, version } = dateAndVersion

			// Read the metadata changes.
			const metadataChanges = parseMetadataChanges(textAfterDateAndVersion)

			// Add this version's info to the list and proceed recursively.
			versionsInfo = versionsInfo.concat([{
				date,
				version,
				changes: metadataChanges
			}])
		}
	}

	// If there're more release notes.
	if (restText) {
		return parseReleaseNotes(restText, versionsInfo)
	}

	// If there're no more release notes, return the result.
	return versionsInfo
}

const METADATA_CHANGES_START_MARKER = 'Metadata changes:'
const METADATA_CHANGES_ITEM_START_MARKER = ' - '
const METADATA_CHANGES_ITEM_NEW_LINE_MARKER = '   '

// Parses metadata changes from text.
// Finds "Metadata changes:" line, then reads everything below it that starts with a " - ".
// Returns a list of metadata changes (an array of strings).
function parseMetadataChanges(text) {
	const metadataChanges = []

	// First, it looks for a "Metadata changes:" line which denotes a start of metadata changes block.
	const metadataChangesStartsAt = text.indexOf(METADATA_CHANGES_START_MARKER)
	if (metadataChangesStartsAt >= 0) {
		// If the "Metadata changes:" line is found, the next lines describe metadata changes.
		// Those lines start with either " - " or "   ".
		// If it encounters anything different then it assumes the end of metadata changes block.
		let metadataChangesAndRest = text.slice(metadataChangesStartsAt + METADATA_CHANGES_START_MARKER.length + '\n'.length)
		while (metadataChangesAndRest) {
			const [line, rest] = readLine(metadataChangesAndRest)
			if (line.indexOf(METADATA_CHANGES_ITEM_START_MARKER) === 0) {
				// If it encounters a "new list item" sequence, it adds a new entry in the list of changes,
				metadataChanges.push(line.slice(METADATA_CHANGES_ITEM_START_MARKER.length))
			} else if (line.indexOf(METADATA_CHANGES_ITEM_NEW_LINE_MARKER) === 0) {
				// If it encounters a "new line" sequence within a given "list item",
				// it appends the text on the new line to the text of the latest entry in the list of changes.
				metadataChanges[metadataChanges.length - 1] += '\n' + line.slice(METADATA_CHANGES_ITEM_NEW_LINE_MARKER.length)
			} else {
				// If it encounters anything different then it assumes the end of metadata changes block.
				break
			}
			metadataChangesAndRest = rest
		}
	}

	return metadataChanges
}

// Reads the top line from the text.
// Returns that line of text and the rest of the text.
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

// Splits `text` into a "version notes" block and "rest text".
function getVersionNotes(text) {
	// Read the latest version's entry of the release notes.
	const versionBlockSeparatorStartsAt = text.indexOf(VERSION_BLOCK_SEPARATOR)
	if (versionBlockSeparatorStartsAt >= 0) {
		const versionNotes = text.slice(0, versionBlockSeparatorStartsAt)
		const restText = text.slice(versionBlockSeparatorStartsAt + VERSION_BLOCK_SEPARATOR.length)
		return [versionNotes, restText]
	} else {
		return [text, undefined]
	}
}

// Parses `date` and `version` from a line of text.
// `date` example: "Nov 23, 2016".
// `version` example: "9.0.12".
function parseDateAndVersion(dateAndVersion) {
	// Example: "Aug 13, 2025: v9.0.12"
	let match = dateAndVersion.match(DATE_AND_VERSION_REGEXP_3)
	if (match) {
		return {
			date: new Date(Date.UTC(
				getYearNumber(match[3]),
				getMonthNumber(match[1]) - 1,
				getDayNumber(match[2])
			)),
			version: match[4]
		}
	}

	// Example: "August 11th, 2011: libphonenumber-3.8"
	match = dateAndVersion.match(DATE_AND_VERSION_REGEXP_2)
	if (match) {
		return {
			date: new Date(Date.UTC(
				getYearNumber(match[3]),
				getMonthNumber(match[1]) - 1,
				getDayNumber(match[2])
			)),
			version: match[4]
		}
	}

	// Example: "July 30th, 2010"
	match = dateAndVersion.match(DATE_AND_VERSION_REGEXP_1)
	if (match) {
		return {
			date: new Date(Date.UTC(
				getYearNumber(match[3]),
				getMonthNumber(match[1]) - 1,
				getDayNumber(match[2])
			)),
			version: match[4]
		}
	}
}

function getYearNumber(text) {
	return Number(text)
}

function getMonthNumber(text) {
	if (MONTHS_SHORT.includes(text)) {
		return MONTHS_SHORT.indexOf(text) + 1
	}
	if (MONTHS_LONG.includes(text)) {
		return MONTHS_LONG.indexOf(text) + 1
	}
}

function getDayNumber(text) {
	// Example: "02" → 2.
	return parseInt(text, 10)
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

// The latest format of release notes entry header.
// Example: "Nov 23, 2016: v7.7.5"
const DATE_AND_VERSION_REGEXP_3 = /([A-Za-z]+) (\d+), (\d{4}): v([\d\.]+)$/

// One of the older formats of release notes entry header.
// Example: "August 11th, 2011: libphonenumber-3.8"
const DATE_AND_VERSION_REGEXP_2 = /([A-Za-z]+) (\d+)(?:th)?, (\d{4}): libphonenumber-([\d\.]+)$/

// The initial format of release notes entry header.
// Example: "July 30th, 2010"
const DATE_AND_VERSION_REGEXP_1 = /([A-Za-z]+) (\d+)(?:th)?, (\d{4})$/

const VERSION_BLOCK_SEPARATOR = '\n\n'