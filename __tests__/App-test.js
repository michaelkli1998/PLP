import 'react-native';
import React from 'react';

import App from '../App';

// Note: `react-test-renderer` must be after `react-native`
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    renderer.create(<App/>);
});
