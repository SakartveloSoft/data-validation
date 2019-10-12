//this file was copied from ts-mocha package.
//somehow it works directly while using ts-mocha DOES NOT work at IDE test runner.
try {
    // default ts-node config
    const project =
        process.env.TS_NODE_PROJECT ||
        process.env._TS_PROJECT_PATH__ ||
        './tsconfig.json';
    require('ts-node').register({
        project,
        transpileOnly: true,
    });
    // opt-in tsconfig-paths config
    if (process.env.TS_CONFIG_PATHS) {
        require('tsconfig-paths/register');
    }
} catch (error) {
    console.log('[ERROR] ' + error.message);
    process.exit(1);
}