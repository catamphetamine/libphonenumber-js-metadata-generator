#!/usr/bin/env node

var path     = require('path')
var fs       = require('fs')
var minimist = require('minimist')

var download = require('../commonjs/download').default
var generate = require('../commonjs/generate').default
var minify   = require('../commonjs/minify').default

var output_file_path = process.argv[2]

if (!output_file_path) {
	return usage('Path to the output metadata file not specified')
}

output_file_path = path.resolve(output_file_path)

console.log('Metadata output path:', output_file_path)

var command_line_arguments = minimist(process.argv.slice(3))

// Whether it should output non-minified metadata or not
var non_minified = false
if (command_line_arguments['non-minified']) {
	console.log('Output non-minified metadata')
	non_minified = true
}

// Included countries
var included_countries
if (command_line_arguments.countries) {
	included_countries = command_line_arguments.countries.split(',')
	console.log('Included countries:', included_countries)
}

// Whether it should include the regular expressions for phone number types or not
var with_phone_number_types = false
if (command_line_arguments['with-phone-number-types']) {
	console.log('Include regular expressions for phone number types')
	with_phone_number_types = true
}

// Included phone number types
var included_phone_number_types
if (command_line_arguments['phone-number-types']) {
	if (!with_phone_number_types) {
		throw new Error('`--phone-number-types` argument requires `--with-phone-number-types` argument')
	}
	included_phone_number_types = command_line_arguments['phone-number-types'].split(',')
	console.log('Included phone number types:', included_phone_number_types)
}

// Whether it should include example phone numbers
var with_phone_number_type_examples = false
if (command_line_arguments['with-phone-number-type-examples']) {
	with_phone_number_type_examples = true
	console.log('Include phone number type examples')
	if (!non_minified) {
		console.warn('Phone number type examples will be removed at the minification stage')
	}
}

// // Included phone number type examples
// var included_phone_number_type_examples
// if (command_line_arguments['phone-number-type-examples']) {
// 	if (!with_phone_number_type_examples) {
// 		throw new Error('`--phone-number-type-examples` argument requires `--with-phone-number-type-examples` argument')
// 	}
// 	included_phone_number_type_examples = command_line_arguments['phone-number-type-examples'].split(',')
// 	console.log('Included phone number type examples:', included_phone_number_type_examples)
// }

// (legacy argument: --extended)
// Whether it should include the regular expressions for all phone number types or not
if (command_line_arguments.extended) {
	console.log('Include regular expressions for all phone number types')
	with_phone_number_types = true
}

// (legacy argument: --types)
// Included phone number types
if (command_line_arguments.types) {
	with_phone_number_types = true
	included_phone_number_types = command_line_arguments.types.split(',')
	console.log('Include regular expressions for phone number types:', included_phone_number_types)
}

// Download the latest `PhoneNumberMetadata.xml`
// from Google's `libphonenumber` github repository.
download()
	.then(function({ version: metadataVersion, changes: metadataChanges, xml: metadataXml }) {
		// Print the metadata version and a list of changes.
		console.log('========================================')
		console.log(`= Metadata version: ${metadataVersion}`)
		console.log(`= Changes:\n${metadataChanges.map(_ => '= * ' + _).join('\n')}`)
		console.log('========================================')

		// Generate and minify metadata
		return generate(metadataXml, {
			countries: included_countries,
			withPhoneNumberTypes: with_phone_number_types,
			phoneNumberTypes: included_phone_number_types,
			withPhoneNumberTypeExamples: with_phone_number_type_examples
		})
	})
	.then(function(metadataJson) {
		// Compare old and new metadata.
		var previous_metadata = fs.existsSync(output_file_path)
			? fs.readFileSync(output_file_path, 'utf8')
			: undefined
		var new_metadata = non_minified
			? JSON.stringify(metadataJson, undefined, 2)
			: JSON.stringify(minify(metadataJson))

		if (!previous_metadata || previous_metadata !== new_metadata) {
			console.log('========================================')
			console.log('=       Metadata has been updated      =')
			console.log('========================================')
			// Write the new metadata to file
			fs.writeFileSync(output_file_path, new_metadata)
		}
	})
	.catch(function(error) {
		console.error(error)
		process.exit(1)
	})

function usage(reason) {
	if (reason) {
		console.log(reason)
		console.log('')
	}

	console.log('Usage:')
	console.log('')
	console.log('libphonenumber-generate-metadata <path-to-the-output-json-file> [options]')
	console.log('')
	console.log('Options:')
	console.log('')
	console.log('   countries - Include only specific countries')
	console.log('')
	console.log('               Example: "--countries RU,FR,DE"')
	console.log('')
	console.log('   with-phone-number-types - Include the regular expressions for more precise phone number validation and determining phone number type')
	console.log('')
	console.log('              Example: "--with-phone-number-types"')
	console.log('')
	console.log('   phone-number-types - Include the regular expressions for only specific phone number types')
	console.log('')
	console.log('              Example: "--with-phone-number-types --phone-number-types mobile,fixed_line"')
	console.log('')
	console.log('   with-phone-number-type-examples - Includes phone number examples (one for each phone number type)')
	console.log('')
	console.log('              Example: "--with-phone-number-type-examples"')
	console.log('')
	console.log('   non-minified - Outputs non-minified metadata')
	console.log('')
	console.log('              Example: "--non-minified"')

	if (reason) {
		return process.exit(1)
	}

	process.exit(0)
}