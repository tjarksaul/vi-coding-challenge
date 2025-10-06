import { customElement } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import { Task } from '@lit/task';
import { capitalize } from './utilities.ts';

@customElement('filter-view')
export class FilterView extends LitElement {
  private _typesTask = new Task<readonly [], Type[]>(this, {
    task: async ([], { signal }) => {
      // hard-coding to 25 here bc there are currently only 21 types
      const response = await fetch('https://pokeapi.co/api/v2/type/?limit=25', {
        signal,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      return data.results.map((type: Type) => ({ name: type.name }));
    },
    args: () => [],
  });

  private _selectedElements: Set<string> = new Set();

  private _onChange(e: Event) {
    const value = (e.target as HTMLInputElement)?.value;
    const isChecked = (e.target as HTMLInputElement)?.checked;
    if (isChecked) {
      this._selectedElements.add(value);
    } else {
      this._selectedElements.delete(value);
    }

    const event = new FilterChangeEvent([...this._selectedElements]);
    this.dispatchEvent(event);
  }

  render() {
    return this._typesTask.render({
      pending: () => html`Loading...`,
      complete: types => html`
        <ul class="filter-list">
          ${types.map(
            type =>
              html`<li>
                <input
                  @change=${this._onChange}
                  type="checkbox"
                  value=${type.name}
                  id="filter-${type.name}"
                /><label for="filter-${type.name}"
                  >${capitalize(type.name)}</label
                >
              </li>`
          )}
        </ul>
      `,
      error: () => html`Error loading types.`,
    });
  }

  static styles = css`
    .filter-list {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;

      > li,
      label {
        cursor: pointer;
      }
    }
  `;
}

// todo: extract types into separate module
interface Type {
  name: string;
}

export class FilterChangeEvent extends Event {
  public readonly filters: string[];

  constructor(filters: string[]) {
    super('filter-change');
    this.filters = filters;
  }
}
