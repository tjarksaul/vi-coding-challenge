import { html } from 'lit';
import './poke-list.ts';

// write default storybook story
export default {
  title: 'PokeList',
  component: 'poke-list',
  args: {
    headline: 'These are our products',
    offset: 0,
  },
  argTypes: {
    headline: { control: 'text' },
    offset: { control: 'number' },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = (args: { headline: string; offset: number }) => html`
  <poke-list .headline=${args.headline} .offset=${args.offset}></poke-list>
`;
