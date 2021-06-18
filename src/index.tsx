import * as React from 'react';

type ComponentProps = {
  text: string;
  object: {
    a: string;
    b: string;
  };
};

export const Component = ({ text, object }: ComponentProps) => {
  const arr = { ...object, c: '3', d: '4' };

  return (
    <>
      `${text} + ${text} ${arr}`
    </>
  );
};
