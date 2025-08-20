import { describe, it } from 'mocha'
import { expect } from 'chai'

import parseReleaseNotes from './parseReleaseNotes.js'

describe('parseReleaseNotes', () => {
	it('should parse release notes', () => {
		expect(parseReleaseNotes(
`Jan 13, 2025: v8.13.53
Code changes:
 - Fixed a bug where the extension was appended twice in formatOutOfCountryKeepingAlphaChars in the Java version and updated FormatOutOfCountryKeepingAlphaChars in the C++ version to format the extension.
Metadata changes:
 - Updated phone metadata for region code(s):
   EH, IL, LV, MA, MK, MM, MU, PW, SO
 - Updated carrier data for country calling code(s):
   90 (en), 92 (en), 212 (en), 229 (en), 252 (en), 351 (en), 371 (en), 389 (en),
   597 (en), 680 (en)
 - Updated / refreshed time zone meta data.`
		)).to.deep.equal({
			version: '8.13.53',
			changes: [
				'Updated phone metadata for region code(s):\nEH, IL, LV, MA, MK, MM, MU, PW, SO',
				'Updated carrier data for country calling code(s):\n90 (en), 92 (en), 212 (en), 229 (en), 252 (en), 351 (en), 371 (en), 389 (en),\n597 (en), 680 (en)',
				'Updated / refreshed time zone meta data.'
			]
		})
	})

	it('should parse release notes (no metadata changes)', () => {
		expect(parseReleaseNotes(
`Jan 13, 2025: v8.13.53
Code changes:
 - Fixed a bug where the extension was appended twice in formatOutOfCountryKeepingAlphaChars in the Java version and updated FormatOutOfCountryKeepingAlphaChars in the C++ version to format the extension.`
		)).to.deep.equal({
			version: '8.13.53',
			changes: []
		})
	})

	it('should parse release notes (multiple releases)', () => {
		expect(parseReleaseNotes(
`Feb 13, 2025: v8.13.55
Metadata changes:
 - Updated phone metadata for region code(s): BE, CZ, SR
 - Updated short number metadata for region code(s): NO
 - Updated carrier data for country calling code(s):
   33 (en), 41 (en), 255 (en), 351 (en), 503 (en), 597 (en)

Jan 29, 2025: v8.13.54
Metadata changes:
 - Updated phone metadata for region code(s): HK, ML, NC, PL, US
 - New geocoding data for country calling code(s): 1274 (en)
 - Updated carrier data for country calling code(s):
   41 (en), 48 (en), 51 (en), 223 (en), 268 (en), 852 (en, zh)
 - Updated / refreshed time zone meta data.`
		)).to.deep.equal({
			version: '8.13.55',
			changes: [
				'Updated phone metadata for region code(s): BE, CZ, SR',
				'Updated short number metadata for region code(s): NO',
				'Updated carrier data for country calling code(s):\n33 (en), 41 (en), 255 (en), 351 (en), 503 (en), 597 (en)'
			]
		})
	})
})