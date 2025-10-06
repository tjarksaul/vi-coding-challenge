import { html } from 'lit';
import './pokemon-box.ts';

// write default storybook story
export default {
  title: 'Pokemon',
  component: 'pokemon-box',
  args: {
    url: 'https://pokeapi.co/api/v2/pokemon/6/',
    loading: false,
  },
  argTypes: {
    url: { control: 'text' },
    loading: { control: 'boolean' },
  },
};

export const Default = (args: { url: string; loading: boolean }) => html`
  <pokemon-box .url=${args.url} .loading=${args.loading}></pokemon-box>
`;
