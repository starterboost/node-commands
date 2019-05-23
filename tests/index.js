const util = require('util');
const _ = require('lodash');
const {parseCommands,applyCommands} = require('..');


describe('Commands', () => {
	//an empty test
	it('Should start tests', () => {console.assert(true,'How could we ever end up here?')})
	
	//verify library existence
	it('Should find the library', () => {
		console.assert( util.isFunction( parseCommands ), 'Expected function parseCommands' );
		console.assert( util.isFunction( applyCommands ), 'Expected function applyCommands' );
	} );

	//getCommands should return the basic arguments from the command line
	it('Should use getCommands to return different formats of arguments', () => {
		const PORT = "10000";
		return runInEnvironment({PORT}, () => {
			const args = {
				"--port" : {port:true},
				"--port env.PORT" : {port:PORT},
				"--port env.PORT_UNDEFINED||8000" : {port:"8000"},
			}
	
			_.each( args, ( resultExpected, args ) => {
				const result = parseCommands( args.split(' ') );
	
				console.assert( _.isEqual(
					result, resultExpected
				), `Expected parsing '${args}' to be equal to:\n${JSON.stringify(resultExpected,null,'\t')}\nreceived:\n${JSON.stringify(result,null,'\t')}` )
			});
		})
	});

	it('Should use getCommands to use a schema', () => {
		const PORT = "10000";
		return runInEnvironment({PORT}, () => {
			//STANDARD SCHEMA WE WILL USE THROUGHOUT
			const schema = {
				port : {type:'number'}
			}
			
			const args = {
				"--port env.PORT" : {port:Number(PORT)},
				"--port env.PORT_UNDEFINED||8000" : {port:8000},
			}
	
			_.each( args, ( resultExpected, args ) => {
				const result = parseCommands( args.split(' '), {schema:schema} );
	
				console.assert( _.isEqual(
					result, resultExpected
				), `Expected parsing '${args}' to be equal to:\n${JSON.stringify(resultExpected,null,'\t')}\nreceived:\n${JSON.stringify(result,null,'\t')}` )
			});
		});
	});

});

//HELPER
function runInEnvironment( settings, script ){
	const env = process.env;
	//overwrite the environment here with temp values
	process.env = _.merge( _.clone( env ), settings );
	return Promise.resolve().then( script )
	.catch( err => {
		//reset the environment after an error
		process.env = env;
		//continue to throw the error
		throw err;
	} )
	.then( () => {
		//reset the environment before exiting
		process.env = env;
	} );
}