module.exports = {
	"presets": [
		"@babel/env"
	],
	"env": {
		"es6": {
			"presets": [
				["@babel/env", { "modules": false }]
			]
		}
	}
}
