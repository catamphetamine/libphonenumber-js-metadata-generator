import type { MetadataJson, CountryCode, CountryCallingCode } from 'libphonenumber-js';

export interface DownloadedMetadata {
	date: Date;
	version: string;
	changes: string[];
	xml: string;
}

export function download(): Promise<DownloadedMetadata>;

type PhoneNumberType =
	| 'premium_rate'
	| 'toll_free'
	| 'shared_cost'
	| 'voip'
	| 'personal_number'
	| 'pager'
	| 'uan'
	| 'voicemail'
	| 'fixed_line'
	| 'mobile'

// Telephone numbering plan.
//
// Also see the document for more details:
// https://gitlab.com/catamphetamine/libphonenumber-js/-/blob/master/METADATA.md
//
interface TelephoneNumberingPlan {
	// Calling code.
	// Example: "1" in case of United States.
	phone_code: CountryCallingCode;

	// International Direct Dialing prefix.
	idd_prefix?: string;
	default_idd_prefix?: string;

	// Localized extension prefix.
	// Example: " ext. " in case of United States.
	ext?: string;

	// In case of several countries
	// having the same country phone code,
	// these leading digits are the means
	// of classifying an international phone number
	// whether it belongs to a certain country.
	//
	// E.g. for Antigua and Barbuda
	// country phone code is `"1"` (same as USA)
	// and leading digits are `"268"`.
	//
	leading_digits?: string;

	// The regular expression of all possible
	// national (significant) numbers for this country.
	national_number_pattern: string;

	// National prefix related fields:

	// aka "trunk code".
	// This is the prefix prepended to a
	// national (significant) phone number
	// when dialed from within the country.
	// E.g. `0` for UK.
	national_prefix?: string;

	// In some (many) countries the national prefix
	// is not just a constant digit (like `0` in UK)
	// but can be different depending on the phone number
	// (and can be also absent for some phone numbers).
	//
	// So `national_prefix_for_parsing` is used when parsing
	// a national-prefixed (local) phone number
	// into a national significant phone number
	// extracting that possible national prefix out of it.
	//
	national_prefix_for_parsing?: string;

	// If `national_prefix_for_parsing` regular expression
	// contains "captured groups", then `national_prefix_transform_rule`
	// defines how the national-prefixed (local) phone number is
	// parsed into a national significant phone number.
	//
	// Pseudocode:
	//
	// national_prefix_pattern = regular_expression('^(?:' + national_prefix_for_parsing + ')')
	// national_significant_number = all_digits.replace(national_prefix_pattern, national_prefix_transform_rule)
	//
	// E.g. if a country's national numbers are 6-digit
	// and national prefix is always `0`,
	// then `national_prefix_for_parsing` could be `0(\d{6})`
	// and the corresponding `national_prefix_transform_rule` would be `$1`
	// (which is the default behaviour).
	//
	// Currently this feature is only used in
	// Argentina, Brazil, Mexico and San Marino
	// due to their messy telephone numbering plans.
	//
	// For example, mobile numbers in Argentina are written in two completely
	// different ways when dialed in-country and out-of-country
	// (e.g. 0343 15-555-1212 is exactly the same number as +54 9 3435 55 1212).
	// Therefore for Argentina `national_prefix_transform_rule` is `9$1`.
	//
	national_prefix_transform_rule?: string;

	// Controls how national prefix is written
	// in a formatted local phone number.
	//
	// E.g. in Armenia national prefix is `0`
	// and `national_prefix_formatting_rule` is `($NP$FG)`
	// which means that a national significant phone number `xxxxxxxx`
	// matching phone number pattern `(\d{2})(\d{6})` with format `$1 $2`
	// is written as a local phone number `(0xx) xxxxxx`.
	//
	// As of 2026, this property seems to have been moved from country-wide level
	// to an individual `format` level.
	//
	national_prefix_formatting_rule?: string;

