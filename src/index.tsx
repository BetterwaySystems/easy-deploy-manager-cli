#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './App';

const cli = meow(`
	Usage
	  $ ed-manager

	Options
		--type next or nest

	Examples
	  $ ed-manager init --type nest 
`, {
	flags: {
		type: {
			type: 'string',
			alias : 't'
		}
	}
});

const command = cli.input[0];
const options = cli.flags;

render(<App command={command} options={options}/>);