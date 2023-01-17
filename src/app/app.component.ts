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
          { search: string; type: number[]; ability: number[] },
          IPokemonDetail[]
        ]) => {
          // Première étape, faire en sorte que x  la recherche fonctionne
          let res = data;
          if (formValues.search != null) {
            let searchValue: string[] = formValues.search.split(' ');
            console.log(searchValue);

            searchValue.forEach((value: string) => {
              res = res.filter(
                (resFilt: IPokemonDetail) =>
                  resFilt.name.includes(value) ||
                  resFilt.types.find((resType: IPokemonType) =>
                    resType.type.name.includes(value)
                  ) ||
                  resFilt.abilities.find((resAbi: IAbility) =>
                    resAbi.ability.name.includes(value)
                  )
              );
            });
          }

          if (formValues.type?.filter((v: number) => !!v).length > 0) {
            res = res.filter((resFilt: IPokemonDetail) => {
              return !!resFilt.types.find((resid: IPokemonType) => {
                let id: number = +resid.type.url
                  .replace('https://pokeapi.co/api/v2/type/', '')
                  .replace('/', '');
                return formValues.type.find((res: number) => res === id);
              });
            });
          }

          console.log(formValues.ability);
          if (formValues.ability?.filter((v: number) => !!v).length > 0) {
            for (let value of formValues.ability.filter((v: number) => !!v)) {
              res = res.filter((resFilt: IPokemonDetail) => {
                return resFilt.abilities.find(
                  (resAbil: IAbility) =>
                    +resAbil.ability.url
                      .replace('https://pokeapi.co/api/v2/ability/', '')
                      .replace('/', '') === +value
                );
              });
            }
          }

          return res;
        }
      )
    );
  }
}
