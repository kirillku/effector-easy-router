import * as React from 'react';

import { text, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

export default { title: 'Debug' };

export const withTextKnob = () => {
  const userName = text('Name', 'Maria');
  return <button>Hello, {userName}!</button>;
};

export const withBoleanKnob = () => {
  const [isClicked, toggle] = React.useState(false);

  const handleClick = () => toggle(!isClicked);

  return (
    <button onClick={handleClick}>
      Hello Button {boolean('Clicked', isClicked) && 'clicked!'}
    </button>
  );
};

export const withAction = () => {
  return (
    <button onClick={(e) => action('What returns Button')(e)}>
      Hello Button
    </button>
  );
};
