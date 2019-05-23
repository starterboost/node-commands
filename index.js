const util = require('util');
const _ = require('lodash');
const inspector = require('schema-inspector');

const REGEX_PROP_NAME = /^--(.+)/;
const REGEX_ENV_VARIABLE = /^env\.([A-Z_]+)([\|]{2}(.+))?$/;
const REGEX_NPM_VARIABLE = /^npm\.([A-Z_]+)([\|]{2}(.+))?$/;

//console.log( REGEX_PROP_NAME.exec('--name.new') )
// console.log( REGEX_ENV_VARIABLE.exec('env.PORT') )
// console.log( REGEX_ENV_VARIABLE.exec('env.PORT||TestTestTes') )
// console.log( REGEX_NPM_VARIABLE.exec('npm.PASSWORD') )
// console.log( REGEX_NPM_VARIABLE.exec('npm.PASSWORD||TestTestTes') )

const applyCommands = ( target ) => {
	return {}
}

const parseCommands = function( argv, options ){
	//normalise the arguments
	if( _.size( arguments ) < 2 ){
		if( _.isArrayLike( argv ) ){
			options = null;
		}else if( _.isObject( argv ) ){
			options = argv;
		}
	}

	//default to using the arguments from the process
	argv = _.isArrayLike( argv ) ? argv : process.argv;
	//default options to empty
	options = options || {};
	//try to read a schema
	var schema = options.schema;

	var output = {};
	var state = null;

	_.each( argv, ( value, index ) => {
		var nextState = null;
		//iterate through all the arguments from the commands
		if( REGEX_PROP_NAME.test( value ) ){
			nextState = value.substr(2);
			//there maybe no associated value - just default to true
			output[ nextState ] = true;
		}else if( state ){
			if( REGEX_ENV_VARIABLE.test( value ) ){
				const result = REGEX_ENV_VARIABLE.exec( value );
				//READ AN ENVIRONMENT VARIABLE
				value = getEnvironmentVariable( result[1], result[3] );
			}else 
			if( REGEX_NPM_VARIABLE.test( value ) ){
				const result = REGEX_NPM_VARIABLE.exec( value );
				//READ AN ENVIRONMENT VARIABLE
				value = getNpmVariable( result[1], result[3] );	
			}
			//apply the 
			output[state] = value;
		}

		//record the next state 
		state = nextState;
	} );

	if( schema ){
		const {data} = inspector.sanitize({
			type: 'object',
			properties : schema
		}, output);
		output = data;
	}



	return output;
}


module.exports = {
	parseCommands,
	applyCommands
}

//HELPER FUNCTIONS
function getEnvironmentVariable( name, defaultValue ){
	var value = process.env[name];
	value = util.isNullOrUndefined( value ) ? defaultValue : value;
	//check for a null value
	if( util.isNullOrUndefined( value ) ){
		//throw an error
		throw new Error(`env.${name} is undefined and a default value was not provided\n\ntry "env.${name}||$defaultValue"\n`);
	}

	return value;
}

function getNpmVariable( name, defaultValue ){

}