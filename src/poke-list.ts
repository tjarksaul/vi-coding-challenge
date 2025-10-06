import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './filter-view.ts';
import './pokemon-box.ts';
import { Task } from '@lit/task';
import type { FilterChangeEvent } from './filter-view.ts';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('poke-list')
export class PokeList extends LitElement {
  @property()
  headline = 'These are our products';

  @property()
  page = 1;
  @property()
  offset = 0;
  @property()
  limit = 20;
  @property()
  filter: string[] = [];

  @property()
  private _filterShown = false;

  _pokemonTask = new Task<[string[], number, number], PokemonData>(this, {
    task: async ([filters, offset, limit], { signal }) => {
      if (filters.length === 0) {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`,
          { signal }
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();

        return {
          pages: data.count / this.limit,
          pokemon: data.results,
        };
      } else {
        const urls = filters.map(
          filter => `https://pokeapi.co/api/v2/type/${filter}/`
        );
        const fetchFilter = async (url: string) => {
          const response = await fetch(url, { signal });
          if (!response.ok) {
            throw new Error(response.statusText);
          }

          const data = (await response.json()) as TypeResponse;
          return data.pokemon.map(({ pokemon }) => pokemon);
        };

        const results = await Promise.all(urls.map(url => fetchFilter(url)));

        const pokemon = results.slice(1).reduce((prev, cur) => {
          return prev.filter(val => cur.some(ele => ele.name === val.name));
        }, results[0]);

        return {
          // currently limiting this to fixed 0,20
          pokemon: pokemon.slice(offset, offset + limit),
          pages: pokemon.length / 20,
        };
      }
    },
    args: () => [this.filter, this.offset, this.limit],
  });

  private _filterChange(event: FilterChangeEvent) {
    this.filter = event.filters;
  }

  private _showFilter() {
    this._filterShown = !this._filterShown;
  }

  render() {
    return html`
      <div>
        ${this.headline !== '' ? html`<h1>${this.headline}</h1>` : null}
        <button @click=${this._showFilter} class="show-filter-button">
          Filter list
        </button>
        <div class="wrapper">
          <aside
            style=${this._filterShown ? 'display: block !important' : ''}
            class="filter"
          >
            <h2>Filter</h2>
            <h3>Type</h3>
            <filter-view @filter-change=${this._filterChange}></filter-view>
          </aside>
          <main class="pokemon-wrapper">
            ${this._pokemonTask.render({
              pending: () =>
                Array.from({ length: 6 }).map(
                  () => html`<pokemon-box loading=${true}></pokemon-box>`
                ),
              initial: () =>
                Array.from({ length: 6 }).map(
                  () => html`<pokemon-box loading=${true}></pokemon-box>`
                ),
              error: e => html`Error loading pokemons: ${e}.`,
              complete: result =>
                html`${result.pokemon.map(
                  pokemon =>
                    html` <pokemon-box url=${pokemon.url}></pokemon-box>`
                )}`,
            })}
          </main>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      max-width: 1920px;
      margin: 0 auto;
      padding: 2rem;
      display: inline-block;
      width: 100%;
    }

    aside {
      border: 0.125rem solid black;
      display: none;
    }

    .wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      align-items: start;
    }

    @media (width > 26rem) {
      .show-filter-button {
        display: none;
      }

      aside {
        display: block;
      }

      .wrapper {
        grid-template-columns: 12rem 1fr;
      }
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      text-align: left;
    }

    main {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7.8125rem, 1fr));
      gap: 0.5rem;
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'poke-list': PokeList;
  }
}

// todo: extract types into separate module
interface TypeResponse {
  pokemon: TypePokemon[];
}

interface TypePokemon {
  pokemon: {
    name: string;
    url: string;
  };
}

interface PokemonData {
  pages: number;
  pokemon: Pokemon[];
}

interface Pokemon {
  name: string;
  url: string;
}
