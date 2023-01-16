import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable, startWith, take } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IAbility,
  IPokemonDetail,
  IPokemonType,
  ISelectOption,
} from './shared/models/poke.interface';
import { PokeService } from './shared/services/poke.services';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public formGroup = new FormGroup({
    search: new FormControl(),
    type: new FormControl(),
    ability: new FormControl(),
  });
  public typeOptions$: Observable<ISelectOption<number>[]>;
  public abilityOptions$: Observable<ISelectOption<number>[]>;
  public dataSource$: Observable<IPokemonDetail[]>;

  constructor(private pokeService: PokeService) {
    this.typeOptions$ = this.pokeService.getTypes();
    this.abilityOptions$ = this.pokeService.getAbilities();

    this.dataSource$ = combineLatest([
      this.formGroup.valueChanges.pipe(startWith(this.formGroup.getRawValue())),
      this.pokeService.hardcoreObservable(),
    ]).pipe(
      map(
        ([formValues, data]: [
          { search: string; type: number; ability: number },
          IPokemonDetail[]
        ]) => {
          console.log(formValues);
          // Première étape, faire en sorte que la recherche fonctionne
          let res = data;
          if (formValues.search != null) {
            res = res.filter(
              (resFilt: IPokemonDetail) =>
                resFilt.name.includes(formValues.search) ||
                resFilt.types.find((resType: IPokemonType) =>
                  resType.type.name.includes(formValues.search)
                ) ||
                resFilt.abilities.find((resAbi: IAbility) =>
                  resAbi.ability.name.includes(formValues.search)
                )
            );
          }

          if (formValues.type) {
            res = res.filter((resFilt: IPokemonDetail) => {
              return !!resFilt.types.find((resid: IPokemonType) => {
                return (
                  +resid.type.url
                    .replace('https://pokeapi.co/api/v2/type/', '')
                    .replace('/', '') === +formValues.type
                );
              });
            });
          }

          if (formValues.ability) {
            res = res.filter((resFilt: IPokemonDetail) => {
              return resFilt.abilities.find(
                (resAbil: IAbility) =>
                  +resAbil.ability.url
                    .replace('https://pokeapi.co/api/v2/ability/', '')
                    .replace('/', '') === +formValues.ability
              );
            });
          }

          return res;
        }
      )
    );
  }
}