	// Is it possible that a national (significant)
	// phone number has leading zeroes?
	//
	// E.g. in Gabon some numbers start with a `0`
	// while the national prefix is also `0`
	// which is optional for mobile numbers.
	//
	// This seems to only be used for validating
	// possible formats in AsYouType formatter.
	//
	// national_prefix_is_optional_when_formatting: territory.$.nationalPrefixOptionalWhenFormatting ? Boolean(territory.$.nationalPrefixOptionalWhenFormatting) : undefined,

	// In some countries carrier code is required
	// to dial certain phone numbers.
	//
	// E.g. in Colombia calling to fixed line numbers
	// from mobile phones requires a carrier code when called within Colombia.
	// Or, for example, Brazilian fixed line and mobile numbers
	// need to be dialed with a carrier code when called within Brazil.
	// Without that, most of the carriers won't connect the call.
	//
	// As of 2026, this property seems to have been moved from country-wide level
	// to an individual `format` level.
	//
	domestic_carrier_code_formatting_rule?: string;

	// Possible lengths of national (significant) numbers.
	possible_lengths: number[];

	// // Possible lengths of national (significant) numbers
	// // that are local-only, i.e. could only be called within the country.
	// // Currently, this property is not present because `libphonenumber-js` only deals with non-local-only phone numbers.
	// possible_lengths_local?: number[];

	// Possible phone number formats.
	// Could be an empty array.
	formats: Array<{
		// Phone number digits pattern (for parsing the digits of an eligible phone number).
		// Example: "(\\d{3})(\\d{5})"
		pattern: string,
		// A pattern for outputting a formatted phone number.
		// Dollar-sign digits are the numbers of the "capturing groups" in the `pattern`.
		// Example: "$1 $2"
		format: string,
		// "Leading digits" patterns are used in `AsYouType` formatter to find a suitable `format`
		// for a given incomplete phone number: if an incomplete phone number's "leading digits"
		// match the `leading_digits_patterns` of a `format`, then this `format` should be used
		// to format the incomplete phone number.
		// The first element in the `leading_digits_patterns` array corresponds to the minimum required length of the "leading digits" of an incomplete phone number.
		// Each subsequent element in `leading_digits_patterns` array assumes that one more digit has been added to the incomplete phone number.
		// Example: ["8"]
		leading_digits_patterns?: string[],
		// Adds national prefix to the output phone number, if appropriate.
		// Example: "0$1"
		national_prefix_formatting_rule?: string
	}>;

	// These `types` will be discared later if they're not needed (which is most likely).
	// They're currently only used when there're multiple countries corresponding to the same calling code.
	// In such cases, it's not possible to determine the country of a phone number just by its "calling code" part,
	// and it has to be matched against each "candidate" country by either its `leading_digits` or by its `types` reg exps.
	//
	types?: Record<PhoneNumberType, {
		// Phone number pattern.
		pattern: string,
		// If `possible_lengths` is not present then it's equal to the country-wide `possible_lengths`.
		possible_lengths?: number[]
	}>;

	// Phone number examples by phone number type.
	examples?: Record<PhoneNumberType, string>;
}

interface NonMinifiedMetadataJson {
	// Metadata format version.
	// Previously, it used to be a "semver" string but now it's an integer.
	version: number;
  // For each "calling code", it lists the countries that have it.
	// Some "calling codes" correspond to only one country.
	// Others are shared between multiple countries.
	country_calling_codes: Record<CountryCallingCode, CountryCode[]>;
	// Telephone numbering plan for each country.
	countries: Record<CountryCode, TelephoneNumberingPlan>;
	// Telephone numbering plans for "non-geographic" calling codes.
	// http://npmjs.com/package/libphonenumber-js#non-geographic
  // "Non-geographic" calling codes are "calling codes" that don't belong to
  // any given country or territory and are inherently international.
	nonGeographic: Record<CountryCallingCode, TelephoneNumberingPlan>;
}

export interface GenerateOptions {
	countries?: string[];
	withPhoneNumberTypes?: boolean;
	phoneNumberTypes?: string[];
	withPhoneNumberTypeExamples?: boolean;
}

export function generate(
	metadataXml: string,
	options?: GenerateOptions
): Promise<NonMinifiedMetadataJson>;

export function minify(metadata: NonMinifiedMetadataJson): MetadataJson;

export const version: number;