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
		)).to.deep.equal([{
			date: new Date(Date.UTC(2025, 0, 13)),
			version: '8.13.53',
			changes: [
				'Updated phone metadata for region code(s):\nEH, IL, LV, MA, MK, MM, MU, PW, SO',
				'Updated carrier data for country calling code(s):\n90 (en), 92 (en), 212 (en), 229 (en), 252 (en), 351 (en), 371 (en), 389 (en),\n597 (en), 680 (en)',
				'Updated / refreshed time zone meta data.'
			]
		}])
	})

	it('should parse release notes (no metadata changes)', () => {
		expect(parseReleaseNotes(
`Jan 13, 2025: v8.13.53
Code changes:
 - Fixed a bug where the extension was appended twice in formatOutOfCountryKeepingAlphaChars in the Java version and updated FormatOutOfCountryKeepingAlphaChars in the C++ version to format the extension.`
		)).to.deep.equal([{
			date: new Date(Date.UTC(2025, 0, 13)),
			version: '8.13.53',
			changes: []
		}])
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
 - Updated / refreshed time zone meta data.

August 11th, 2011: libphonenumber-3.8
* Code changes
 - Fix to demo to not throw null-ptr exceptions for invalid NANPA numbers
 - Fixed AYTF to not accept plus signs in the middle of input
 - PhoneNumberMatcher improvements - added STRICT_GROUPING and EXACT_GROUPING levels, numbers
   followed/preceded by a currency symbol will not match, multiple numbers separated by phone-number
   punctuation will now match. ", " is no longer accepted as an extension symbol when matching, only
   when parsing. "x" is only accepted as a carrier code or extension marker, not otherwise.
 - Changes to handling of leading zeroes - these will not be silently ignored anymore, but will be
   stored as part of the number.
 - PhoneNumberOfflineGeocoder - new method to get the description of a number that assumes the
   validity of the number has already been checked and will not re-verify it.
 - Split geocoding US binary data into multiple files.

July 30th, 2010
* Metadata change:
  - new country: TL
  - update to existing country: AZ, CN, FR, GH, JO, LA, PG, PK, QA, SZ, UA, VN

* Code improvement
  - China local number formatting for AsYouTypeFormatter
  - improve extension parsing to handle number in the form of +1 (645) 123 1234 ext. 910#`
		)).to.deep.equal([{
			date: new Date(Date.UTC(2025, 1, 13)),
			version: '8.13.55',
			changes: [
				'Updated phone metadata for region code(s): BE, CZ, SR',
				'Updated short number metadata for region code(s): NO',
				'Updated carrier data for country calling code(s):\n33 (en), 41 (en), 255 (en), 351 (en), 503 (en), 597 (en)'
			]
		}, {
			date: new Date(Date.UTC(2025, 0, 29)),
			version: '8.13.54',
			changes: [
				'Updated phone metadata for region code(s): HK, ML, NC, PL, US',
				'New geocoding data for country calling code(s): 1274 (en)',
				'Updated carrier data for country calling code(s):\n41 (en), 48 (en), 51 (en), 223 (en), 268 (en), 852 (en, zh)',
				'Updated / refreshed time zone meta data.'
			]
		}, {
			date: new Date(Date.UTC(2011, 7, 11)),
			version: '3.8',
			changes: []
			// changes: [
			// 	'Fix to demo to not throw null-ptr exceptions for invalid NANPA numbers',
			// 	'Fixed AYTF to not accept plus signs in the middle of input',
			// 	'PhoneNumberMatcher improvements - added STRICT_GROUPING and EXACT_GROUPING levels, numbers\nfollowed/preceded by a currency symbol will not match, multiple numbers separated by phone-number\npunctuation will now match. ", " is no longer accepted as an extension symbol when matching, only\nwhen parsing. "x" is only accepted as a carrier code or extension marker, not otherwise.',
			// 	'Changes to handling of leading zeroes - these will not be silently ignored anymore, but will be\nstored as part of the number.',
			// 	'PhoneNumberOfflineGeocoder - new method to get the description of a number that assumes the\nvalidity of the number has already been checked and will not re-verify it.',
			// 	'Split geocoding US binary data into multiple files.'
			// ]
		}, {
			date: new Date(Date.UTC(2010, 6, 30)),
			version: undefined,
			changes: []
			// changes: [
			// 	'new country: TL',
			// 	'update to existing country: AZ, CN, FR, GH, JO, LA, PG, PK, QA, SZ, UA, VN'
			// ]
		}])
	})
})