import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import { Task } from '@lit/task';
import { capitalize } from './utilities.ts';

const colours: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const getTypeColor = (type: string) => colours[type.toLowerCase()] || '#777';

@customElement('pokemon-box')
export class PokemonBox extends LitElement {
  @property() url: string = 'https://pokeapi.co/api/v2/pokemon/6/';
  @property() loading: boolean = false;

  private _pokemonTask = new Task<[string], PokemonDetails>(this, {
    task: async ([url], { signal }) => {
      if (url === '') {
        return;
      }
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    },
    args: () => [this.url],
  });

  @property() _name: string = 'Bulbasaur';
  @property() _image: string =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png';
  @property() _types: string[] = ['grass'];

  private renderActual(
    id: string,
    name: string,
    image: string,
    types: string[],
    loading: boolean
  ) {
    return html`
      <a href="/pokemon/${id}">
        <div class="pokemon">
          <div class="image">
            <img
              src="${image}"
              alt="${name}"
              class=${loading ? 'skeleton' : ''}
            />
            <span class="number">${loading ? '' : `#${id}`}</span>
          </div>
          <div class="caption">
            <h4 class=${loading ? 'skeleton skeleton-text' : ''}>${name}</h4>
            <div class="type-indicators ${loading ? 'skeleton' : ''}">
              ${types.map(
                (type: string) => html`
                  <span
                    class="type-indicator"
                    style="background-color: ${getTypeColor(type)}"
                    title=${capitalize(type)}
                  ></span>
                `
              )}
            </div>
          </div>
        </div>
      </a>
    `;
  }

  render() {
    if (this.loading) {
      return this.renderActual('', '', '', [], true);
    }

    return this._pokemonTask.render({
      pending: () => this.renderActual('', '', '', [], true),
      complete: pokemon => {
        const name = capitalize(pokemon.name);
        const image = pokemon.sprites.other['official-artwork'].front_default;
        const types = pokemon.types.map(type => type.type.name);

        return this.renderActual(pokemon.id + '', name, image, types, false);
      },
      error: e => html`<p>Error: ${e}</p>`,
    });
  }

  static styles = css`
    a {
      text-decoration: none;
      display: block;
      color: inherit;
    }

    .pokemon {
      border: 0.125rem solid black;

      h4 {
        font-weight: normal;
      }
    }

    .image {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 3rem;
      grid-template-rows: 2.5rem 1fr;
      position: relative;

      > img {
        grid-column: 1 / -1;
        grid-row: 1 / -1;
        max-width: calc(100% - 1rem);
        padding: 0.5rem;
      }

      > .number {
        grid-column: 2 / -1;
        grid-row: 1 / 2;
        top: 0.5rem;
        right: 0.5rem;
        position: absolute;
        text-align: right;
      }
    }

    .caption {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-top: 0.125rem solid black;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .type-indicators {
      display: flex;
      flex-direction: row;
      gap: 0.125rem;
    }

    .type-indicator {
      height: 1em;
      width: 1em;
      background-color: #bbb;
      border-radius: 50%;
      display: inline-block;
    }

    .skeleton {
      animation: skeleton-loading 1s linear infinite alternate;
    }

    @keyframes skeleton-loading {
      0% {
        background-color: hsl(200, 20%, 80%);
      }
      100% {
        background-color: hsl(200, 20%, 95%);
      }
    }

    .skeleton-text {
      max-width: 100%;
      width: 6rem;
      height: 1lh;
      margin-bottom: 0.5rem;
      border-radius: 0.25rem;
    }
  `;
}

// todo: extract types into separate module
interface PokemonDetails {
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  id: number;
}
